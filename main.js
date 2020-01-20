var cvs;
var gfx;

const WIDTH = 1000;
const HEIGHT = 800;

var d = new Date();
var previousTime = 0;
var currentTime = 0;
var passedTime = 0;
var msPerFrame = 1000.0 / 144.0;

const numResource = 2;
var resourceLoaded = 0;

var images = {};
var audios = {};
var keys = {};
var blocks = [];

const speed = 2.7;
const gravity = 0.19;
const globalFriction = 0.996;
const groundFriction = 0.88;
const sideJump = 5.1;
const boundFriction = 0.55;
const JumpConst = 15.0;
const chargingConst = 600.0;

var palyer;
var level = 0;

class AABB
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.X = x + w;
        this.Y = y + h;
        this.width = w;
        this.height = h;
    }

    checkCollidePoint(px, py)
    {
        if (px > this.x && px < this.X && py > this.y && py < this.Y)
            return true;
        else
            return false;
    }

    checkCollideBox(aabb)
    {
        var rlb = this.checkCollidePoint(aabb.x, aabb.y);
        var rrb = this.checkCollidePoint(aabb.X, aabb.y);
        var rlt = this.checkCollidePoint(aabb.x, aabb.Y);
        var rrt = this.checkCollidePoint(aabb.X, aabb.Y);

        var res =
        {
            collide: rlb || rrb || rlt || rrt,
            lb: rlb,
            rb: rrb,
            lt: rlt,
            rt: rrt,
        };

        return res;
    }

    move(dx, dy)
    {
        this.x += dx;
        this.y += dy;
        this.X += dx;
        this.Y += dy;
    }
}

class Block
{
    constructor(level, aabb)
    {
        this.level = level;
        this.aabb = aabb;
    }

    convert()
    {
        return new AABB(this.aabb.x, this.aabb.y + this.level * HEIGHT, this.aabb.width, this.aabb.height);
    }
}

class Player
{
    constructor(x, y)
    {
        this.crouching = false;
        this.onGround = true;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 32;
        this.jumpGauge = 0;
    }

    aabb()
    {
        return new AABB(this.x, this.y, this.size, this.size);
    }

    getDrawImage()
    {
        if (this.crouching)
            return 'crouch';
        else
            return 'normal';
    }

    collideToLeft(w)
    {
        this.x = w;
        this.vx *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToRight(w)
    {
        this.x = w - this.size;
        this.vx *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToTop(w)
    {
        this.y = w - this.size;
        this.vy *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToBottom(w)
    {
        this.onGround = true;
        this.y = w;
        this.vx = 0;
        this.vy = 0;
        audios.landing.start();
    }

    update(delta)
    {
        this.vx *= globalFriction;
        this.vy *= globalFriction;
        if (Math.abs(this.vx) < 0.0001) this.vx = 0;
        if (Math.abs(this.vy) < 0.0001) this.vy = 0;
        this.x += this.vx;
        this.y += this.vy;

        var c = this.testCollide(this.vx, this.vy);
        if (c.side) this.reponseCollide(c);

        //Calculate current level
        level = Math.trunc(this.y / HEIGHT);

        var moving = this.vx * this.vx + this.vy + this.vy;
        var falling = this.vy < 0 ? true : false;

        if (this.onGround)
        {
            this.vx *= groundFriction;

            if (keys[' '] && !this.crouching)
            {
                this.crouching = true;
            }
            else if (keys[' '] && this.crouching)
            {
                this.jumpGauge >= 1 ? this.jumpGauge = 1 : this.jumpGauge += delta / chargingConst;
            }
            else if (keys.ArrowLeft && !this.crouching)
            {
                c = this.testCollide(-speed, 0);
                if (!c.side)
                    this.vx = -speed;
                else
                    this.vx = 0;
            }
            else if (keys.ArrowRight && !this.crouching)
            {
                c = this.testCollide(speed, 0);
                if (!c.side)
                    this.vx = speed;
                else
                    this.vx = 0;
            }
            else if (!keys[' '] && this.crouching)
            {
                if (keys.ArrowLeft) this.vx = -sideJump;
                else if (keys.ArrowRight) this.vx = sideJump;
                audios.jump.start();

                this.vy = this.jumpGauge * JumpConst;
                this.jumpGauge = 0;
                this.onGround = false;
                this.crouching = false;
            }
        }

        //Apply gravity
        c = this.testCollide(0, -gravity);
        if (!c.side) this.vy -= gravity;

    }

    testCollide(nvx, nvy)
    {
        var side;
        var set;

        var box = this.aabb();
        box.move(nvx, nvy);

        if (box.x < 0)
        {
            side = 'left';
            set = 0;
        }
        else if (box.X > WIDTH)
        {
            side = 'right';
            set = WIDTH;
        }
        else if (box.y < 0)
        {
            side = 'bottom';
            set = 0;
        }
        else
        {
            for (var b of blocks)
            {
                if (b.level != level) continue;

                var aabb = b.convert();
                var r = aabb.checkCollideBox(box);

                if (r.collide)
                {
                    if (r.lb && r.lt)
                    {
                        side = 'left';
                        set = aabb.X;
                    }
                    else if (r.rb && r.rt)
                    {
                        side = 'right';
                        set = aabb.x;
                    }
                    else if (r.lb && r.rb)
                    {
                        side = 'bottom';
                        set = aabb.Y;
                    }
                    else if (r.lt && r.rt)
                    {
                        side = 'top';
                        set = aabb.y;
                    }
                    else if (r.lb)
                    {
                        var bx = box.x - this.vx;
                        if (bx > aabb.X)
                        {
                            side = 'left';
                            set = aabb.X;
                        }
                        else
                        {
                            side = 'bottom';
                            set = aabb.Y;
                        }
                    }
                    else if (r.rb)
                    {
                        var bx = box.X - this.vx;
                        if (bx < aabb.x)
                        {
                            side = 'right';
                            set = aabb.x;
                        }
                        else
                        {
                            side = 'bottom';
                            set = aabb.Y;
                        }
                    }
                    else if (r.lt)
                    {
                        var bx = box.x - this.vx;
                        if (bx > aabb.X)
                        {
                            side = 'left';
                            set = aabb.X;
                        }
                        else
                        {
                            side = 'top';
                            set = aabb.y;
                        }
                    }
                    else if (r.rt)
                    {
                        var bx = box.X - this.vx;
                        if (bx < aabb.x)
                        {
                            side = 'right';
                            set = aabb.x;
                        }
                        else
                        {
                            side = 'top';
                            set = aabb.y;
                        }
                    }
                }
            }
        }

        return { side, set };
    }

    reponseCollide(c)
    {
        switch (c.side)
        {
            case 'left':
                this.collideToLeft(c.set);
                break;
            case 'right':
                this.collideToRight(c.set);
                break;
            case 'bottom':
                this.collideToBottom(c.set);
                break;
            case 'top':
                this.collideToTop(c.set);
                break;
        }
    }

    render()
    {
        gfx.drawImage(images[this.getDrawImage()], this.x, HEIGHT - this.size - this.y + level * HEIGHT, this.size, this.size);
    }
}

window.onload = function ()
{
    init();
    run();
};

function init()
{
    cvs = document.getElementById("cvs");
    gfx = cvs.getContext("2d");
    gfx.font = "20px Georgia";

    cvs.addEventListener('mousemove', function (evt)
    {
        var mousePos = getMousePos(cvs, evt);
        var message = Math.trunc(mousePos.x) + ', ' + (HEIGHT - Math.trunc(mousePos.y));
        // console.log(message);
    }, false);

    previousTime = new Date().getTime();

    //Images 
    images.normal = new Image();
    images.normal.src = "./normal.png";
    images.normal.onload = function () { resourceLoaded++; };
    images.crouch = new Image();
    images.crouch.src = "./crouch.png";
    images.crouch.onload = function () { resourceLoaded++; };

    //Audios
    audios.landing = new Audio();
    audios.landing.src = "./landing.wav";
    audios.landing.volume = 0.4;
    audios.bounce = new Audio();
    audios.bounce.src = "./bounce.wav";
    audios.bounce.volume = 0.4;
    audios.jump = new Audio();
    audios.jump.src = "./jump.wav";
    audios.jump.volume = 0.4;

    audios.landing.start = function ()
    {
        audios.landing.pause();
        audios.landing.currentTime = 0;
        audios.landing.play();
    };
    audios.bounce.start = function ()
    {
        audios.bounce.pause();
        audios.bounce.currentTime = 0;
        audios.bounce.play();
    };
    audios.jump.start = function ()
    {
        audios.jump.pause();
        audios.jump.currentTime = 0;
        audios.jump.play();
    };

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;

    player = new Player((WIDTH - 32) / 2.0, 0);
    // player = new Player(900, 800 * 2 + 700);

    //Add Blocks
    blocks.push(new Block(0, new AABB(100, 100, 150, 34)));
    blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
    blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
    blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
    blocks.push(new Block(0, new AABB(70, 620, 50, 34)));

    blocks.push(new Block(1, new AABB(200, 100, 34, 200)));
    blocks.push(new Block(1, new AABB(0, 200, 34, 34)));
    blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(860, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

    blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
    blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
    blocks.push(new Block(2, new AABB(580, 480, 50, 50)));
    blocks.push(new Block(2, new AABB(878, 650, 50, 50)));
}

function keyDown(e)
{
    keys[e.key] = true;
    // console.log(e);
}

function keyUp(e)
{
    keys[e.key] = false;
}

function run(time)
{
    var currentTime = new Date().getTime();
    passedTime += currentTime - previousTime;
    previousTime = currentTime;

    while (passedTime >= msPerFrame)
    {
        update(msPerFrame);
        render();
        passedTime -= msPerFrame;
    }

    requestAnimationFrame(run);
}

function update(delta)
{
    player.update(delta);
}

function render()
{
    if (resourceLoaded != numResource)
        return;

    gfx.clearRect(0, 0, WIDTH, HEIGHT);

    player.render();

    blocks.forEach(b =>
    {
        if (b.level != level) return;

        drawAABB(b.aabb);
    });

    if (level == 0)
    {
        gfx.fillText("Let's go up!", 550, HEIGHT - 80);
    }
    if (level == 2)
        gfx.fillText("Goal!", 880, HEIGHT - 750);
}

function drawAABB(aabb)
{
    drawBlock(aabb.x, aabb.y, aabb.width, aabb.height);
}

function drawBlock(x, y, w, h)
{
    gfx.beginPath();
    gfx.rect(x, HEIGHT - y, w, -h);
    gfx.fill();
}

function getMousePos(canvas, evt)
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}