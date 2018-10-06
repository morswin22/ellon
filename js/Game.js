const gameStages = [
    'menu',
    'playing',
    'end',
    'inventory'
];

const gameStagesCSS = [
    's0',
    's1',
    's2',
    's3'
];

const maxSaves = 10;
const saveEvery = 10; // seconds

class Game {
    constructor (map, config = {}) {
        this.map = map;

        window.addEventListener('keypress', this.keyPress.bind(this));

        this.loadDOM();

        this.stage(0);

        // setup packages (check if they are loaded, then proceed)
        this.enchantementsOrganiser = new EnchantementsOrganiser();
        this.itemsOrganiser = new ItemsOrganiser(this.enchantementsOrganiser);

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
        // TODO: create new elements rather then query them from DOM
        this.dom = {
            wrapper: document.querySelector('.wrapper'),
            new_save: document.querySelector('#new-save'),
            saves: document.querySelector('#saves'),
            map: document.querySelector('#map'),
            inventory: document.querySelector('#inventory'),
            input: document.querySelector('#input'),
            output: document.querySelector('#output'),

            backpack: document.querySelector('#backpack'),
            slots: document.querySelector('#slots'),
            player_info: document.querySelector('#player-info'),
            item_info: document.querySelector('#item-info'),

            return_btn: document.querySelector('.wrapper > span'),
        };

        this.dom.new_save.addEventListener('keyup', e=>{
            if (e.key == 'Enter') {
                let newName = this.dom.new_save.value;
                this.dom.new_save.value = '';
                
                this.createSave(newName);
            }
        })

        this.dom.return_btn.addEventListener('click', ()=>{
            switch(this.stageIndex) {
                case 1:
                    this.updateSave();
                    this.stage(0);
                    break;

                case 3:
                    this.stage(1);
                    break;
            }
        });
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
        if (name.length == 0) {return false}
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
                        stamina: 1,
                        inventory: [],
                        slots: {
                            hand: null,
                            second: null,
                            helmet: null,
                            chestplate: null,
                            boots: null,
                            skill: null
                        }
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
                            li.setAttribute('data-id', id);

                            let span = document.createElement('span');
                            span.innerHTML = save.name;

                            let del = document.createElement('button');
                            del.innerHTML = 'x';
                            
                            del.addEventListener('click', e=>{
                                this.deleteSave(li.getAttribute('data-id'));
                            });

                            let btn = document.createElement('button');
                            btn.innerHTML = '>';
                            btn.addEventListener('click', e=>{
                                // (click) => setup player
                                this.loadSave(li.getAttribute('data-id'));
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

                    this.renderInput();     // TODO: update when needed
                    this.renderInventory(); // TODO: update when needed

                    this.gameRoutine();

                    break;
                case 2:
                
                    break;

                case 3:
                    this.renderInventory();
                    this.dom.item_info.innerHTML = '';
                    this.renderSlots();
                    this.renderPlayerInfo();
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
        
        // display output

    }

    // wariants with auto rendering :)
    playerAddItem(item) {
        if (this.player.addItem(item)) {
            this.renderInventory();
        }
    }
    playerRemoveItem(id) {
        if (this.player.removeItem(id)) {
            this.renderInventory();
        }
    }

    // keyboard
    allowKeyboard(bool) {
        this.allowKeyboardMode = bool;
    }

    keyPress(e) {
        if (this.allowKeyboardMode && this.stageIndex == 1 && this.map.mapReady) {
            // process keypresses here :)

            // TODO: if (this.ableToMove) {}
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
                this.retry('renderMap');
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

    renderSlots() {
        this.dom.slots.innerHTML = '';
        if (this.itemsOrganiser.data) {
            let elt = this.dom.slots;

            for (let slotName in this.player.slots) {
                let elem = document.createElement('div');

                let name = document.createElement('span');
                name.innerHTML = capitalize(slotName)+': ';
                elem.appendChild(name);

                let item = this.player.getItem(this.player.slots[slotName]);
                if (item) {
                    let span = document.createElement('span');
                    span.innerHTML = this.itemsOrganiser.data[item.name].symbol;
                    span.addEventListener('click',()=>{
                        this.renderItemInfo(item, this.player.slots[slotName]);
                    });
                    elem.appendChild(span);
                }

                elt.appendChild(elem);
            }

        } else {
            this.retry('renderSlots');
        }
    }

    renderItemInfo(item, id) {
        this.dom.item_info.innerHTML = '';
        if (this.itemsOrganiser.data) {
            let elt = this.dom.item_info;
            let displayItem = item.toRender();
            // display item

            let name = document.createElement('div'); // name
            name.classList.add('name');
            name.innerHTML = capitalize(item.name) + ' (custom labels..)';
            elt.appendChild(name);

            let states = ['final', 'base', 'bonus'];
            for (let state of states) {
                let holder = document.createElement('div');
                holder.style.margin = '0.6em 0';

                let stamina = document.createElement('div');
                stamina.innerHTML = capitalize(state)+' Stamina: '+displayItem[state+'Stamina'];
                holder.appendChild(stamina);

                if (item.use == 'attack') { // TODO: is this ok?
                    let damage = document.createElement('div');
                    damage.innerHTML = capitalize(state)+' Damage: '+displayItem[state+'Damage'];
                    holder.appendChild(damage);
                }

                elt.appendChild(holder);
            }

            let enchants;
            let enchantsList;
            let first = true;
            for (let enchantName in displayItem.enchantments) {
                if (first) {
                    enchants = document.createElement('div');
                    enchants.innerHTML = 'Enchantments:';
                    elt.appendChild(enchants);
                    enchantsList = document.createElement('ul');
                    elt.appendChild(enchantsList);
                    first = false;
                }
                let li = document.createElement('li');
                li.innerHTML = `• ${capitalize(enchantName)} ${levelToGreek(displayItem.enchantments[enchantName].level)}`;
                enchantsList.appendChild(li);
            }

            let active = document.querySelectorAll('.renderingInfo');
            for (let e of active) {
                e.classList.remove('renderingInfo');
            }
            document.querySelector(`#backpack > div:nth-of-type(${id+1})`).classList.add('renderingInfo');
            
        } else {
            this.retry('renderItemInfo', item);
        }
    }

    renderPlayerInfo() {
        this.dom.player_info.innerHTML = '';
        if (this.itemsOrganiser.data) {
            let elt = this.dom.player_info;
            let display = {
                "hp": "Health points",
                "stamina": "Stamina",
                "damage": "Damage",
            };
            for (let name in display) {
                let elem = document.createElement('div');
                elem.innerHTML = `${display[name]}: ${this.player.getValue(name)}`;
                elt.appendChild(elem);
            }
        } else {
            this.retry('renderPlayerInfo');
        }
    }

    renderInventory() {
        let container;
        if (this.stageIndex == 1) {
            container = this.dom.inventory;
        } else if (this.stageIndex == 3) {
            container = this.dom.backpack;
        }
        container.innerHTML = '';

        if (this.itemsOrganiser.data) {
            // display items
            let i=0;
            for (let item of this.player.inventory) {
                
                let div = document.createElement('div');
                div.innerHTML = this.itemsOrganiser.data[item.name].symbol;
                div.setAttribute('data-id',i);

                div.addEventListener('click', e=>{
                    let id = parseInt(div.getAttribute('data-id'));
                    if (container.id == 'backpack') {
                        this.renderItemInfo(item, id);
                    } else if (container.id == 'inventory') {
                        this.stage(3);
                        this.renderItemInfo(item, id);
                    }
                })
                
                let info = document.createElement('div');
                let name = document.createElement('div');
                name.classList.add('name');
                name.innerHTML = capitalize(item.name);
                let stamina = document.createElement('div');

                if (item.enchantments.lightweight == undefined) {
                    stamina.innerHTML = 'Stamina: '+item.stamina;
                } else {
                    stamina.innerHTML = `Stamina: ${round(item.stamina+item.enchantments.lightweight.value,2)} (${item.stamina} - ${Math.abs(item.enchantments.lightweight.value)})`;
                }
                
                info.appendChild(name);
                info.appendChild(stamina);

                switch(item.use) {
                    case 'attack':
                        let attack = document.createElement('div');
                        if (item.enchantments.sharpness == undefined) {
                            attack.innerHTML = 'Damage: '+item.damage;
                        } else {
                            attack.innerHTML = `Damage: ${round(item.damage+item.enchantments.sharpness.value,2)} (${item.damage} + ${item.enchantments.sharpness.value})`;
                        }
                        info.appendChild(attack);
                        break;

                    default:
                        let use = document.createElement('div');
                        use.innerHTML = 'Usage: '+item.use;
                        info.appendChild(use);
                        break;
                }
                
                div.appendChild(info);

                container.appendChild(div);
                i++;
            }
            // highlight equipped
            for (let slotName in this.player.slots) {
                if (this.player.slots[slotName] !== null) {
                    document.querySelector(`#${container.id} > div:nth-of-type(${this.player.slots[slotName]+1})`).classList.add('equipped');
                }
            }
        } else {
            this.retry('renderInventory');
        }
    }

    // retry
    retry(func, arg1, arg2) {
        if (arg2 !== undefined) {
            setTimeout(()=>{
                this[func](arg1,arg2).bind(this);
            }, 1000/3);
        } else if (arg1 !== undefined) {
            setTimeout(()=>{
                this[func](arg1).bind(this);
            }, 1000/3);
        } else {
            setTimeout(this[func].bind(this), 1000/3);
        }
    }
}