function randomBetween(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomArray(items) {
    return items[~~(items.length * Math.random())];
}

const capitalize = s => s && s.replace(/./, s.toUpperCase()[0]); 

function round(amount, decimals) {
    return Number(Math.round(Number(`${amount}e${decimals}`)) + `e-${decimals}`);
}
