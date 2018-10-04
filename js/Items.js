const itemsFilesList = [
    'sword'
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
    constructor(organiser, name) {
        let data = organiser.data[name];
        if (data) {
            this.name = name;
            this.use = data.use;
            this.stamina = data.stamina;
            switch(this.use) {
                case 'attack':
                    this.damage = randomBetween(data.damage[0], data.damage[1]);
                    break;
            }

            this.enchantments = {};
            // give enchants.. only at a small percent
            // TODO: CONVOLUTION! FIX THIS ASAP !!!
            console.error('Fix item enchanting system in `constructor`');
            let random = randomBetween(0,1000);
            let ok = false;
            if (random <= 50) { 
                let enchantment = randomArray(data.possibleEnchantments);
                if (random <= 20) { 
                    if (random <= 10) { 
                        // for level 3
                        this.enchantments[enchantment] = {
                            level: 2,
                            value: organiser.enchantments.data[enchantment].levels[2],
                            affects: organiser.enchantments.data[enchantment].affects
                        };
                        ok = true;
                    }
                    if (!ok) {
                        // for level 2
                        this.enchantments[enchantment] = {
                            level: 1,
                            value: organiser.enchantments.data[enchantment].levels[1],
                            affects: organiser.enchantments.data[enchantment].affects
                        };
                    }
                    ok = true;
                }
                if (!ok) {
                    // for level 1
                    this.enchantments[enchantment] = {
                        level: 0,
                        value: organiser.enchantments.data[enchantment].levels[0],
                        affects: organiser.enchantments.data[enchantment].affects
                    };
                }
            }
        } else {
            console.error('Not supported `name` for `item` class');
        }

        this.valuesToSave = [
            'name',
            'use',
            'stamina',
            'damage',
            'enchantments'
        ];
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