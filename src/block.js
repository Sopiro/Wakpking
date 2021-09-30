import { AABB } from "./aabb.js";
import { Constants } from "./constants.js";

export class Block
{
    constructor(level, aabb)
    {
        this.level = level;
        this.aabb = aabb;
    }

    convert()
    {
        return new AABB(this.aabb.x, this.aabb.y + this.level * Constants.HEIGHT, this.aabb.width, this.aabb.height);
    }
}
