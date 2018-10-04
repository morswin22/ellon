function randomBetween(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomArray(items) {
    return items[~~(items.length * Math.random())];
}