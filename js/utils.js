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

function levelToGreek(num) {
    switch(num) {
        case 0:
            return "I";
        case 1:
            return "II";
        case 2:
            return "III";
        case 3:
            return "IV";
        case 4:
            return "V";
        case 5:
            return "VI";
    }
}