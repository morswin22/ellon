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
const saveEvery = 10; // seconds

class Game {
    constructor (map, config = {}) {
        this.map = map;

        window.addEventListener('keypress', this.keyPress.bind(this));

        this.loadDOM();

        this.stage(0);

        // config
        if (config.debug !== undefined) {this.debug(config.debug);} else {this.debug(false);}
        if (config.allowKeyboard !== undefined) this.allowKeyboard(config.allowKeyboard); else {this.allowKeyboard(true)}

        setInterval(()=>{
            this.updateSave();
        }, saveEvery * 1000);
        window.addEventListener('beforeunload', e=>{
            this.updateSave();
        });
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
                this.saveId = parseInt(id);

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

    updateSave() {
        // load saves 
        let saves = JSON.parse(localStorage.getItem('ellon-saves'));
        let id = this.saveId;
        if (saves && id !== undefined) {
            if (saves[id]) {
                // update player
                saves[id].player = this.player.toSave();
                // TODO: update enemies, items..
                localStorage.setItem('ellon-saves', JSON.stringify(saves));
                if (this.debugMode) console.log('Save data has been updated');
            } else {
                console.error(0x4);
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

                    this.renderInput();

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
        this.renderMap(); // done
        
        // display inventory
        // !-now do this-!

        // display output


        // update? input

    }

    // keyboard
    allowKeyboard(bool) {
        this.allowKeyboardMode = bool;
    }

    keyPress(e) {
        if (this.allowKeyboardMode && this.stageIndex == 1 && this.map.mapReady) {
            // process keypresses here :)

            // if (this.ableToMove) {}
            switch(e.key) {
                case "w":
                    this.player.move(0,-1);
                    this.gameRoutine();
                    break;
                case "a":
                    this.player.move(-1,0);
                    this.gameRoutine();
                    break;
                case "s":
                    this.player.move(0,1);
                    this.gameRoutine();
                    break;
                case "d":
                    this.player.move(1,0);
                    this.gameRoutine();
                    break;
            }
        }
    }

    // render
    renderMap() {
        try {
            this.map.draw();
        } catch (err) {
            if (this.debugMode) console.error("#"+err);
            if (err == 0x1) {
                setTimeout(this.renderMap.bind(this), 1000/3);
            }
        }
    }

    renderInput() {
        this.dom.input.innerHTML = '';

        // TODO: expand this as needed :)
        
        let upBtn = document.createElement('button');
        upBtn.innerHTML = '↑';
        upBtn.addEventListener('click', e=>{
            this.player.move(0,-1);
            this.gameRoutine();
        });

        let leftBtn = document.createElement('button');
        leftBtn.innerHTML = '←';
        leftBtn.addEventListener('click', e=>{
            this.player.move(-1,0);
            this.gameRoutine();
        });

        let rightBtn = document.createElement('button');
        rightBtn.innerHTML = '→';
        rightBtn.addEventListener('click', e=>{
            this.player.move(1,0);
            this.gameRoutine();
        });

        let downBtn = document.createElement('button');
        downBtn.innerHTML = '↓';
        downBtn.addEventListener('click', e=>{
            this.player.move(0,1);
            this.gameRoutine();
        });

        this.dom.input.appendChild(upBtn);
        this.dom.input.appendChild(leftBtn);
        this.dom.input.appendChild(rightBtn);
        this.dom.input.appendChild(downBtn);
    }
}