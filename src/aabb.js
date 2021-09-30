export class AABB
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.X = x + w;
        this.Y = y + h;
        this.width = w;
        this.height = h;
    }

    checkCollidePoint(px, py)
    {
        if (px > this.x && px < this.X && py > this.y && py < this.Y)
            return true;
        else
            return false;
    }

    checkCollideBox(aabb)
    {
        let rlb = this.checkCollidePoint(aabb.x, aabb.y);
        let rrb = this.checkCollidePoint(aabb.X, aabb.y);
        let rlt = this.checkCollidePoint(aabb.x, aabb.Y);
        let rrt = this.checkCollidePoint(aabb.X, aabb.Y);

        let res =
        {
            collide: rlb || rrb || rlt || rrt,
            lb: rlb,
            rb: rrb,
            lt: rlt,
            rt: rrt,
        };

        return res;
    }

    move(dx, dy)
    {
        this.x += dx;
        this.y += dy;
        this.X += dx;
        this.Y += dy;
    }
}
