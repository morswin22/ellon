const map = new Map(
    document.querySelector('#map'),
    64, 64,
    32, 16
);

const game = new Game(map);
game.debug(true);

// game.draw();