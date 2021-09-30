import * as Resources from "../resources.js";
import { Constants } from "../constants.js";
import { Vector } from "../vector.js";

export class EndScene
{
    constructor(gfx, game)
    {
        this.gfx = gfx;
        this.game = game;
        this.halfHeight = Constants.HEIGHT / 2.0;
        this.halfWidth = Constants.WIDTH / 2.0;
    }

    start()
    {
        this.time = 0;
        this.engelPos = new Vector(50, 300)

        let total = Math.trunc(performance.now() / 1000.0);

        this.hour = Math.trunc(total / 3600.0);
        total -= 3600 * this.hour;
        this.min = Math.trunc(total / 60.0);
        total -= 60 * this.min;
        this.sec = total
    }

    update()
    {
        this.engelPos.y = 300 + Math.sin(this.time / 100.0) * 80 + this.time / 2;
        this.engelPos.x = 50 + this.time
        this.time++;
    }

    render()
    {
        this.gfx.fillStyle = "#F7FEFF";
        this.gfx.rect(0, 0, Constants.WIDTH, Constants.HEIGHT);
        this.gfx.fill();
        this.gfx.fillStyle = "#000000";

        this.gfx.drawImage(Resources.images.angel, this.engelPos.x, Constants.HEIGHT - this.engelPos.y, 100, -125);
        this.gfx.fillStyle = "hotpink";
        this.gfx.font = "114px Independence_hall"
        this.gfx.fillText("♥", 45 + this.time, Constants.HEIGHT - (230 + Math.sin(this.time / 100.0) * 80 + this.time / 2));
        this.gfx.fillStyle = "#000000";

        let per = Math.max(Math.min(this.time - 700, 400.0), 0.0) / 400.0;

        this.gfx.globalAlpha = per;
        this.gfx.font = "64px Independence_hall"
        this.gfx.fillText("플레이해 주셔서 감사합니다!", this.halfWidth - 365, this.halfHeight - 200);
        this.gfx.font = "32px Independence_hall"
        this.gfx.fillText("총 점프 횟수: " + this.game.player.numJumps, this.halfWidth - 110, this.halfHeight - 50);
        this.gfx.fillText("총 추락 횟수: " + this.game.player.numFalls, this.halfWidth - 110, this.halfHeight - 10);

        switch (this.game.gameMode)
        {
            case -1:
                this.gfx.fillStyle = "#ff002a"
                this.gfx.fillText("하드모드", this.halfWidth - 70, this.halfHeight + 160);
                break;
            case 0:
                this.gfx.fillText("노말모드", this.halfWidth - 70, this.halfHeight + 160);
                break;
            case 1:
                this.gfx.fillText("찐따모드", this.halfWidth - 70, this.halfHeight + 160);
                break;
            case 2:
                this.gfx.fillText("씹찐따모드", this.halfWidth - 85, this.halfHeight + 160);
                break;

            default:
                break;
        }
        this.gfx.fillStyle = "#000000"
        if (this.hour > 0)
            this.gfx.fillText("총 경과 시간: " + this.hour + "시간 " + this.min + "분 " + this.sec + "초", this.halfWidth - 195, this.halfHeight + 220);
        else
            this.gfx.fillText("총 경과 시간: " + this.min + "분 " + this.sec + "초", this.halfWidth - 150, this.halfHeight + 220);
        this.gfx.font = "20px Independence_hall"
        this.gfx.fillText("소스코드: https://github.com/Sopiro/Wakpking", this.halfWidth - 210, this.halfHeight + 300);
        this.gfx.globalAlpha = 1.0;
    }
}