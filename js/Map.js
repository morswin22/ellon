const defaultLegend = {
    player: '@',
    wallV: '|',
    wallH: '-',//'―',
    space: '.',
    door: '+',
    unknown: '?',
    enemy: 'E'
}

const mapNames = [
    'tutorial',
    'test0'
]

const mapBackgrounds = [
    'bg-default',
    'bg-green'
]

const evalBG = /^0x[0-9a-f]/;

class Map {
    constructor(node, width, height, dwidth, dheight) {
        this.letterSize = [6.41, 16];

        this.mapSize = [width, height];       // in chars
        this.displaySize = [dwidth, dheight]; // in chars

        this.setupNode(node);
        this.setLegend(defaultLegend);

        this.mapReady = false;
    }

    // player
    setPlayer(data) {
        this.player = data;
    }

    // map
    loadMap(name) {
        this.mapName = name;
        this.fetchMap();
    }
    
    async fetchMap() {
        if (mapNames.indexOf(this.mapName) != -1) {
            this.mapReady = false;
            this.mapData = await (await fetch('/data/maps/'+this.mapName)).text();

            let bg = '';
            for (let i = 0; i<3; i++) {
                bg += this.mapData.charAt(i);
            }
            this.mapBackground = eval(bg); // TODO: check this
            let wrapper = document.querySelector('.wrapper');
            for(let cls of mapBackgrounds) {
                wrapper.classList.remove(cls);
            }
            wrapper.classList.add(mapBackgrounds[this.mapBackground]);

            this.mapReady = true;
        } else {
            console.error('Unknown map name');
        }
    }

    // Setup Master
    setupNode(master) {
        this.master = master;
    }

    // Legend
    setLegend(legend) {
        this.legend = legend;
    }
    getLegend() {
        return this.legend;
    }

    // Usefull
    center() {
        return [
            this.mapSize[0]/2,
            this.mapSize[1]/2
        ];
    }

    clear() {
        this.master.innerHTML = '';
    }

    calculatePos(x,y) {
        return (y * this.mapSize[0] + x) + 3; // 3 -> bg
    }

    draw() {
        this.clear();
        if (this.mapReady) {
            if (!this.player) {
                throw 0x2;
            }
            // calc the displayed bg
            let xy = this.player.getPos();
            
            let left = xy[0] - parseInt(this.displaySize[0]/2);
            let top = xy[1] - parseInt(this.displaySize[1]/2);

            let html = '';
            let playerWalls = [];
            for(let y = top; y < top+this.displaySize[1]; y++) {
                for(let x = left; x < left+this.displaySize[0]; x++) {
                    let pos = this.calculatePos(x,y);
                    let char = this.mapData.charAt(pos);

                    if (xy[0] == x && xy[1] == y) {
                        html += defaultLegend.player;
                    } else if (char == defaultLegend.space) {
                        html += '<i>'+char+'</i>';
                    } else {
                        html += char;
                    }

                    if (char == defaultLegend.wallH || char == defaultLegend.wallV) {
                        playerWalls.push([x,y]);
                    }
                }
                html += '<br>';
            }
            this.player.setWalls(playerWalls);

            this.master.innerHTML = html;
            
        } else {
            throw 0x1;
        }
    }
}