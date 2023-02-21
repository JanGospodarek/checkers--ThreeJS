import Game from "./Game.js";
import Net from "./Net.js";
import Ui from "./Ui.js";
let game;
let net;
let ui;
window.onload = () => {
  const client = io();
  net = new Net();
  game = new Game(client, net.sendTableSocket);

  ui = new Ui(
    net.fetchPost,
    net.fetchCheckForPlayers,
    net.fetchReset,
    net.fetchStart,
    game.startGame,
    game
  );
};
