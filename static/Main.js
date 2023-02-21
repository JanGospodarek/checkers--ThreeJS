import Game from "./Game.js";
import Net from "./Net.js";
import Ui from "./Ui.js";
let game;
let net;
let ui;
window.onload = () => {
  game = new Game();
  net = new Net();
  ui = new Ui(
    net.fetchPost,
    net.fetchCheckForPlayers,
    net.fetchReset,
    net.fetchStart,
    game.startGame,
    game
  );
};
