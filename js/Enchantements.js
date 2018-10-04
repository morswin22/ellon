class EnchantementsOrganiser {
    constructor() {
        this.load();

    }

    // load enchantements
    async load() {
        this.data = await (await fetch('data/enchantements')).json();
    }
}