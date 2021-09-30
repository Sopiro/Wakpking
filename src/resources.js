import { Constants } from "./constants.js";

export let images = {};
export let audios = {};

//Images 
images.normal = new Image();
images.normal.src = "./images/normal.png";
images.normal.onload = function () { Constants.resourceLoaded++; };
images.crouch = new Image();
images.crouch.src = "./images/crouch.png";
images.crouch.onload = function () { Constants.resourceLoaded++; };
images.wakdu = new Image();
images.wakdu.src = "./images/wakdu.png";
images.wakdu.onload = function () { Constants.resourceLoaded++; };
images.start = new Image();
images.start.src = "./images/start.png"
images.start.onload = function () { Constants.resourceLoaded++; };
images.start_o = new Image();
images.start_o.src = "./images/start-o.png"
images.start_o.onload = function () { Constants.resourceLoaded++; };
images.sett = new Image();
images.sett.src = "./images/sett.png"
images.sett.onload = function () { Constants.resourceLoaded++; };
images.sett_o = new Image();
images.sett_o.src = "./images/sett-o.png"
images.sett_o.onload = function () { Constants.resourceLoaded++; };
images.mode_normal = new Image();
images.mode_normal.src = "./images/mode_normal.png"
images.mode_normal.onload = function () { Constants.resourceLoaded++; };
images.mode_normal_o = new Image();
images.mode_normal_o.src = "./images/mode_normal-o.png"
images.mode_normal_o.onload = function () { Constants.resourceLoaded++; };
images.mode_hard = new Image();
images.mode_hard.src = "./images/mode_hard.png"
images.mode_hard.onload = function () { Constants.resourceLoaded++; };
images.mode_hard_o = new Image();
images.mode_hard_o.src = "./images/mode_hard-o.png"
images.mode_hard_o.onload = function () { Constants.resourceLoaded++; };
images.mode_jjin = new Image();
images.mode_jjin.src = "./images/mode_jjin.png"
images.mode_jjin.onload = function () { Constants.resourceLoaded++; };
images.mode_jjin_o = new Image();
images.mode_jjin_o.src = "./images/mode_jjin-o.png"
images.mode_jjin_o.onload = function () { Constants.resourceLoaded++; };
images.mode_sjjin = new Image();
images.mode_sjjin.src = "./images/mode_sjjin.png"
images.mode_sjjin.onload = function () { Constants.resourceLoaded++; };
images.mode_sjjin_o = new Image();
images.mode_sjjin_o.src = "./images/mode_sjjin-o.png"
images.mode_sjjin_o.onload = function () { Constants.resourceLoaded++; };
images.floor1 = new Image();
images.floor1.src = "./images/floor1.png"
images.floor1.onload = function () { Constants.resourceLoaded++; };
images.floor2 = new Image();
images.floor2.src = "./images/floor2.png"
images.floor2.onload = function () { Constants.resourceLoaded++; };
images.foothold = new Image();
images.foothold.src = "./images/foothold.png"
images.foothold.onload = function () { Constants.resourceLoaded++; };
images.chimha = new Image();
images.chimha.src = "./images/chimha.png"
images.chimha.onload = function () { Constants.resourceLoaded++; };
images.level = new Image();
images.level.src = "./images/level.png"
images.level.onload = function () { Constants.resourceLoaded++; };
images.level_o = new Image();
images.level_o.src = "./images/level-o.png"
images.level_o.onload = function () { Constants.resourceLoaded++; };
images.portal_off = new Image();
images.portal_off.src = "./images/portal-off.png"
images.portal_off.onload = function () { Constants.resourceLoaded++; };
images.portal_on = new Image();
images.portal_on.src = "./images/portal-on.png"
images.portal_on.onload = function () { Constants.resourceLoaded++; };
images.floor3 = new Image();
images.floor3.src = "./images/floor3.png"
images.floor3.onload = function () { Constants.resourceLoaded++; };
images.angel = new Image();
images.angel.src = "./images/angel.png"
images.angel.onload = function () { Constants.resourceLoaded++; };
images.goback = new Image();
images.goback.src = "./images/goback.png"
images.goback.onload = function () { Constants.resourceLoaded++; };
images.goback_o = new Image();
images.goback_o.src = "./images/goback-o.png"
images.goback_o.onload = function () { Constants.resourceLoaded++; };
images.normal_chim = new Image();
images.normal_chim.src = "./images/normal_chim.png"
images.normal_chim.onload = function () { Constants.resourceLoaded++; };
images.crouch_chim = new Image();
images.crouch_chim.src = "./images/crouch_chim.png"
images.crouch_chim.onload = function () { Constants.resourceLoaded++; };
images.foothold_chim = new Image();
images.foothold_chim.src = "./images/foothold_chim.png"
images.foothold_chim.onload = function () { Constants.resourceLoaded++; };

//Audios
audios.landing = new Audio();
audios.landing.src = "./audios/landing.wav";
audios.bounce = new Audio();
audios.bounce.src = "./audios/bounce.wav";
audios.jump = new Audio();
audios.jump.src = "./audios/jump2.wav";
audios.bgm = new Audio();
audios.bgm.src = "./audios/bgm.mp3";
audios.bgm.addEventListener('ended', function () { this.currentTime = 0; this.play(); }, false);
audios.ah1 = new Audio();
audios.ah1.src = "./audios/ah1.ogg";
audios.ah2 = new Audio();
audios.ah2.src = "./audios/ah2.ogg";
audios.ah3 = new Audio();
audios.ah3.src = "./audios/ah3.ogg";
audios.okgo = new Audio();
audios.okgo.src = "./audios/okgo.ogg";
audios.um = new Audio();
audios.um.src = "./audios/um.ogg";
audios.tp = new Audio();
audios.tp.src = "./audios/tp.ogg";
audios.omat = new Audio();
audios.omat.src = "./audios/omat.ogg";
audios.ah_chim = new Audio();
audios.ah_chim.src = "./audios/ah_chim.ogg";

audios.landing.start = function ()
{
    if (Constants.isMuted) return;
    audios.landing.volume = Constants.volume;
    audios.landing.currentTime = 0;
    audios.landing.play();
};
audios.bounce.start = function ()
{
    if (Constants.isMuted) return;
    audios.bounce.volume = Constants.volume;
    audios.bounce.currentTime = 0;
    audios.bounce.play();
};
audios.jump.start = function ()
{
    if (Constants.isMuted) return;
    audios.jump.volume = Constants.volume;
    audios.jump.currentTime = 0;
    audios.jump.play();
};
audios.bgm.start = function ()
{
    if (Constants.isMuted) return;
    audios.bgm.volume = Constants.bgmVolume;
    audios.bgm.currentTime = 0;
    audios.bgm.play();
};
audios.ah1.start = function ()
{
    if (Constants.isMuted) return;
    audios.ah1.volume = Constants.volume;
    audios.ah1.currentTime = 0;
    audios.ah1.play();
};
audios.ah2.start = function ()
{
    if (Constants.isMuted) return;
    audios.ah2.volume = Constants.volume;
    audios.ah2.currentTime = 0;
    audios.ah2.play();
};
audios.ah3.start = function ()
{
    if (Constants.isMuted) return;
    audios.ah3.volume = Constants.volume;
    audios.ah3.currentTime = 0;
    audios.ah3.play();
};
audios.okgo.start = function ()
{
    if (Constants.isMuted) return;
    audios.okgo.volume = Constants.volume;
    audios.okgo.currentTime = 0;
    audios.okgo.play();
};
audios.um.start = function ()
{
    if (Constants.isMuted) return;
    audios.um.volume = Constants.volume;
    audios.um.currentTime = 0;
    audios.um.play();
};
audios.tp.start = function ()
{
    if (Constants.isMuted) return;
    audios.tp.volume = Constants.volume;
    audios.tp.currentTime = 0;
    audios.tp.play();
};
audios.omat.start = function ()
{
    if (Constants.isMuted) return;
    audios.omat.volume = Constants.volume;
    audios.omat.currentTime = 0;
    audios.omat.play();
};
audios.ah_chim.start = function ()
{
    if (Constants.isMuted) return;
    audios.ah_chim.volume = Constants.volume;
    audios.ah_chim.currentTime = 0;
    audios.ah_chim.play();
};