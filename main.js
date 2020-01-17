var cvs;
var gfx;

const WIDTH = 1000;
const HEIGHT = 800;

var d = new Date();
var previousTime = 0;
var currentTime = 0;
var passedTime = 0;
var msPerFrame = 1000.0 / 144.0;

var numResource = 2;
var resourceLoaded = 0;

var images = [];
var keys = [];

const gravity = 0.19;
const friction = 0.996;
const sideJump = 5.1;
const boundFriction = 0.55;

var palyer;

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
        if (px >= this.x && px <= this.X && py >= this.y && py <= this.Y)
            return true;
        else
            return false;
    }

    checkCollideBox(aabb)
    {
        return this.checkCollidePoint(aabb.x, aabb.y) ||
            this.checkCollidePoint(aabb.X, aabb.y) ||
            this.checkCollidePoint(aabb.x, aabb.Y) ||
            this.checkCollidePoint(aabb.X, aabb.Y);
    }
}

class Player
{
    constructor(x, y)
    {
        this.speed = 1;
        this.crouching = false;
        this.onGround = true;
        this.x = x;
        this.y = y;
        this.ax = 0;
        this.ay = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 32;
        this.aabb = new AABB(x, y, this.size, this.size);
        this.jumpGauge = 0;
    }

    getDrawImage()
    {
        if (this.crouching)
            return 'crouch';
        else
            return 'normal';
    }

    collideToLeft()
    {
        player.x = 0;
        player.vx *= -1 * boundFriction;
    }
    collideToRight()
    {
        player.x = WIDTH - playerSize;
        player.vx *= -1 * boundFriction;
    }
    collideToTop()
    {

    }
    collideToBottom()
    {
        player.onGround = true;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
        player.ax = 0;
        player.ay = 0;
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

    images['normal'] = new Image();
    images['crouch'] = new Image();

    images['normal'].src = "./normal.png";
    images['normal'].onload = function () { resourceLoaded++; };
    images['crouch'].src = "./crouch.png";
    images['crouch'].onload = function () { resourceLoaded++; };

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;

    player = new Player((WIDTH - 32) / 2.0, 0);
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
    player.vx += player.ax;
    player.vx *= friction;
    player.x += player.vx;

    player.vy += player.ay;
    player.vy *= friction;
    player.y += player.vy;

    if (player.x <= 0)
    {
        player.collideToLeft();
    }
    if (player.X >= WIDTH)
    {
        player.collideToRight();
    }

    if (player.y <= 0)
    {
        player.collideToBottom();
    }

    if (!player.onGround)
        player.vy -= gravity;

    if (player.onGround && keys[' '] && !player.crouching)
        player.crouching = true;

    if (player.onGround && keys[' '] && player.crouching)
    {
        player.jumpGauge >= 1 ? player.jumpGauge = 1 : player.jumpGauge += delta / 600.0;
    }

    if (player.onGround && !keys[' '] && player.crouching)
    {
        if (keys['ArrowLeft']) player.vx -= sideJump;
        if (keys['ArrowRight']) player.vx += sideJump;
        player.vy = player.jumpGauge * 15;
        player.jumpGauge = 0;
        player.onGround = false;
        player.crouching = false;
    }
}

function render()
{
    if (resourceLoaded != numResource)
        return;

    gfx.clearRect(0, 0, WIDTH, HEIGHT);
    gfx.drawImage(images[player.getDrawImage()], player.x, HEIGHT - player.size - player.y, player.size, player.size);

    drawAABB(new AABB(100, 100, 200, 50));

    console.log(new AABB(100, 100, 200, 50).checkCollideBox(new AABB(300, 151, 100, 100)));
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
