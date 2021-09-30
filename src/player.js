import { Vector } from "./vector.js";
import { AABB } from "./aabb.js";
import { Constants } from "./constants.js";
import * as Resources from "./resources.js";
import * as Input from "./input.js";
import * as Util from "./util.js";

export class Player
{
    constructor(gfx, game)
    {
        this.gfx = gfx;
        this.game = game;
        this.gravity = 0.19;
        this.globalFriction = 0.996;
        this.groundFriction = 0.88;
        this.sideJump = 5.1;
        this.boundFriction = 0.66;
        this.JumpConst = 15.0;
        this.chargingConst = 600.0;

        this.crouching = false;
        this.onGround = true;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 32;
        this.speed = 2.7
        this.radius = this.size / 2.0 * 1.414;
        this.jumpGauge = 0;

        this.rs = 64;
        this.dir = 1;

        this.lastHeight = 0;
        this.numJumps = 0;
        this.numFalls = 0;

        this.ckptPosInit = new Vector(100, 0);
        this.ckptPos = new Vector(100, 0);
        this.portalPos = new Vector(900, 0);
        this.grabCkpt = false;

        this.angleAABB = new AABB(50, Constants.HEIGHT * 8 + 300, 100, 125);
    }

    reset()
    {
        this.x = 484;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.onGround = true;
        this.crouching = false;
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
        let res = '';

        if (this.crouching)
            res = "crouch";
        else
            res = "normal";

        if (this.game.character != 0)
            res += "_chim";

        return res;
    }

    collideToLeft(w)
    {
        this.x = w;
        this.vx *= -1 * this.boundFriction;
        Resources.audios.bounce.start();
    }

    collideToRight(w)
    {
        this.x = w - this.size;
        this.vx *= -1 * this.boundFriction;
        Resources.audios.bounce.start();
    }

    collideToTop(w)
    {
        this.y = w - this.size;
        this.vy *= -1 * this.boundFriction;
        Resources.audios.bounce.start();
        this.playRandomHurtSound();
    }

    collideToBottom(w)
    {
        this.onGround = true;
        this.y = w;
        this.vx = 0;
        this.vy = 0;

        let gap = this.lastHeight - this.y;

        Resources.audios.landing.start();
        if (gap >= 300)
        {
            this.numFalls++;
            this.playRandomHurtSound();
        }

    }

    collideToWall(s, r)
    {
        this.x = s.x;
        this.y = s.y;
        this.vx = r.x * this.boundFriction;
        this.vy = r.y;
        Resources.audios.bounce.start();
        // this.onGround = false;
    }

    playRandomHurtSound()
    {
        if (this.game.character != 0)
        {
            Resources.audios.ah_chim.start();
            return;
        }
        let r = Math.trunc(Math.random() * 3);

        switch (r)
        {
            case 0:
                Resources.audios.ah1.start();
                break;
            case 1:
                Resources.audios.ah2.start();
                break;
            case 2:
                Resources.audios.ah3.start();
                break;
        }
    }

    update(delta)
    {
        //Apply previous acceleration
        this.vx *= this.globalFriction;
        this.vy *= this.globalFriction;
        if (Math.abs(this.vx) < 0.0001) this.vx = 0;
        if (Math.abs(this.vy) < 0.0001) this.vy = 0;
        this.x += this.vx;
        this.y += this.vy;

        let c;

        //Calculate current level
        this.game.level = Math.trunc(this.y / Constants.HEIGHT);
        this.game.levelMax = this.game.level > this.game.levelMax ? this.game.level : this.game.levelMax;

        // let moving = this.vx * this.vx + this.vy + this.vy;
        // let falling = this.vy < 0 ? true : false;

        if (this.onGround)
        {
            this.vx *= this.groundFriction;

            if (this.onGround)
            {
                if (Input.currKeys.ArrowLeft) this.dir = 1;
                if (Input.currKeys.ArrowRight) this.dir = -1;
            }

            if (Input.currKeys[' '] && !this.crouching)
            {
                this.crouching = true;
            }
            else if (Input.currKeys[' '] && this.crouching)
            {
                this.jumpGauge >= 1 ? this.jumpGauge = 1 : this.jumpGauge += delta / this.chargingConst;
            }
            else if (Input.currKeys.ArrowLeft && !this.crouching)
            {
                c = this.testCollide(-this.speed, 0);

                if (c.side == undefined)
                    this.vx = -this.speed;
                else
                    this.vx = 0;
            }
            else if (Input.currKeys.ArrowRight && !this.crouching)
            {
                c = this.testCollide(this.speed, 0);

                if (c.side == undefined)
                    this.vx = this.speed;
                else
                    this.vx = 0;
            }
            else if (!Input.currKeys[' '] && this.crouching)
            {
                if (Input.currKeys.ArrowLeft) this.vx = -this.sideJump;
                else if (Input.currKeys.ArrowRight) this.vx = this.sideJump;
                Resources.audios.jump.start();

                this.vy = this.jumpGauge * this.JumpConst;
                this.jumpGauge = 0;
                this.onGround = false;
                this.crouching = false;

                this.lastHeight = this.y;
                this.numJumps++;
            }
        }

        //Apply gravity
        c = this.testCollide(0, -this.gravity);
        if (c.side == undefined)
        {
            this.vy -= this.gravity;
            this.onGround = false;
        }

        //Test if current acceleration make collision happen or not 
        c = this.testCollide(this.vx, this.vy);
        if (c.side != undefined)
        {
            if (c.side != 'error')
                this.reponseCollide(c);
        }

        if (this.game.gameMode >= 2)
        {
            if (this.onGround && this.grabCkpt)
            {
                if (Input.currKeys.ArrowDown && !Input.lastKeys.ArrowDown)
                {
                    Resources.audios.omat.start();
                    this.grabCkpt = false;
                    this.ckptPos.x = this.x;
                    this.ckptPos.y = this.y;
                }
            }

            let testAABB = new AABB(this.ckptPos.x, this.ckptPos.y, this.rs, this.rs);

            if (testAABB.checkCollideBox(this.aabb()).collide && !this.grabCkpt)
            {
                if (Input.currKeys.ArrowUp && !Input.lastKeys.ArrowUp)
                {
                    Resources.audios.um.start();
                    this.grabCkpt = true;
                }
            }

            testAABB = new AABB(this.portalPos.x, this.portalPos.y, this.rs, this.rs);

            if (testAABB.checkCollideBox(this.aabb()).collide && !this.grabCkpt)
            {
                if (Input.currKeys.ArrowUp && !Input.lastKeys.ArrowUp)
                {
                    Resources.audios.tp.start();
                    this.x = this.ckptPos.x;
                    this.y = this.ckptPos.y;
                    this.ckptPos.x = this.ckptPosInit.x;
                    this.ckptPos.y = this.ckptPosInit.y;
                }
            }
        }

        // EndGame
        if (this.angleAABB.checkCollidePoint(this.x + this.size / 2.0, this.y + this.size / 2.0))
        {
            this.game.changeScene(4);
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
        else if (box.X > Constants.WIDTH)
        {
            side = 'right';
            set = Constants.WIDTH;
        }
        else if (box.y < 0)
        {
            side = 'bottom';
            set = 0;
        }
        else
        {
            for (let b of this.game.blocks)
            {
                if (b.level != this.game.level) continue;

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

            for (let w of this.game.walls)
            {
                if (w.level != this.game.level) continue;

                w = w.convert();

                let r = w.checkCollideAABB(box, nvx, nvy);

                if (r.collide != undefined)
                {
                    side = 'wall';
                    let nv = new Vector(nvx, nvy);
                    let n;

                    if (!r.endPoint)
                    {
                        let hitPoint = Util.getIntersect(w.x0, w.y0, w.x1, w.y1, r.collide.x, r.collide.y, r.collide.x + nvx, r.collide.y + nvy);

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
        if (this.game.gameMode >= 2)
        {
            if (!this.grabCkpt)
            {
                this.gfx.drawImage(Resources.images.chimha, this.ckptPos.x - this.rs / 4.0, Constants.HEIGHT - (this.ckptPos.y - Constants.HEIGHT * this.game.level), this.rs, -this.rs);
                this.gfx.drawImage(Resources.images.portal_on, this.portalPos.x, Constants.HEIGHT - (this.portalPos.y - Constants.HEIGHT * this.game.level), this.rs * 3 / 4, -this.rs);
            }
            else
            {
                this.gfx.drawImage(Resources.images.portal_off, this.portalPos.x, Constants.HEIGHT - (this.portalPos.y - Constants.HEIGHT * this.game.level), this.rs * 3 / 4, -this.rs);
            }
        }

        this.gfx.save();
        this.gfx.translate(this.x - 16, Constants.HEIGHT - this.rs - this.y + this.game.level * Constants.HEIGHT)
        this.gfx.scale(1 * this.dir, 1);
        this.gfx.drawImage(Resources.images[this.getDrawImage()], 0, 0, this.rs * this.dir, this.rs);
        this.gfx.restore();

        if (this.game.gameMode >= 1)
        {
            this.gfx.font = "12px Independence_hall"
            this.gfx.fillText("찐따 게이지", 894 + 22, Constants.HEIGHT - 782);

            this.gfx.beginPath();
            this.gfx.rect(894, Constants.HEIGHT - 779, 100, -14);
            this.gfx.stroke();
            this.game.drawRect(894, 780, Math.trunc(this.jumpGauge * 100), 12);
        }
    }
}