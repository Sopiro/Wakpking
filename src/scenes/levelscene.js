import * as Resources from "../resources.js";
import { Constants } from "../constants.js";
import * as Input from "../input.js";
import {Scene} from "./scene.js";

export class LevelScene extends Scene
{
    constructor(gfx, game)
    {
        super(gfx, game);

        this.hard_img = Resources.images.mode_hard;
        this.normal_img = Resources.images.mode_normal;
        this.jjin_img = Resources.images.mode_jjin;
        this.sjjin_img = Resources.images.mode_sjjin;

        this.btnStartX = (Constants.WIDTH - 360) / 2.0;
        this.btnEndX = (Constants.WIDTH - 360) / 2.0 + 360;
        this.heightBase = Constants.HEIGHT / 2.0 + 30;
    }

    update(time)
    {
        if (!Input.lastKeys.Escape && Input.currKeys.Escape)
        {
            this.game.changeScene(this.game.lastScene);
        }

        if (Input.mouse.currX > this.btnStartX && Input.mouse.currX <= this.btnEndX)
        {
            if (Input.mouse.currY > this.heightBase + 46 - 240 && Input.mouse.currY <= this.heightBase + 46 + 109 - 240)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.gameMode = -1;
                    this.game.changeScene(2);
                }
                this.hard_img = Resources.images.mode_hard_o;
            }
            else if (Input.mouse.currY > this.heightBase + 46 - 120 && Input.mouse.currY <= this.heightBase + 46 + 109 - 120)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.gameMode = 0;
                    this.game.changeScene(2);
                }
                this.normal_img = Resources.images.mode_normal_o;
            }
            else if (Input.mouse.currY > this.heightBase + 46 && Input.mouse.currY <= this.heightBase + 46 + 109)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.gameMode = 1;
                    this.game.changeScene(2);

                }
                this.jjin_img = Resources.images.mode_jjin_o;
            }
            else if (Input.mouse.currY > this.heightBase + 46 + 120 && Input.mouse.currY <= this.heightBase + 46 + 109 + 120)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.gameMode = 2;
                    this.game.changeScene(2);
                }
                this.sjjin_img = Resources.images.mode_sjjin_o;
            }
            else
            {
                this.hard_img = Resources.images.mode_hard;
                this.normal_img = Resources.images.mode_normal;
                this.jjin_img = Resources.images.mode_jjin;
                this.sjjin_img = Resources.images.mode_sjjin;
            }
        }
        else
        {
            this.hard_img = Resources.images.mode_hard;
            this.normal_img = Resources.images.mode_normal;
            this.jjin_img = Resources.images.mode_jjin;
            this.sjjin_img = Resources.images.mode_sjjin;
        }
    }

    render()
    {
        this.gfx.drawImage(Resources.images.chimha, 80, 600);
        this.gfx.drawImage(Resources.images.chimha, 380, 600);
        this.gfx.drawImage(Resources.images.chimha, 680, 600);

        this.gfx.font = "120px Independence_hall"
        this.gfx.fillText("난이도", (Constants.WIDTH - 300) / 2.0, 160);

        const renderStart = (Constants.WIDTH - 435) / 2.0;

        this.gfx.drawImage(this.hard_img, renderStart, this.heightBase - 240);
        this.gfx.drawImage(this.normal_img, renderStart, this.heightBase - 120);
        this.gfx.drawImage(this.jjin_img, renderStart, this.heightBase);
        this.gfx.drawImage(this.sjjin_img, renderStart, this.heightBase + 120);
    }
}