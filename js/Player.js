const inventorySpace = 15;

class Player {
    constructor(data) {
        this.x = data.xy[0];
        this.y = data.xy[1];
        this.hp = data.hp;
        this.inventory = data.inventory;
        this.setWalls([]);
    }

    toSave() {
        return {
            xy: [this.x, this.y],
            hp: this.hp,
            inventory: this.inventory
        };
    }

    // position
    getPos() {
        return [
            this.x,
            this.y
        ]
    }

    move(xdir, ydir) {
        this.x += xdir;
        // TODO: collision check
        this.collisionX(xdir);

        this.y += ydir;
        this.collisionY(ydir);
        // TODO: collision check

        // collision only with walls
    }

    collisionX(dir) {
        for (let xy of this.walls) {
            if (xy[0] == this.x && xy[1] == this.y) {
                this.x -= dir;
            }
        }
    }
    collisionY(dir) {
        for (let xy of this.walls) {
            if (xy[0] == this.x && xy[1] == this.y) {
                this.y -= dir;
            }
        }
    }

    setWalls(walls) {
        this.walls = walls;
    }

    // inventory
    addItem(item) {
        if (this.inventory.length < inventorySpace) {
            return (this.inventory.push(item)-1);
        }
        return false;
    }

    removeItem(id) {
        if (this.getItem(id)) {
            this.inventory.splice(id,1);
            return true;
        }
        return false;
    }

    getItems() {
        return this.inventory;
    }

    getItem(id) {
        if (this.inventory[id]) {
            return this.inventory[id];
        }
        return false;
    }
}