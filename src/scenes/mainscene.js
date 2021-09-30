import * as Resources from "../resources.js";
import { Constants } from "../constants.js";
import * as Input from "../input.js";


export class MainScene
{
    constructor(gfx, game)
    {
        this.gfx = gfx;
        this.game = game;
        this.titlePos = 0;
        this.start_img = Resources.images.start;
        this.sett_img = Resources.images.sett;

        this.btnStartX = (Constants.WIDTH - 360) / 2.0;
        this.btnEndX = (Constants.WIDTH - 360) / 2.0 + 360;
        this.halfHeight = Constants.HEIGHT / 2.0;
    }

    update(time)
    {
        this.titlePos = Math.sin(time) * 10;

        if (Input.mouse.currX > this.btnStartX && Input.mouse.currX <= this.btnEndX)
        {
            if (Input.mouse.currY > this.halfHeight + 46 && Input.mouse.currY <= this.halfHeight + 46 + 109)
            {
                if (this.start_img == Resources.images.start)
                {

                }
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.changeScene(1);
                }
                this.start_img = Resources.images.start_o;
            }
            else if (Input.mouse.currY > this.halfHeight + 46 + 120 && Input.mouse.currY <= this.halfHeight + 46 + 109 + 120)
            {
                if (this.sett_img == Resources.images.sett)
                {

                }
                if (!Input.mouse.curr_down && Input.mouse.last_down)
                {
                    this.game.changeScene(3);
                }
                this.sett_img = Resources.images.sett_o;
            }
            else
            {
                this.start_img = Resources.images.start;
                this.sett_img = Resources.images.sett;
            }
        }
        else
        {
            this.start_img = Resources.images.start;
            this.sett_img = Resources.images.sett;
        }
    }

    render()
    {
        this.gfx.save();
        this.gfx.translate(100, 100);
        this.gfx.drawImage(Resources.images.angel, 0, 0, 100, 125);
        this.gfx.restore();

        this.gfx.font = "20px Independence_hall"
        this.gfx.fillText("만나러 와줄꺼지..?", 80, 80);


        // this.gfx.save();
        // this.gfx.translate(900, 100);
        // this.gfx.scale(-1, 1);
        // this.gfx.drawImage(Resources.images.normal, 0, 0, 100, 100);
        // this.gfx.restore();

        this.gfx.font = "192px Independence_hall"
        this.gfx.fillText("왁프킹", (Constants.WIDTH - 490) / 2.0, this.titlePos + 220);
        this.gfx.font = "20px Independence_hall"
        this.gfx.fillText("음.. 아마도?", 800, Constants.HEIGHT - 300);
        this.gfx.fillText("알잘딱ver.", 750, Constants.HEIGHT - 550);

        this.gfx.drawImage(Resources.images.wakdu, (Constants.WIDTH - 600) / 2.0, 350);
        this.gfx.drawImage(this.start_img, (Constants.WIDTH - 435) / 2.0, Constants.HEIGHT / 2.0);
        this.gfx.drawImage(this.sett_img, (Constants.WIDTH - 435) / 2.0, Constants.HEIGHT / 2.0 + 120);
    }
}