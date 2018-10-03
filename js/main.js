const map = new Map(
    document.querySelector('#map'),
    64, 64,
    23, 9//13, 5//25,10 //38, 15
);

const game = new Game(map, {
    debug: true
});

// game.draw();