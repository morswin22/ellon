const inventorySpace = 15;
const maxStamina = 1;
const maxHp = 1;

class Player {
    constructor(data) {
        this.x = data.xy[0];
        this.y = data.xy[1];
        this.hp = data.hp;
        this.stamina = data.stamina;
        //this.inventory = data.inventory;
        // this.inventory = [
        //     new Item(game.itemsOrganiser, 'sword', {"name":"sword","use":"attack","stamina":0.2,"damage":4,"enchantments":{"lightweight":{"level":0,"value":-0.02,"affects":"stamina"}}}),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword', {"name":"sword","use":"attack","stamina":0.2,"damage":3,"enchantments":{"sharpness":{"level":0,"value":2,"affects":"damage"}}}),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword'),
        //     new Item(game.itemsOrganiser, 'sword')
        // ];
        this.inventory = [];
        for (let item of data.inventory) {
            this.inventory.push(new Item(game.itemsOrganiser, item.name, item)); // TODO: may cause errors..
        }
        this.slots = data.slots;
        this.setWalls([]);
    }

    toSave() {
        return {
            xy: [this.x, this.y],
            hp: this.hp,
            inventory: this.inventory,
            slots: this.slots,
            stamina: this.stamina,
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
        this.collisionX(xdir);

        this.y += ydir;
        this.collisionY(ydir);
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

    //stats 
    getValue(valName) {
        switch(valName) {
            case 'hp':
                return this.hp*100;
            case 'stamina':
                return this.stamina*100;
            case 'damage':
                let dmg = 1;
                let gun = this.getItem(this.slots.hand);
                if (gun) {
                    let gunFinal = gun.toRender();
                    dmg = gunFinal.finalDamage;
                }
                return dmg;
        }
    }
}