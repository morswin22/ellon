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

const maxSaves = 10;
const inventorySpace = 15;

class Game {
    constructor (map) {
        this.map = map;

        window.addEventListener('keypress', this.keyPress.bind(this));

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

        this.dom.new_save.addEventListener('keyup', e=>{
            if (e.key == 'Enter') {
                let newName = this.dom.new_save.value;
                this.dom.new_save.value = '';
                
                this.createSave(newName);
            }
        })
    }

    // debug
    debug(bool) {
        this.debugMode = bool;
        if (bool === true) {
            console.log("Error Codes: \n0x1 - map is not loaded\n0x2 - player is not ready\n0x3 - too many saves\n0x4 - save not found");
        }
    }

    // saves
    loadSave(id) {
        let ok = false;

        // load saves 
        let saves = JSON.parse(localStorage.getItem('ellon-saves'));
        if (saves) {
            if (saves[id]) {
                let save = saves[id];
                this.map.loadMap(save.world);

                const player = new Player(save.player);

                this.player = player;
                this.map.setPlayer(player); // this is reference to the original :)

                ok = true;
            } else {
                console.error(0x4);
            }
        }

        if (ok) {
            this.stage(1); // To the game itself!
        }
    }

    createSave(name) {
        // load saves 
        let saves = JSON.parse(localStorage.getItem('ellon-saves'));
        if (saves) {
            if (saves.length < maxSaves) {
                saves.push({ // this is a SaveObject creator
                    name,
                    world: 'tutorial',
                    player: {
                        xy: this.map.center(),
                        hp: 1,
                        inventory: []
                    }
                });
                localStorage.setItem('ellon-saves', JSON.stringify(saves));
                this.stage(0); // refresh
            } else {
                console.error(0x3);
            }
        } else {
            localStorage.setItem('ellon-saves', JSON.stringify([]));
            this.createSave(name);
        }
    }

    deleteSave(id, confirmed = false) {
        if (confirmed) {
            let saves = JSON.parse(localStorage.getItem('ellon-saves'));
            if (saves) {
                saves.splice(id, 1);
                localStorage.setItem('ellon-saves', JSON.stringify(saves));
                this.stage(0); // refresh
            }
        } else {
            // TODO: create this.confirm method
            if (confirm('Are you sure you want to delete this save?')) {
                this.deleteSave(id, true);
            }
        }
    }

    // stages
    stage(index) {
        if (gameStages[index]) {
            if (this.debugMode) console.log((this.stageIndex == index) ? `Refreshing game stage ${index}` : `Switching game stage from ${this.stageIndex} to ${index}`);
            this.stageIndex = index;

            for(let css of gameStagesCSS) {
                this.dom.wrapper.classList.remove(css);
            }
            this.dom.wrapper.classList.add(gameStagesCSS[index]);

            switch(index) {
                case 0:


                    // load saves 
                    let saves = JSON.parse(localStorage.getItem('ellon-saves'));
                    if (saves) {
                        console.log(saves);

                        // create DOM
                        if (this.dom.savesList) {
                            this.dom.savesList.remove();
                        }
                        let list = document.createElement('ul');

                        let id = 0;
                        for(let save of saves) {
                            let li = document.createElement('li');

                            let span = document.createElement('span');
                            span.innerHTML = save.name;

                            let del = document.createElement('button');
                            del.innerHTML = 'x';
                            del.setAttribute('data-id', id);
                            del.addEventListener('click', e=>{
                                this.deleteSave(del.getAttribute('data-id'));
                            });

                            let btn = document.createElement('button');
                            btn.innerHTML = '>';
                            btn.setAttribute('data-id', id);
                            btn.addEventListener('click', e=>{
                                // (click) => setup player
                                this.loadSave(btn.getAttribute('data-id'));
                            });

                            li.appendChild(span);
                            li.appendChild(del);
                            li.appendChild(btn);
                            
                            list.appendChild(li);
                            id++;
                        }

                        this.dom.savesList = list;
                        this.dom.saves.appendChild(list);
                    } else {
                        localStorage.setItem('ellon-saves', JSON.stringify([]));
                        this.stage(index);
                    }


                    break;
                case 1:
                
                    // switched to 1
                    
                    // run the game!
                    // ;)

                    this.gameRoutine();

                    break;
                case 2:
                
                    break;
            }
        } else {
            console.error('Unknown stage index');
        }
    }
    
    // game
    gameRoutine() {
        // refresh map
        this.draw(); // done
        
        // display inventory


        // display output


        // display input


    }

    keyPress(e) {
        if (this.stageIndex == 1 && this.map.mapReady) {
            console.log(e.key);
            // process keypresses here :)
        }
    }

    // utils
    draw() {
        try {
            this.map.draw();
        } catch (err) {
            if (this.debugMode) console.error("#"+err);
            if (err == 0x1) {
                setTimeout(this.draw.bind(this), 1000/3);
            }
        }
    }
}