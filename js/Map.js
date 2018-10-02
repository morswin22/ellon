const defaultLegend = {
    player: '@',
    wallV: '|',
    wallH: '―',
    space: '.',
    door: '+',
    unknown: '?',
    enemy: 'E'
}

const mapNames = [
    'tutorial',
    'test0'
]

class Map {
    constructor(node, width, height, dwidth, dheight) {
        this.letterSize = [6.41, 16];

        this.mapSize = [width, height];       // in chars
        this.displaySize = [dwidth, dheight]; // in chars

        this.setupNode(node);
        this.setLegend(defaultLegend);

        this.mapReady = false;
        // this.setPlayer(playerData);
        // this.fetchMap();
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

    draw() {
        this.clear();
        if (this.mapReady) {
            if (!this.player) {
                throw 0x2;
            }
            // calc the displayed bg
            // let xy = this.center(); // temp
            let xy = this.player.getPos(); // temp
            
            console.log(xy);
            let left = xy[0] - (this.displaySize[0]/2);
            let top = xy[1] - (this.displaySize[1]/2);

            let html = '';
            for(let y = top; y < top+this.displaySize[1]; y++) {
                for(let x = left; x < left+this.displaySize[0]; x++) {
                    let pos = y * this.mapSize[0] + x;
                    html += this.mapData.charAt(pos);
                }
                html += '<br>';
            }

            this.master.innerHTML = html;
            
        } else {
            throw 0x1;
        }
    }
}