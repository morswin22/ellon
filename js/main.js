const player = new Player();

const map = new Map(
    document.querySelector('#map'),
    player,
    64, 64,
    32, 16
);

const game = new Game(player, map);

game.debug(true);

game.draw();