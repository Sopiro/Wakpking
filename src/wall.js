import { Vector } from "./vector.js";
import { Constants } from "./constants.js";

export class Wall
{
    constructor(level, x0, y0, wx, wy)
    {
        this.level = level;
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x0 + wx;
        this.y1 = y0 + wy;
        this.wx = wx;
        this.wy = wy;
    }

    checkCollideAABB(aabb, vx, vy)
    {
        let collide =
            this.checkCollide(aabb.x, aabb.y, aabb.x + vx, aabb.y + vy) ? new Vector(aabb.x, aabb.y) :
                this.checkCollide(aabb.X, aabb.y, aabb.X + vx, aabb.y + vy) ? new Vector(aabb.X, aabb.y) :
                    this.checkCollide(aabb.x, aabb.Y, aabb.x + vx, aabb.Y + vy) ? new Vector(aabb.x, aabb.Y) :
                        this.checkCollide(aabb.X, aabb.Y, aabb.X + vx, aabb.Y + vy) ? new Vector(aabb.X, aabb.Y) : undefined;

        if (collide != undefined)
            return { collide, endPoint: false };
        else
        {
            collide =
                aabb.checkCollidePoint(this.x0, this.y0) ? new Vector(this.x0, this.y0) :
                    aabb.checkCollidePoint(this.x1, this.y1) ? new Vector(this.x1, this.y1) : undefined;

            return { collide, endPoint: collide ? true : false }
        }
    }

    checkCollide(ax, ay, bx, by)
    {
        let z0 = (this.x1 - this.x0) * (ay - this.y0) - (this.y1 - this.y0) * (ax - this.x0);
        let z1 = (this.x1 - this.x0) * (by - this.y1) - (this.y1 - this.y0) * (bx - this.x1);

        let z2 = (bx - ax) * (this.y0 - ay) - (by - ay) * (this.x0 - ax);
        let z3 = (bx - ax) * (this.y1 - by) - (by - ay) * (this.x1 - bx);

        return (z0 * z1) < 0 && (z2 * z3) < 0;
    }

    getNormal()
    {
        let res = new Vector(this.y1 - this.y0, this.x0 - this.x1);
        res.normalize();

        return res;
    }

    convert()
    {
        return new Wall(this.level, this.x0, this.y0 + this.level * Constants.HEIGHT, this.wx, this.wy);
    }
}