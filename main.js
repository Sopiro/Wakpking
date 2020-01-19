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

var images = [];
var keys = [];
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
    }

    collideToRight(w)
    {
        this.x = w - this.size;
        this.vx *= -1 * boundFriction;
    }

    collideToTop(w)
    {
        this.y = w - this.size;
        this.vy *= -1 * boundFriction;
    }

    collideToBottom(w)
    {
        this.onGround = true;
        this.y = w;
        this.vx = 0;
        this.vy = 0;
    }

    update(delta)
    {
        this.vx *= globalFriction;
        this.x += this.vx;

        this.vy *= globalFriction;
        this.y += this.vy;

        if (this.onGround)
        {
            this.vx *= groundFriction;

            if (keys[' '] && !this.crouching)
            {
                this.crouching = true;
            }

            if (keys[' '] && this.crouching)
            {
                this.jumpGauge >= 1 ? this.jumpGauge = 1 : this.jumpGauge += delta / chargingConst;
            }

            if (keys['ArrowLeft'] && !this.crouching)
            {
                this.vx = -speed;
            }
            if (keys['ArrowRight'] && !this.crouching)
            {
                this.vx = speed;
            }

            if (!keys[' '] && this.crouching)
            {
                if (keys['ArrowLeft']) this.vx = -sideJump;
                if (keys['ArrowRight']) this.vx = sideJump;

                this.vy = this.jumpGauge * JumpConst;
                this.jumpGauge = 0;
                this.onGround = false;
                this.crouching = false;
            }
        }

        var moving = (this.vx * this.vx + this.vy * this.vy) != 0 ? true : false;

        if (moving)
        {
            this.vy -= gravity;
        }

        level = Math.trunc(this.y / HEIGHT);

        //Collision test for box
        var box = this.aabb();

        //Collision test for world
        if (box.x < 0)
            this.collideToLeft(0);
        else if (box.X > WIDTH)
            this.collideToRight(WIDTH);
        else if (box.y < 0)
            this.collideToBottom(0);
        else
        {
            blocks.forEach(b =>
            {
                if (b.level != level) return;

                var aabb = b.convert();
                var r = aabb.checkCollideBox(box);

                if (r.collide)
                {
                    if (r.lb && r.lt)
                        this.collideToLeft(aabb.X);
                    else if (r.rb && r.rt)
                        this.collideToRight(aabb.x);
                    else if (r.lb && r.rb)
                        this.collideToBottom(aabb.Y);
                    else if (r.lt && r.rt)
                        this.collideToTop(aabb.y);
                    else if (r.lb)
                    {
                        var bx = box.x - this.vx;
                        if (bx > aabb.X)
                            this.collideToLeft(aabb.X);
                        else
                            this.collideToBottom(aabb.Y);
                    }
                    else if (r.rb)
                    {
                        var bx = box.X - this.vx;
                        if (bx < aabb.x)
                            this.collideToRight(aabb.x);
                        else
                            this.collideToBottom(aabb.Y);
                    }
                    else if (r.lt)
                    {
                        var bx = box.x - this.vx;
                        if (bx > aabb.X)
                            this.collideToLeft(aabb.X);
                        else
                            this.collideToTop(aabb.y);
                    }
                    else if (r.rt)
                    {
                        var bx = box.X - this.vx;
                        if (bx < aabb.x)
                            this.collideToRight(aabb.x);
                        else
                            this.collideToTop(aabb.y);
                    }
                }
            });
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

    previousTime = new Date().getTime();

    //Images 
    images['normal'] = new Image();
    images['normal'].src = "./normal.png";
    images['normal'].onload = function () { resourceLoaded++; };

    images['crouch'] = new Image();
    images['crouch'].src = "./crouch.png";
    images['crouch'].onload = function () { resourceLoaded++; };

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;

    player = new Player((WIDTH - 32) / 2.0, 0);

    //Add Blocks
    blocks.push(new Block(0, new AABB(100, 100, 150, 34)));
    blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
    blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
    blocks.push(new Block(0, new AABB(826, 410, 34, 370)));
    blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
    blocks.push(new Block(0, new AABB(70, 620, 50, 34)));
    blocks.push(new Block(0, new AABB(70, 780, 790, 34)));

    blocks.push(new Block(1, new AABB(70, 0, 790, 34)));
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
