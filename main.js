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
const boundFriction = 0.66;
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
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }

    cross(v)
    {
        return this.y * v.x - this.x * v.y;
    }

    add(v)
    {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v)
    {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    div(v)
    {
        return new Vector(this.x / v, this.y / v);
    }

    mul(v)
    {
        return new Vector(this.x * v, this.y * v);
    }

    equals(v)
    {
        return this.x == v.x && this.y == v.y;
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
        this.wx = wx;
        this.wy = wy;
    }

    checkCollideAABB(aabb, vx, vy)
    {
        let collide =
            this.checkCollide(aabb.x, aabb.y, aabb.x + vx, aabb.y + vy) ? new Vector(aabb.x, aabb.y) :
                this.checkCollide(aabb.X, aabb.y, aabb.X + vx, aabb.y + vy) ? new Vector(aabb.X, aabb.y) :
                    this.checkCollide(aabb.x, aabb.Y, aabb.x + vx, aabb.Y + vy) ? new Vector(aabb.x, aabb.Y) :
                        this.checkCollide(aabb.X, aabb.Y, aabb.X + vx, aabb.Y + vy) ? new Vector(aabb.X, aabb.Y) : undefined;

        if (collide != undefined)
            return { collide, endPoint: false };
        else
        {
            collide =
                aabb.checkCollidePoint(this.x0, this.y0) ? new Vector(this.x0, this.y0) :
                    aabb.checkCollidePoint(this.x1, this.y1) ? new Vector(this.x1, this.y1) : undefined;

            return { collide, endPoint: collide ? true : false }
        }
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
        let res = new Vector(this.y1 - this.y0, this.x0 - this.x1);
        res.normalize();

        return res;
    }

    convert()
    {
        return new Wall(this.level, this.x0, this.y0 + this.level * HEIGHT, this.wx, this.wy);
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

    collideToWall(s, r)
    {
        this.x = s.x;
        this.y = s.y;
        this.vx = r.x * boundFriction;
        this.vy = r.y;
        audios.bounce.start();
        // this.onGround = false;
    }

    update(delta)
    {
        //Apply previous acceleration
        this.vx *= globalFriction;
        this.vy *= globalFriction;
        if (Math.abs(this.vx) < 0.0001) this.vx = 0;
        if (Math.abs(this.vy) < 0.0001) this.vy = 0;
        this.x += this.vx;
        this.y += this.vy;

        let c;

        //Calculate current level
        level = Math.trunc(this.y / HEIGHT);

        // let moving = this.vx * this.vx + this.vy + this.vy;
        // let falling = this.vy < 0 ? true : false;

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

                if (c.side == undefined)
                    this.vx = -speed;
                else
                    this.vx = 0;
            }
            else if (keys.ArrowRight && !this.crouching)
            {
                c = this.testCollide(speed, 0);

                if (c.side == undefined)
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
        if (c.side == undefined)
        {
            this.vy -= gravity;
            this.onGround = false;
        }

        //Test if current acceleration make collision happen or not 
        c = this.testCollide(this.vx, this.vy);
        if (c.side != undefined)
        {
            if (c.side != 'error')
                this.reponseCollide(c);
        }

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

                w = w.convert();

                let r = w.checkCollideAABB(box, nvx, nvy);

                if (r.collide != undefined)
                {
                    side = 'wall';
                    let nv = new Vector(nvx, nvy);
                    let n;

                    if (!r.endPoint)
                    {
                        let hitPoint = getIntersect(w.x0, w.y0, w.x1, w.y1, r.collide.x, r.collide.y, r.collide.x + nvx, r.collide.y + nvy);

                        set = new Vector(box.x, box.y).add(hitPoint.sub(r.collide));
                        n = w.getNormal();

                    }
                    else
                    {
                        n = new Vector(w.x0, w.y0).sub(new Vector(w.x1, w.y1));
                        n.normalize();
                        set = new Vector(box.x, box.y).sub(nv.mul(3));
                    }

                    let ref = nv.sub(n.mul(2).mul(nv.dot(n)));
                    // let ref = nv.sub(n.mul(nv.dot(n)));

                    return { side, set, ref };
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
                this.collideToWall(c.set, c.ref);
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

    cvs.addEventListener('click', function (evt)
    {
        let mousePos = getMousePos(cvs, evt);
        let message = Math.trunc(mousePos.x) + ', ' + (HEIGHT - Math.trunc(mousePos.y));
        console.log(message);
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
    // player = new Player(150, HEIGHT * 7 + 400);

    initLevels();
}

//Make game levels
function initLevels()
{
    blocks.push(new Block(0, new AABB(100, 100, 150, 34)));
    blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
    blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
    blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
    blocks.push(new Block(0, new AABB(70, 620, 50, 34)));

    walls.push(new Wall(1, 200, 100, 0, 200));
    blocks.push(new Block(1, new AABB(0, 200, 34, 34)));
    blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(860, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

    blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
    blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
    blocks.push(new Block(2, new AABB(580, 480, 50, 50)));
    blocks.push(new Block(2, new AABB(878, 650, 50, 50)));

    blocks.push(new Block(3, new AABB(470, 10, 100, 34)));
    blocks.push(new Block(3, new AABB(46, 236, 100, 34)));
    walls.push(new Wall(3, 300, 280, 0, -34));
    walls.push(new Wall(3, 300, 400, 0, -34));
    walls.push(new Wall(3, 300, 400, -50, 150));
    walls.push(new Wall(3, 300, 246, -50, -150));
    walls.push(new Wall(3, 480, 550, 100, -15));
    walls.push(new Wall(3, 680, 520, 100, -15));
    blocks.push(new Block(3, new AABB(890, 450, 54, 34)));

    blocks.push(new Block(4, new AABB(390, 10, 90, 34)));
    blocks.push(new Block(4, new AABB(90, 20, 45, 200)));
    blocks.push(new Block(4, new AABB(510, 380, 45, 200)));
    blocks.push(new Block(4, new AABB(850, 715, 45, 85)));

    blocks.push(new Block(5, new AABB(850, 0, 45, 65)));
    blocks.push(new Block(5, new AABB(800, 200, 99, 34)));
    walls.push(new Wall(5, 480, 500, 50, -100));
    walls.push(new Wall(5, 390, 500, -50, -100));
    walls.push(new Wall(5, 340, 400, 0, -140));
    walls.push(new Wall(5, 530, 400, 0, -240));
    blocks.push(new Block(5, new AABB(340, 160, 190, 34)));
    blocks.push(new Block(5, new AABB(50, 160, 80, 34)));
    blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
    blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
    walls.push(new Wall(5, 87, 680, 50, 50));

    walls.push(new Wall(6, 200, 280, 50, -50));
    blocks.push(new Block(6, new AABB(50, 130, 80, 34)));
    walls.push(new Wall(6, 310, 380, 50, 50));
    blocks.push(new Block(6, new AABB(330, 130, 80, 34)));
    blocks.push(new Block(6, new AABB(410, 130, 34, 200)));
    walls.push(new Wall(6, 700, 140, 50, 0));
    blocks.push(new Block(6, new AABB(908, 265, 34, 34)));
    blocks.push(new Block(6, new AABB(555, 444, 34, 200)));
    blocks.push(new Block(6, new AABB(50, 650, 100, 34)));

    blocks.push(new Block(7, new AABB(100, 300, 100, 34)));
    blocks.push(new Block(7, new AABB(520, 430, 46, 34)));
    blocks.push(new Block(7, new AABB(877, 600, 46, 34)));
    walls.push(new Wall(7, 715, 430, 0, 300));
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
    if (level == 7)
    {
        gfx.fillText("Goal!", 880, HEIGHT - 700);
        gfx.fillText("↓", 890, HEIGHT - 680);
        gfx.fillText("Thanks for playing~", 810, HEIGHT - 550);
    }
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

function getIntersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    return new Vector(x, y);
}