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

var keys = [];

const gravity = 0.19;
const friction = 0.996;
const sideJump = 5.1;
const boundFriction = 0.9;
const playerSize = 32;

var player =
{
    normal: new Image(),
    crouch: new Image(),
    speed: 1,
    crouching: false,
    onGround: true,
    ax: 0,
    ay: 0,
    vx: 0,
    vy: 0,
    x: (WIDTH - playerSize) / 2.0,
    y: 0,
    getDrawImage: function ()
    {
        if (this.crouching)
            return this.crouch
        else
            return this.normal;
    },
    jumpGauge: 0
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

    player.normal.src = "./normal.png";
    player.normal.onload = function () { resourceLoaded++; };
    player.crouch.src = "./crouch.png";
    player.crouch.onload = function () { resourceLoaded++; };

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
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

    console.log(player.vx);

    if (player.x <= 0)
    {
        player.x = 0;
        player.vx *= -1 * boundFriction;
    }
    if (player.x >= WIDTH - playerSize)
    {
        player.x = WIDTH - playerSize;
        player.vx *= -1 * boundFriction;
    }

    if (player.y <= 0)
    {
        player.onGround = true;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
        player.ax = 0;
        player.ay = 0;
    }

    if (!player.onGround)
        player.vy -= gravity;

    if (player.onGround && keys[' '] && !player.crouching)
        player.crouching = true;

    if (player.onGround && keys[' '] && player.crouching)
    {
        player.jumpGauge >= 1 ? player.jumpGauge = 1 : player.jumpGauge += delta / 500.0;
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
    gfx.drawImage(player.getDrawImage(), player.x, HEIGHT - playerSize - player.y, playerSize, playerSize);

}
