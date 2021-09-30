import { AABB } from "./aabb.js";
import { Block } from "./block.js";
import { Wall } from "./wall.js";
import { Constants } from "./constants.js";
import { MainScene } from "./scenes/mainscene.js";
import { EndScene } from "./scenes/endscene.js";
import { LevelScene } from "./scenes/levelscene.js";
import { SettScene } from "./scenes/settscene.js";
import { Player } from "./player.js";
import * as Input from "./input.js";
import * as Resources from "./resources.js";

export class Game
{
    constructor()
    {
        this.previousTime = 0;
        this.currentTime = 0;
        this.passedTime = 0;
        this.msPerFrame = 1000.0 / 144.0;

        this.character = 0;
        this.gameMode = 0;
        this.scenes = [];
        this.lastScene = 0;
        this.scene = 0;
        this.level = 0;
        this.levelMax = 0;

        this.cvs;
        this.gfx;
        this.mute;

        this.guideMsg = '[←, →]로 움직이고 [space]로 점프';
        this.guideMsg2 = '[↑]로 체크포인트 먹고 [↓]로 설치';
        this.guideMsg3 = 'Esc 누르면 설정창';

        this.blocks = [];
        this.walls = [];

    }

    start()
    {
        this.init();
        this.run();
    }

    init()
    {
        this.cvs = document.getElementById("cvs");
        this.gfx = this.cvs.getContext("2d");
        this.gfx.font = "20px Georgia";
        this.gfx.lineWidth = 2;
        this.mute = document.getElementById("mute");

        function keyDown(e)
        {
            Input.currKeys[e.key] = true;
        }

        function keyUp(e)
        {
            Input.currKeys[e.key] = false;
        }

        document.onkeydown = keyDown;
        document.onkeyup = keyUp;

        this.cvs.addEventListener("mousedown", (e) =>
        {
            if (e.button != 0) return;

            Input.mouse.curr_down = true;
        }, false);
        window.addEventListener("mouseup", (e) =>
        {
            if (e.button != 0) return;

            Input.mouse.curr_down = false;
        }, false);
        window.addEventListener("mousemove", (e) =>
        {
            let rect = cvs.getBoundingClientRect();

            Input.mouse.currX = Math.trunc(e.clientX - rect.left);
            Input.mouse.currY = Math.trunc(e.clientY - rect.top);
        });

        mute.addEventListener('click', function (e)
        {
            this.isMuted = !this.isMuted;

            if (!this.isMuted)
                Resources.audios.bgm.start();
            else if (isMuted)
                Resources.audios.bgm.pause();
        }, false);

        this.previousTime = new Date().getTime();

        this.player = new Player(this.gfx, this);

        this.scenes.main = new MainScene(this.gfx, this);
        this.scenes.level = new LevelScene(this.gfx, this);
        this.scenes.sett = new SettScene(this.gfx, this);
        this.scenes.end = new EndScene(this.gfx, this);
    }

    //Make game levels
    initLevels()
    {
        this.blocks = [];
        this.walls = [];

        if (this.gameMode == -1)
        {
            this.blocks.push(new Block(0, new AABB(100, 100, 150, 34)));
            this.blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
            this.blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
            this.blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
            this.blocks.push(new Block(0, new AABB(70, 620, 50, 34)));

            this.walls.push(new Wall(1, 200, 100, 0, 200));
            this.blocks.push(new Block(1, new AABB(0, 200, 48, 34)));
            this.blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
            this.blocks.push(new Block(1, new AABB(860, 200, 60, 34)));
            this.blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

            this.blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
            this.blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
            this.blocks.push(new Block(2, new AABB(540, 400, 60, 180)));
            this.blocks.push(new Block(2, new AABB(800, 480, 60, 180)));

            this.blocks.push(new Block(3, new AABB(460, 10, 110, 34)));
            this.blocks.push(new Block(3, new AABB(46, 236, 100, 34)));
            this.walls.push(new Wall(3, 300, 400, -50, 150));
            this.walls.push(new Wall(3, 300, 246, -50, -150));
            this.walls.push(new Wall(3, 480, 550, 100, -15));
            this.walls.push(new Wall(3, 680, 520, 100, -15));
            this.blocks.push(new Block(3, new AABB(890, 450, 54, 34)));

            this.blocks.push(new Block(4, new AABB(390, 10, 90, 34)));
            this.blocks.push(new Block(4, new AABB(90, 20, 45, 200)));
            this.blocks.push(new Block(4, new AABB(510, 380, 45, 200)));
            this.blocks.push(new Block(4, new AABB(850, 715, 45, 85)));

            this.blocks.push(new Block(5, new AABB(850, 0, 45, 65)));
            this.blocks.push(new Block(5, new AABB(800, 200, 99, 34)));
            this.walls.push(new Wall(5, 480, 500, 50, -100));
            this.walls.push(new Wall(5, 390, 500, -50, -100));
            this.walls.push(new Wall(5, 340, 400, 0, -140));
            this.walls.push(new Wall(5, 530, 400, 0, -240));
            this.blocks.push(new Block(5, new AABB(340, 160, 190, 34)));
            this.blocks.push(new Block(5, new AABB(50, 160, 80, 34)));
            this.blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
            this.blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
            this.walls.push(new Wall(5, 87, 680, 50, 50));

            this.walls.push(new Wall(6, 200, 280, 50, -50));
            this.blocks.push(new Block(6, new AABB(50, 130, 80, 34)));
            this.walls.push(new Wall(6, 310, 380, 50, 50));
            this.blocks.push(new Block(6, new AABB(330, 130, 80, 34)));
            this.blocks.push(new Block(6, new AABB(410, 130, 34, 200)));
            this.walls.push(new Wall(6, 700, 140, 50, 0));
            this.blocks.push(new Block(6, new AABB(908, 265, 34, 34)));
            this.blocks.push(new Block(6, new AABB(555, 444, 34, 200)));
            this.blocks.push(new Block(6, new AABB(50, 650, 100, 34)));

            this.blocks.push(new Block(7, new AABB(100, 300, 100, 34)));
            this.blocks.push(new Block(7, new AABB(520, 430, 46, 34)));
            this.blocks.push(new Block(7, new AABB(877, 600, 46, 34)));
            this.walls.push(new Wall(7, 715, 430, 0, 300));

            this.blocks.push(new Block(8, new AABB(0, 150, 500, 34)));
        }
        else
        {
            this.blocks.push(new Block(0, new AABB(100, 100, 150, 34)));
            this.blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
            this.blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
            this.blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
            this.blocks.push(new Block(0, new AABB(0, 620, 100, 34)));

            this.walls.push(new Wall(1, 200, 100, 0, 200));
            this.blocks.push(new Block(1, new AABB(0, 200, 48, 34)));
            this.blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
            this.blocks.push(new Block(1, new AABB(860, 200, 140, 34)));
            this.blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

            this.blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
            this.blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
            this.blocks.push(new Block(2, new AABB(540, 400, 100, 55)));
            this.blocks.push(new Block(2, new AABB(800, 480, 120, 120)));

            this.blocks.push(new Block(3, new AABB(430, 34, 150, 34)));
            this.blocks.push(new Block(3, new AABB(46, 236, 100, 34)));
            // this.walls.push(new Wall(3, 300, 280, 0, -34));
            // this.walls.push(new Wall(3, 300, 400, 0, -34));
            this.walls.push(new Wall(3, 300, 400, -50, 150));
            this.walls.push(new Wall(3, 300, 246, -50, -150));
            this.walls.push(new Wall(3, 480, 550, 100, -15));
            this.walls.push(new Wall(3, 680, 520, 100, -15));
            this.blocks.push(new Block(3, new AABB(890, 450, 110, 34)));

            this.blocks.push(new Block(4, new AABB(390, 10, 90, 34)));
            this.blocks.push(new Block(4, new AABB(90, 20, 120, 50)));
            this.blocks.push(new Block(4, new AABB(400, 300, 51, 200)));
            this.blocks.push(new Block(4, new AABB(520, 280, 51, 200)));
            this.blocks.push(new Block(4, new AABB(850, 615, 56, 85)));

            this.blocks.push(new Block(5, new AABB(700, 200, 120, 55)));
            this.walls.push(new Wall(5, 340, 600, 0, -100));
            this.walls.push(new Wall(5, 530, 400, 0, -240));
            this.blocks.push(new Block(5, new AABB(410, 160, 120, 34)));
            this.blocks.push(new Block(5, new AABB(50, 160, 80, 34)));
            this.blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
            this.blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
            this.walls.push(new Wall(5, 87, 680, 50, 50));

            this.walls.push(new Wall(6, 200, 280, 50, -50));
            this.blocks.push(new Block(6, new AABB(50, 130, 80, 34)));
            this.walls.push(new Wall(6, 310, 380, 50, 50));
            this.blocks.push(new Block(6, new AABB(330, 130, 80, 34)));
            this.blocks.push(new Block(6, new AABB(410, 130, 34, 200)));
            this.walls.push(new Wall(6, 680, 140, 70, 0));
            this.blocks.push(new Block(6, new AABB(908, 245, 54, 34)));
            this.blocks.push(new Block(6, new AABB(515, 540, 120, 34)));
            this.blocks.push(new Block(6, new AABB(50, 650, 100, 34)));

            this.blocks.push(new Block(7, new AABB(120, 300, 100, 34)));
            this.blocks.push(new Block(7, new AABB(520, 430, 46, 34)));
            this.blocks.push(new Block(7, new AABB(877, 600, 46, 34)));
            this.walls.push(new Wall(7, 715, 430, 0, 300));

            this.blocks.push(new Block(8, new AABB(0, 150, 500, 34)));
        }
    }

    run(time)
    {
        let currentTime = new Date().getTime();
        this.passedTime += currentTime - this.previousTime;
        this.previousTime = currentTime;

        while (this.passedTime >= this.msPerFrame)
        {
            this.update(this.msPerFrame);
            this.render();
            this.passedTime -= this.msPerFrame;
        }

        requestAnimationFrame(this.run.bind(this));
    }

    update(delta)
    {
        switch (this.scene)
        {
            case 0:
                {
                    this.scenes.main.update(performance.now() / 400.0);
                    break;
                }
            case 1:
                {
                    this.scenes.level.update();
                    break;
                }
            case 2:
                {
                    if (Input.currKeys.Escape && !Input.lastKeys.Escape)
                    {
                        Resources.audios.bgm.pause();
                        this.changeScene(3);
                    }
                    this.player.update(delta);
                    break;
                }
            case 3:
                {
                    this.scenes.sett.update();
                    break;
                }
            case 4:
                {
                    this.scenes.end.update();
                    break;
                }
        }

        Input.mouse.dx = Input.mouse.currX - Input.mouse.lastX;
        Input.mouse.dy = Input.mouse.currY - Input.mouse.lastY;
        Input.mouse.lastX = Input.mouse.currX;
        Input.mouse.lastY = Input.mouse.currY;
        Input.mouse.last_down = Input.mouse.curr_down;

        Object.assign(Input.lastKeys, Input.currKeys);
    }

    render()
    {
        if (Constants.resourceLoaded != Constants.numResource)
            return;

        this.gfx.clearRect(0, 0, Constants.WIDTH, Constants.HEIGHT);

        switch (this.scene)
        {
            case 0:
                {
                    this.scenes.main.render();
                    break;
                }
            case 1:
                {
                    this.scenes.level.render();
                    break;
                }
            case 2:
                {
                    switch (this.level)
                    {
                        case 0:
                            this.gfx.drawImage(Resources.images.floor1, 0, 0);
                            break;

                        case 7:
                            this.gfx.drawImage(Resources.images.floor3, 0, 0);
                            break;
                        case 8:
                            this.gfx.fillStyle = "#F7FEFF";
                            this.gfx.rect(0, 0, Constants.WIDTH, Constants.HEIGHT);
                            this.gfx.fill();
                            this.gfx.fillStyle = "#000000";
                            break;
                        default:
                            this.gfx.drawImage(Resources.images.floor2, 0, 0);
                            break;
                    }

                    this.player.render();

                    this.blocks.forEach(b =>
                    {
                        if (b.level != this.level) return;

                        this.drawAABB(b.aabb);
                    });

                    this.walls.forEach(w =>
                    {
                        if (w.level != this.level) return;

                        this.drawWall(w);
                    });

                    if (this.levelMax == 0)
                    {
                        this.gfx.font = "28px Independence_hall"
                        this.gfx.fillText("올라 가즈아~↑", 20, 50);
                        this.gfx.fillText(this.guideMsg, 550, Constants.HEIGHT - 145);
                        this.gfx.fillText(this.guideMsg2, 550, Constants.HEIGHT - 105);
                        this.gfx.fillText(this.guideMsg3, 550, Constants.HEIGHT - 65);
                    }
                    if (this.level == 7)
                    {
                        this.gfx.font = "28px Independence_hall"
                        this.gfx.fillText("/구해줘!\\", 100, Constants.HEIGHT - 750);
                    } else if (this.level == 8)
                    {
                        this.gfx.drawImage(Resources.images.angel, 50, Constants.HEIGHT - 300, 100, -125);
                        this.gfx.fillStyle = "hotpink";
                        this.gfx.font = "114px Independence_hall"
                        this.gfx.fillText("♥", 45, Constants.HEIGHT - 230);
                        this.gfx.fillStyle = "#000000";
                    }
                    break;
                }
            case 3:
                {
                    this.scenes.sett.render();
                    break;
                }
            case 4:
                {
                    this.scenes.end.render();
                    break;
                }
        }
    }

    changeScene(nextScene)
    {
        this.lastScene = this.scene;
        this.scene = nextScene;

        if (nextScene == 2)
        {
            if (this.lastScene != 3)
            {
                this.player.reset();
            }
            this.resetGame();
            Resources.audios.okgo.start();
            Resources.audios.bgm.start();
        }
        if (this.lastScene == 2 && nextScene != 4)
        {
            Resources.audios.bgm.pause();
        }
        if (nextScene == 4)
        {
            this.scenes.end.start();
        }
    }

    resetGame()
    {
        this.initLevels();

        this.guideMsg = '[←, →]로 움직이고 [space]로 점프';
        this.guideMsg2 = '[↑]로 체크포인트 먹고 [↓]로 설치';
        this.guideMsg3 = 'Esc 누르면 설정창';

        this.levelMax = 0;
        this.level = 0;
        if (this.gameMode != 2)
        {
            this.guideMsg2 = this.guideMsg3;
            this.guideMsg3 = "";
        }
    }

    drawWall(wall)
    {
        this.gfx.beginPath();
        this.gfx.moveTo(wall.x0, Constants.HEIGHT - wall.y0);
        this.gfx.lineTo(wall.x1, Constants.HEIGHT - wall.y1);
        this.gfx.stroke();
    }

    drawAABB(aabb)
    {
        this.drawBlock(aabb.x, aabb.y, aabb.width, aabb.height);
    }

    drawBlock(x, y, w, h)
    {
        this.drawRect(x, y, w, h);

        if (this.character != 0)
            this.gfx.drawImage(Resources.images.foothold_chim, 0, 0, w, 100 + h, x + 5, Constants.HEIGHT - y - 5, w - 10, -h + 10);
        else
            this.gfx.drawImage(Resources.images.foothold, 0, 0, w, 100 + h, x + 5, Constants.HEIGHT - y - 5, w - 10, -h + 10);
    }

    drawRect(x, y, w, h)
    {
        this.gfx.beginPath();
        this.gfx.rect(x, Constants.HEIGHT - y, w, -h);
        this.gfx.fill();
    }
}