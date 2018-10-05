const itemsFilesList = [
    'sword'
];

const itemsEnchantChance = [
    5, // for lvl 1(0)
    2, // for lvl 2(1)
    1  // for lvl 3(2)
];

class ItemsOrganiser {
    constructor(enchantmentOrganiser) {
        this.load();
        this.enchantments = enchantmentOrganiser;
    }

    // load items
    async load() {
        this.data = {};
        for(let file of itemsFilesList) {
            this.data[file] = await (await fetch(`data/items/${file}`)).json();
        }
    }
}

class Item {
    constructor(organiser, name, from = '?') {
        this.valuesToSave = [
            'name',
            'use',
            'stamina',
            'damage',
            'enchantments'
        ];

        let data = organiser.data[name];
        if (from != '?') { 
            // load from data

            for(let value of this.valuesToSave) {
                if (from[value] !== undefined) {
                    this[value] = from[value];
                }
            }

        } else if (data) { 
            // init

            this.name = name;
            this.use = data.use;
            this.stamina = data.stamina;
            switch(this.use) {
                case 'attack':
                    this.damage = randomBetween(data.damage[0], data.damage[1]);
                    break;
            }

            // get random enchantment
            this.enchantments = {};
            let random = this.getRandomEnchant(organiser, name);
            if (random) {
                this.enchantments[random.name] = random.data;
            }

        } else {
            console.error('Not supported `name` for `item` class');
        }
    }

    toSave() {
        let list = {};
        for(let value of this.valuesToSave) {
            if (this[value] !== undefined) {
                list[value] = this[value];
            }
        }
        return list;
    }

    // utils
    getRandomEnchant(organiser, name) {
        let enchantment = randomArray(organiser.data[name].possibleEnchantments);
        let random = randomBetween(0,100);
        let pointer = 0;
        for(let i = 0; i < organiser.enchantments.data[enchantment].levels.length; i++) {
            pointer += itemsEnchantChance[i];
            if (random < pointer) {
                return {
                    name: enchantment,
                    data: {
                        level: i,
                        value: organiser.enchantments.data[enchantment].levels[i],
                        affects: organiser.enchantments.data[enchantment].affects
                    }
                }
            }
        }
        return false;
    }
}

class MapItem {
    constructor(x, y, item) {
        this.item = item;
        this.x = x;
        this.y = y;
    }

    toSave() {
        return {
            x: this.x,
            y: this.y,
            item: this.item.toSave()
        };
    }
}