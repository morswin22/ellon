class Player {
    constructor(data) {
        this.x = data.xy[0];
        this.y = data.xy[1];
        this.hp = data.hp;
        this.inventory = data.inventory;
    }

    getPos() {
        return [
            this.x,
            this.y
        ]
    }
}