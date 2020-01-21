let cvs;
let gfx;

const WIDTH = 1000;
const HEIGHT = 800;
const volume = 0.3;

let d = new Date();
let previousTime = 0;
let currentTime = 0;
let passedTime = 0;
let msPerFrame = 1000.0 / 144.0;

const numResource = 2;
let resourceLoaded = 0;

let images = {};
let audios = {};
let keys = {};
let blocks = [];
let walls = [];

const speed = 2.7;
const gravity = 0.19;
const globalFriction = 0.996;
const groundFriction = 0.88;
const sideJump = 5.1;
const boundFriction = 0.55;
const JumpConst = 15.0;
const chargingConst = 600.0;

let palyer;
let level = 0;

class Vector
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    normalize()
    {
        let len = this.getLength();

        this.x /= len;
        this.y /= len;
    }

    getLength()
    {
        return Math.sqrt(this.x * this.x + this.y + this.y);
    }

    dot(v)
    {
        return this.x * v.x + this.y + v.y;
    }
}

class Wall
{
    constructor(level, x0, y0, wx, wy)
    {
        this.level = level;
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x0 + wx;
        this.y1 = y0 + wy;
    }

    checkCollide(ax, ay, bx, by)
    {
        let z0 = (this.x1 - this.x0) * (ay - this.y0) - (this.y1 - this.y0) * (ax - this.x0);
        let z1 = (this.x1 - this.x0) * (by - this.y1) - (this.y1 - this.y0) * (bx - this.x1);

        let z2 = (bx - ax) * (this.y0 - ay) - (by - ay) * (this.x0 - ax);
        let z3 = (bx - ax) * (this.y1 - by) - (by - ay) * (this.x1 - bx);

        return (z0 * z1) < 0 && (z2 * z3) < 0;
    }

    getNormal()
    {
        let vx = this.y1 - this.y0;
        let vy = this.x0 - this.x1;

        let len = Math.sqrt(vx * vx + vy * vy);

        let res =
        {
            x: vx / len,
            y: vy / len
        };

        return res;
    }
}

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
        let rlb = this.checkCollidePoint(aabb.x, aabb.y);
        let rrb = this.checkCollidePoint(aabb.X, aabb.y);
        let rlt = this.checkCollidePoint(aabb.x, aabb.Y);
        let rrt = this.checkCollidePoint(aabb.X, aabb.Y);

        let res =
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
        this.radius = this.size / 2.0 * 1.414;
        this.jumpGauge = 0;
    }

    aabb()
    {
        return new AABB(this.x, this.y, this.size, this.size);
    }

    getCenter()
    {
        let res =
        {
            x: this.x + this.size / 2,
            y: this.y + this.size / 2
        }

        return res;
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

    collideToWall(ref)
    {
        // console.log(this.vx, this.vy, ref);
        
        this.vx = ref.x;
        this.vy = ref.y;
    }

    update(delta)
    {
        this.vx *= globalFriction;
        this.vy *= globalFriction;
        if (Math.abs(this.vx) < 0.0001) this.vx = 0;
        if (Math.abs(this.vy) < 0.0001) this.vy = 0;
        this.x += this.vx;
        this.y += this.vy;

        let c = this.testCollide(this.vx, this.vy);
        if (c.side) this.reponseCollide(c);

        //Calculate current level
        level = Math.trunc(this.y / HEIGHT);

        let moving = this.vx * this.vx + this.vy + this.vy;
        let falling = this.vy < 0 ? true : false;

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
        let side;
        let set;

        let box = this.aabb();
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
            for (let b of blocks)
            {
                if (b.level != level) continue;

                let aabb = b.convert();
                let r = aabb.checkCollideBox(box);

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
                        let bx = box.x - this.vx;
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
                        let bx = box.X - this.vx;
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
                        let bx = box.x - this.vx;
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
                        let bx = box.X - this.vx;
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

                    return { side, set };
                }
            }

            for (let w of walls)
            {
                if (w.level != level) continue;

                let cp = this.getCenter();

                if (w.checkCollide(cp.x, cp.y, cp.x + nvx, cp.y + nvy))
                {
                    side = 'wall';
                    set = 0;

                    let n = w.getNormal();

                    let ref =
                    {
                        x : nvx - 2 * n.x * (nvx * n.x + nvy * n.y),
                        y : nvy - 2 * n.y * (nvx * n.x + nvy * n.y)
                    }

                    let rv = new Vector(ref.x, ref.y);
                    // rv.normalize();

                    return { side, rv };
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
            case 'wall':
                this.collideToWall(c.rv);
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
    gfx.lineWidth = 2;

    cvs.addEventListener('mousemove', function (evt)
    {
        let mousePos = getMousePos(cvs, evt);
        let message = Math.trunc(mousePos.x) + ', ' + (HEIGHT - Math.trunc(mousePos.y));
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
    audios.landing.volume = volume;
    audios.bounce = new Audio();
    audios.bounce.src = "./bounce.wav";
    audios.bounce.volume = volume;
    audios.jump = new Audio();
    audios.jump.src = "./jump2.wav";
    audios.jump.volume = volume;

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

    walls.push(new Wall(0, 700, 100, 100, 100));
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
    let currentTime = new Date().getTime();
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

    walls.forEach(w =>
    {
        if (w.level != level) return;

        drawWall(w);
    });

    if (level == 0)
    {
        gfx.fillText("Let's go up!", 550, HEIGHT - 80);
    }
    if (level == 2)
        gfx.fillText("Goal!", 880, HEIGHT - 750);
}

function drawWall(wall)
{
    gfx.beginPath();
    gfx.moveTo(wall.x0, HEIGHT - wall.y0);
    gfx.lineTo(wall.x1, HEIGHT - wall.y1);
    gfx.stroke();
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
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}