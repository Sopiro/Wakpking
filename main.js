'use strict'

let cvs;
let gfx;
let mute;

const WIDTH = 1000;
const HEIGHT = 800;
let volume = 0.3;
let bgmVolume = 0.3;
let guideMsg = '[←, →]로 움직이고 [space]로 점프';
let guideMsg2 = '';
let isMuted = false;
let isTouch = false;

let d = new Date();
let previousTime = 0;
let currentTime = 0;
let passedTime = 0;
let msPerFrame = 1000.0 / 144.0;

const numResource = 19;
let resourceLoaded = 0;

let images = {};
let audios = {};
let keys = {};
let blocks = [];
let walls = [];

let mouse = { last_down: false, curr_down: false, lastX: 0.0, lastY: 0.0, currX: 0.0, currY: 0.0, dx: 0.0, dy: 0.0 };

const speed = 2.7;
const gravity = 0.19;
const globalFriction = 0.996;
const groundFriction = 0.88;
const sideJump = 5.1;
const boundFriction = 0.66;
const JumpConst = 15.0;
const chargingConst = 600.0;

let gameMode = 0;
let scenes = [];
let scene = 0;
let player;
let level = 0;
let levelMax = 0;

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

        this.rs = 64;
        this.dir = 1;

        this.lastHeight = 0;
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
        if (isTouch)
        {
            keys.ArrowLeft = false;
            keys.ArrowRight = false;
        }
        console.log();

        let gap = this.lastHeight - this.y;

        if (gap >= 300)
        {
            let r = Math.trunc(Math.random() * 3);

            switch (r)
            {
                case 0:
                    audios.ah1.start();

                    break;

                case 1:
                    audios.ah2.start();

                    break;
                case 2:
                    audios.ah3.start();

                    break;
                default:
                    break;
            }
        }
        else
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
        levelMax = level > levelMax ? level : levelMax;

        // let moving = this.vx * this.vx + this.vy + this.vy;
        // let falling = this.vy < 0 ? true : false;

        if (this.onGround)
        {
            this.vx *= groundFriction;

            if (this.onGround)
            {
                if (keys.ArrowLeft) this.dir = 1;
                if (keys.ArrowRight) this.dir = -1;
            }

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

                this.lastHeight = this.y;
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
        gfx.save();
        gfx.translate(this.x - 16, HEIGHT - this.rs - this.y + level * HEIGHT)
        gfx.scale(1 * this.dir, 1);
        gfx.drawImage(images[this.getDrawImage()], 0, 0, this.rs * this.dir, this.rs);
        gfx.restore();

        gfx.beginPath();
        gfx.rect(941, HEIGHT - 779, 52, -14);
        gfx.stroke();
        drawRect(942, 780, Math.trunc(player.jumpGauge * 50), 12);
    }
}

class MainScene
{
    constructor()
    {
        this.titlePos = 0;
        this.start_img = images.start;
        this.sett_img = images.sett;

        this.btnStartX = (WIDTH - 435) / 2.0;
        this.btnEndX = (WIDTH - 435) / 2.0 + 435;
        this.halfHeight = HEIGHT / 2.0;
    }

    update(time)
    {
        this.titlePos = Math.sin(time) * 10;

        if (mouse.currX > this.btnStartX && mouse.currX <= this.btnEndX)
        {
            if (mouse.currY > this.halfHeight + 46 && mouse.currY <= this.halfHeight + 46 + 109)
            {
                if (this.start_img == images.start)
                {

                }
                if (!mouse.curr_down && mouse.last_down)
                {
                    scene = 1;
                }
                this.start_img = images.start_o;
            }
            else if (mouse.currY > this.halfHeight + 46 + 120 && mouse.currY <= this.halfHeight + 46 + 109 + 120)
            {
                if (this.sett_img == images.sett)
                {

                }
                if (!mouse.curr_down && mouse.last_down)
                {
                    scene = 3;
                }
                this.sett_img = images.sett_o;
            }
            else
            {
                this.start_img = images.start;
                this.sett_img = images.sett;
            }
        }
        else
        {
            this.start_img = images.start;
            this.sett_img = images.sett;
        }
    }

    render()
    {
        // gfx.save();
        // gfx.translate(100, 100);
        // gfx.drawImage(images.normal, 0, 0, 100, 100);
        // gfx.restore();

        // gfx.save();
        // gfx.translate(900, 100);
        // gfx.scale(-1, 1);
        // gfx.drawImage(images.normal, 0, 0, 100, 100);
        // gfx.restore();

        gfx.drawImage(images.wakdu, (WIDTH - 600) / 2.0, 350);
        gfx.drawImage(images.title, (WIDTH - 800) / 2.0, this.titlePos);
        gfx.drawImage(this.start_img, (WIDTH - 435) / 2.0, HEIGHT / 2.0);
        gfx.drawImage(this.sett_img, (WIDTH - 435) / 2.0, HEIGHT / 2.0 + 120);
    }
}

class LevelScene
{
    constructor()
    {
        this.normal_img = images.mode_normal;
        this.jjin_img = images.mode_jjin;
        this.sjjin_img = images.mode_sjjin;

        this.btnStartX = (WIDTH - 435) / 2.0;
        this.btnEndX = (WIDTH - 435) / 2.0 + 435;
        this.halfHeight = HEIGHT / 2.0;
    }

    update(time)
    {
        if (mouse.currX > this.btnStartX && mouse.currX <= this.btnEndX)
        {
            if (mouse.currY > this.halfHeight + 46 - 120 && mouse.currY <= this.halfHeight + 46 + 109 - 120)
            {
                if (this.start_img == images.start)
                {

                }
                if (!mouse.curr_down && mouse.last_down)
                {
                    gameMode = 0;
                    scene = 2;
                    audios.bgm.start();
                }
                this.normal_img = images.mode_normal_o;
            }
            else if (mouse.currY > this.halfHeight + 46 && mouse.currY <= this.halfHeight + 46 + 109)
            {
                if (this.sett_img == images.sett)
                {

                }
                if (!mouse.curr_down && mouse.last_down)
                {
                    gameMode = 1;
                    scene = 2;
                    audios.bgm.start();
                }
                this.jjin_img = images.mode_jjin_o;
            }
            else if (mouse.currY > this.halfHeight + 46 + 120 && mouse.currY <= this.halfHeight + 46 + 109 + 120)
            {
                if (this.sett_img == images.sett)
                {

                }
                if (!mouse.curr_down && mouse.last_down)
                {
                    gameMode = 2;
                    scene = 2;
                    audios.bgm.start();
                }
                this.sjjin_img = images.mode_sjjin_o;
            }
            else
            {
                this.normal_img = images.mode_normal;
                this.jjin_img = images.mode_jjin;
                this.sjjin_img = images.mode_sjjin;
            }
        }
        else
        {
            this.normal_img = images.mode_normal;
            this.jjin_img = images.mode_jjin;
            this.sjjin_img = images.mode_sjjin;
        }
    }

    render()
    {
        gfx.drawImage(images.chimha, 80, 600);
        gfx.drawImage(images.chimha, 380, 600);
        gfx.drawImage(images.chimha, 680, 600);
        gfx.drawImage(images.level, (WIDTH - 800) / 2.0, 0);
        gfx.drawImage(this.normal_img, (WIDTH - 435) / 2.0, HEIGHT / 2.0 - 120);
        gfx.drawImage(this.jjin_img, (WIDTH - 435) / 2.0, HEIGHT / 2.0);
        gfx.drawImage(this.sjjin_img, (WIDTH - 435) / 2.0, HEIGHT / 2.0 + 120);
    }
}

class SettScene
{
    constructor()
    {

    }

    update()
    {

    }

    render()
    {

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
    mute = document.getElementById("mute");

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
        guideMsg = 'Touch bottom left, right side to move';
        guideMsg2 = 'Touch top left, right, middle side to jump';
    }

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;

    cvs.addEventListener("mousedown", (e) =>
    {
        if (e.button != 0) return;

        mouse.curr_down = true;
    }, false);
    window.addEventListener("mouseup", (e) =>
    {
        if (e.button != 0) return;

        mouse.curr_down = false;
    }, false);
    window.addEventListener("mousemove", (e) =>
    {
        let rect = cvs.getBoundingClientRect();

        mouse.currX = Math.trunc(e.clientX - rect.left);
        mouse.currY = Math.trunc(e.clientY - rect.top);
    });

    cvs.addEventListener('touchstart', function (e)
    {
        let pos = getTouchPos(cvs, e);

        if (pos.x < WIDTH / 2 && pos.y < HEIGHT / 2)
        {
            keys.ArrowLeft = true;
        }
        else if (pos.x >= WIDTH / 2 && pos.y < HEIGHT / 2)
        {
            keys.ArrowRight = true;
        }
        else if (pos.x < WIDTH / 5 * 2 && pos.y >= HEIGHT / 2)
        {
            keys[' '] = true;
            keys.ArrowLeft = true;
        }
        else if (pos.x >= WIDTH / 5 * 3 && pos.y >= HEIGHT / 2)
        {
            keys[' '] = true;
            keys.ArrowRight = true;
        }
        else if (pos.x >= WIDTH / 5 * 2 && pos.x < WIDTH / 5 * 3 && pos.y >= HEIGHT / 2)
        {
            keys[' '] = true;
        }

        isTouch = true;
    }, false);

    cvs.addEventListener('touchend', function (e)
    {
        if (!keys[' '])
        {
            keys.ArrowLeft = false;
            keys.ArrowRight = false;
        }
        else
            keys[' '] = false;
    }, false);

    mute.addEventListener('click', function (e)
    {
        isMuted = !isMuted;
    }, false);

    previousTime = new Date().getTime();

    //Images 
    images.normal = new Image();
    images.normal.src = "./images/normal.png";
    images.normal.onload = function () { resourceLoaded++; };
    images.crouch = new Image();
    images.crouch.src = "./images/crouch.png";
    images.crouch.onload = function () { resourceLoaded++; };
    images.title = new Image();
    images.title.src = "./images/title.png";
    images.title.onload = function () { resourceLoaded++; };
    images.wakdu = new Image();
    images.wakdu.src = "./images/wakdu.png";
    images.wakdu.onload = function () { resourceLoaded++; };
    images.start = new Image();
    images.start.src = "./images/start.png"
    images.start.onload = function () { resourceLoaded++; };
    images.start_o = new Image();
    images.start_o.src = "./images/start-o.png"
    images.start_o.onload = function () { resourceLoaded++; };
    images.sett = new Image();
    images.sett.src = "./images/sett.png"
    images.sett.onload = function () { resourceLoaded++; };
    images.sett_o = new Image();
    images.sett_o.src = "./images/sett-o.png"
    images.sett_o.onload = function () { resourceLoaded++; };
    images.level = new Image();
    images.level.src = "./images/level.png"
    images.level.onload = function () { resourceLoaded++; };
    images.mode_normal = new Image();
    images.mode_normal.src = "./images/mode_normal.png"
    images.mode_normal.onload = function () { resourceLoaded++; };
    images.mode_normal_o = new Image();
    images.mode_normal_o.src = "./images/mode_normal-o.png"
    images.mode_normal_o.onload = function () { resourceLoaded++; };
    images.mode_jjin = new Image();
    images.mode_jjin.src = "./images/mode_jjin.png"
    images.mode_jjin.onload = function () { resourceLoaded++; };
    images.mode_jjin_o = new Image();
    images.mode_jjin_o.src = "./images/mode_jjin-o.png"
    images.mode_jjin_o.onload = function () { resourceLoaded++; };
    images.mode_sjjin = new Image();
    images.mode_sjjin.src = "./images/mode_sjjin.png"
    images.mode_sjjin.onload = function () { resourceLoaded++; };
    images.mode_sjjin_o = new Image();
    images.mode_sjjin_o.src = "./images/mode_sjjin-o.png"
    images.mode_sjjin_o.onload = function () { resourceLoaded++; };
    images.floor1 = new Image();
    images.floor1.src = "./images/floor1.png"
    images.floor1.onload = function () { resourceLoaded++; };
    images.floor2 = new Image();
    images.floor2.src = "./images/floor2.png"
    images.floor2.onload = function () { resourceLoaded++; };
    images.foothold = new Image();
    images.foothold.src = "./images/foothold.png"
    images.foothold.onload = function () { resourceLoaded++; };
    images.chimha = new Image();
    images.chimha.src = "./images/chimha.png"
    images.chimha.onload = function () { resourceLoaded++; };

    //Audios
    audios.landing = new Audio();
    audios.landing.src = "./audios/landing.wav";
    audios.landing.volume = volume;
    audios.bounce = new Audio();
    audios.bounce.src = "./audios/bounce.wav";
    audios.bounce.volume = volume;
    audios.jump = new Audio();
    audios.jump.src = "./audios/jump2.wav";
    audios.jump.volume = volume;
    audios.bgm = new Audio();
    audios.bgm.src = "./audios/bgm.mp3";
    audios.bgm.volume = bgmVolume;
    audios.bgm.addEventListener('ended', function () { this.currentTime = 0; this.play(); }, false);
    audios.ah1 = new Audio();
    audios.ah1.src = "./audios/ah1.ogg";
    audios.ah1.volume = volume;
    audios.ah2 = new Audio();
    audios.ah2.src = "./audios/ah2.ogg";
    audios.ah2.volume = volume;
    audios.ah3 = new Audio();
    audios.ah3.src = "./audios/ah3.ogg";
    audios.ah3.volume = volume;

    audios.landing.start = function ()
    {
        if (isMuted) return;
        audios.landing.pause();
        audios.landing.currentTime = 0;
        audios.landing.play();
    };
    audios.bounce.start = function ()
    {
        if (isMuted) return;
        audios.bounce.pause();
        audios.bounce.currentTime = 0;
        audios.bounce.play();
    };
    audios.jump.start = function ()
    {
        if (isMuted) return;
        audios.jump.pause();
        audios.jump.currentTime = 0;
        audios.jump.play();
    };
    audios.bgm.start = function ()
    {
        if (isMuted) return;
        audios.bgm.pause();
        audios.bgm.currentTime = 0;
        audios.bgm.play();
    };
    audios.ah1.start = function ()
    {
        if (isMuted) return;
        audios.ah1.pause();
        audios.ah1.currentTime = 0;
        audios.ah1.play();
    };
    audios.ah2.start = function ()
    {
        if (isMuted) return;
        audios.ah2.pause();
        audios.ah2.currentTime = 0;
        audios.ah2.play();
    };
    audios.ah3.start = function ()
    {
        if (isMuted) return;
        audios.ah3.pause();
        audios.ah3.currentTime = 0;
        audios.ah3.play();
    };

    player = new Player((WIDTH - 32) / 2.0, 0);
    // player = new Player(833, HEIGHT * 2 + 690);

    scenes.main = new MainScene();
    scenes.level = new LevelScene();
    scenes.sett = new SettScene();

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
    blocks.push(new Block(1, new AABB(0, 200, 48, 34)));
    blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(860, 200, 60, 34)));
    blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

    blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
    blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
    blocks.push(new Block(2, new AABB(540, 400, 60, 180)));
    blocks.push(new Block(2, new AABB(800, 480, 60, 180)));

    blocks.push(new Block(3, new AABB(460, 10, 110, 34)));
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
    switch (scene)
    {
        case 0:
            {
                scenes.main.update(performance.now() / 400.0);
                break;
            }
        case 1:
            {
                scenes.level.update();
                break;
            }
        case 2:
            {
                player.update(delta);
                break;
            }
        case 3:
            {
                scenes.sett.update();
                break;
            }
    }

    mouse.dx = mouse.currX - mouse.lastX;
    mouse.dy = mouse.currY - mouse.lastY;
    mouse.lastX = mouse.currX;
    mouse.lastY = mouse.currY;
    mouse.last_down = mouse.curr_down;
}

function render()
{
    if (resourceLoaded != numResource)
        return;

    gfx.clearRect(0, 0, WIDTH, HEIGHT);

    switch (scene)
    {
        case 0:
            {
                scenes.main.render();
                break;
            }
        case 1:
            {
                scenes.level.render();
                break;
            }
        case 2:
            {
                if (level == 0)
                    gfx.drawImage(images.floor1, 0, 0);
                else
                    gfx.drawImage(images.floor2, 0, 0);

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

                if (levelMax == 0)
                {
                    gfx.fillText("올라 가즈아~", 550, HEIGHT - 80);
                    gfx.fillText(guideMsg, 550, HEIGHT - 45);
                    gfx.fillText(guideMsg2, 550, HEIGHT - 25);
                }
                if (level == 7)
                {
                    gfx.fillText("Goal!", 880, HEIGHT - 700);
                    gfx.fillText("↓", 890, HEIGHT - 680);
                    gfx.fillText("Thanks for playing~", 810, HEIGHT - 550);
                }
                break;
            }
        case 3:
            {
                scenes.sett.render();
            }
            break;
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
    drawRect(x, y, w, h);
    gfx.drawImage(images.foothold, 0, 0, w, 100 + h, x + 5, HEIGHT - y - 5, w - 10, -h + 10);
}

function drawRect(x, y, w, h)
{
    gfx.beginPath();
    gfx.rect(x, HEIGHT - y, w, -h);
    gfx.fill();
}

function getMousePos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.trunc(evt.clientX - rect.left),
        y: HEIGHT - Math.trunc(evt.clientY - rect.top)
    };
}

function getTouchPos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.trunc(evt.touches[0].clientX - rect.left),
        y: HEIGHT - Math.trunc(evt.touches[0].clientY - rect.top)
    };
}

function getIntersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    return new Vector(x, y);
}