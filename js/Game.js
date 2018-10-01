const gameStages = [
    'menu',
    'playing',
    'end'
];

const gameStagesCSS = [
    's0',
    's1',
    's2'
];

class Game {
    constructor (player, map) {
        this.player = player;
        this.map = map;

        this.loadDOM();

        this.stage(0);

        this.debug(false);
    }

    // DOM
    loadDOM() {
        this.dom = {
            wrapper: document.querySelector('.wrapper'),
            new_save: document.querySelector('#new-save'),
            saves: document.querySelector('#saves'),
            map: document.querySelector('#map'),
            inventory: document.querySelector('#inventory'),
            input: document.querySelector('#input'),
            output: document.querySelector('#output')
        };
    }

    // debug
    debug(bool) {
        this.debugMode = bool;
    }

    // stages
    stage(index) {
        if (gameStages[index]) {
            if (this.debugMode) console.log(`Switching game stage from ${this.stageIndex} to ${index}`);
            this.stageIndex = index;

            for(let css of gameStagesCSS) {
                this.dom.wrapper.classList.remove(css);
            }
            this.dom.wrapper.classList.add(gameStagesCSS[index]);
        } else {
            console.error('Unknown stage index');
        }
    }

    // utils
    draw() {
        try {
            this.map.draw();
        } catch (err) {
            if (this.debugMode) console.error(err);
            if (err == 'Map hasn\'t loaded yet') {
                setTimeout(this.draw.bind(this), 1000/3);
            }
        }
    }
}