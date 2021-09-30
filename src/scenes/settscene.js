import * as Resources from "../resources.js";
import { Constants } from "../constants.js";
import * as Input from "../input.js";

export class SettScene
{
    constructor(gfx, game)
    {
        this.gfx = gfx;
        this.game = game;
        this.barWidth = 300;
        this.barHeight = 2;

        this.barStart = (Constants.WIDTH - this.barWidth) / 2.0 + 10;

        this.barHeightBase = Constants.HEIGHT / 2.0;
        this.barGap = 50;

        this.handleWidth = 10;
        this.handleHeight = 30;
        this.handle1 = Constants.volume;
        this.handle2 = Constants.bgmVolume;

        this.grab1 = false;
        this.grab2 = false;

        this.level_img = Resources.images.level;
        this.goback_img = Resources.images.goback;

        this.btnStartX = (Constants.WIDTH - 360) / 2.0;
        this.btnEndX = (Constants.WIDTH - 360) / 2.0 + 360;
        this.btnHeightBase = this.barHeightBase + 70;
    }

    update()
    {
        // console.log(Input.mouse.currY);

        if (Input.currKeys.Escape && !Input.lastKeys.Escape)
        {
            this.game.changeScene(this.game.lastScene);
            return;
        }

        if (Input.mouse.currX >= this.barStart && Input.mouse.currX < this.barStart + this.barWidth)
        {
            if (Input.mouse.currY >= this.barHeightBase - this.handleHeight / 2.0 && Input.mouse.currY < this.barHeightBase + this.handleHeight / 2.0)
            {
                if (!Input.mouse.last_down && Input.mouse.curr_down)
                    this.grab1 = true;

            }

            if (Input.mouse.currY >= this.barHeightBase - this.handleHeight / 2.0 + this.barGap && Input.mouse.currY < this.barHeightBase + this.handleHeight / 2.0 + this.barGap)
            {
                if (!Input.mouse.last_down && Input.mouse.curr_down)
                    this.grab2 = true;

            }
        }

        if (Input.mouse.last_down && !Input.mouse.curr_down)
        {
            this.grab1 = false;
            this.grab2 = false;
        }

        if (this.grab1)
        {
            let per = (Input.mouse.currX - this.barStart) / this.barWidth;

            this.handle1 = Math.max(Math.min(per, 1.0), 0.0);
            Constants.volume = this.handle1;
        }
        else if (this.grab2)
        {
            let per = (Input.mouse.currX - this.barStart) / this.barWidth;

            this.handle2 = Math.max(Math.min(per, 1.0), 0.0);
            Constants.bgmVolume = this.handle2;
        }

        if (Input.mouse.currX > this.btnStartX && Input.mouse.currX <= this.btnEndX)
        {
            if (Input.mouse.currY > this.btnHeightBase + 46 && Input.mouse.currY <= this.btnHeightBase + 46 + 109)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.changeScene(1);
                }
                this.level_img = Resources.images.level_o;
            }
            else if (Input.mouse.currY > this.btnHeightBase + 46 + 120 && Input.mouse.currY <= this.btnHeightBase + 46 + 109 + 120)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.changeScene(this.game.lastScene);
                }
                this.goback_img = Resources.images.goback_o;
            }
            else
            {
                this.level_img = Resources.images.level;
                this.goback_img = Resources.images.goback;
            }
        }
        else
        {
            this.level_img = Resources.images.level;
            this.goback_img = Resources.images.goback;
        }

        if (Input.mouse.currX > Constants.WIDTH / 2.0 - 50 && Input.mouse.currX <= Constants.WIDTH / 2.0 + 50)
        {
            if (Input.mouse.currY > this.barHeightBase - 150 && Input.mouse.currY <= this.barHeightBase - 50)
            {
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.character = this.game.character == 0 ? 1 : 0;
                }
            }
        }
    }

    render()
    {
        this.gfx.font = "120px Independence_hall"
        this.gfx.fillText("설정", (Constants.WIDTH - 250) / 2.0, 180);

        this.gfx.font = "28px Independence_hall"
        this.gfx.fillText("캐릭터", this.barStart + 10, this.barHeightBase - 80);
        if (this.game.character == 0)
            this.gfx.drawImage(Resources.images.normal, Constants.WIDTH / 2.0 - 50, this.barHeightBase - 150, 100, 100)
        else
            this.gfx.drawImage(Resources.images.normal_chim, Constants.WIDTH / 2.0 - 50, this.barHeightBase - 150, 100, 100)

        this.gfx.fillText("효과음", this.barStart - 100, this.barHeightBase + this.handleWidth);
        this.gfx.fillText("배경음", this.barStart - 100, this.barHeightBase + this.handleWidth + this.barGap);

        this.gfx.beginPath();
        this.gfx.rect(this.barStart, this.barHeightBase, this.barWidth, this.barHeight);
        this.gfx.fill();
        this.gfx.beginPath();
        this.gfx.rect(this.barStart, this.barHeightBase + this.barGap, this.barWidth, this.barHeight);
        this.gfx.fill();

        // Render handles
        this.gfx.beginPath();
        this.gfx.rect(this.barStart + this.barWidth * this.handle1 - this.handleWidth / 2.0, this.barHeightBase + this.handleHeight / 2.0, this.handleWidth, -this.handleHeight);
        this.gfx.fill();

        this.gfx.beginPath();
        this.gfx.rect(this.barStart + this.barWidth * this.handle2 - this.handleWidth / 2.0, this.barHeightBase + this.handleHeight / 2.0 + this.barGap, this.handleWidth, -this.handleHeight);
        this.gfx.fill();

        this.gfx.fillText(Math.trunc(this.handle1 * 100), this.barStart + this.barWidth + 10, this.barHeightBase + this.handleWidth);
        this.gfx.fillText(Math.trunc(this.handle2 * 100), this.barStart + this.barWidth + 10, this.barHeightBase + this.handleWidth + this.barGap);

        this.gfx.drawImage(this.level_img, (Constants.WIDTH - 435) / 2.0, this.btnHeightBase);
        this.gfx.drawImage(this.goback_img, (Constants.WIDTH - 435) / 2.0, this.btnHeightBase + 120);
    }
}