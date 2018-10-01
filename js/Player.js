class Player {
    constructor() {
        // load from localStorage
        let saves = localStorage.getItem('ellon-saves');
        if (saves) {

        } else {
            this.map = 'tutorial';
        }

        this.map = 'test0';
        this.x = 28;
        this.y = 32;
    }

    getPos() {
        return [
            this.x,
            this.y
        ]
    }
}