var cvs;
var gfx;

var width = 640;
var height = 480;

var d = new Date();
var previousTime = 0;
var currentTime = 0;

var fps = 1000.0 / 144.0;

var previousTime = 0;
var passedTime = 0;

var numResource = 1;
var resourceLoaded = 0;

var player = new Image();

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
    player.src = "./player.png";
    player.onload = function () { resourceLoaded++ };
}

function run(time)
{
    var currentTime = new Date().getTime();
    passedTime += currentTime - previousTime;
    previousTime = currentTime;

    if (passedTime >= fps)
    {
        update();
        render();
        passedTime -= fps;
    }

    requestAnimationFrame(run);
}

function update()
{
}

function render()
{
    if(resourceLoaded < numResource)
        return;

    console.log("ad");

    gfx.clearRect(0, 0, width, height);

    gfx.drawImage(player, 100, 100);

}
