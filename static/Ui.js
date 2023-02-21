export default class Ui {
  name;
  waiting = true;
  message = "";
  constructor(
    fetchPost,
    fetchCheckForPlayers,
    fetchReset,
    fetchStart,
    startGame,
    game
  ) {
    this.fetchData = fetchPost;
    this.fetchReset = fetchReset;
    this.game = game;
    this.startGame = startGame;
    this.fetchStart = fetchStart;
    this.fetchCheckForPlayers = fetchCheckForPlayers;
    this.name = document.querySelector("#nazwa");
    this.status = document.querySelector("#status");
    this.dialog = document.querySelector("#dialog");
    this.reset = document.querySelector("#reset");

    this.overlay = document.querySelector(".overlay");
    let interval = setInterval(() => {
      const promise = this.fetchCheckForPlayers();
      promise.then((data) => {
        if (data.waiting == undefined) return;
        this.waiting = data.waiting;
        if (!this.waiting && this.message !== "") {
          this.status.innerText = this.message.split(",")[0];
          clearInterval(interval);
          this.start();
        }
      });
    }, 500);
    document
      .querySelector("#log")
      .addEventListener("click", (e) => this.handleLog(e));
    this.reset.addEventListener("click", () => {
      this.handleReset();
    });
  }
  handleLog(event) {
    const mesPromise = this.fetchData(this.name.value);
    mesPromise.then((data) => {
      this.message = data;
      this.status.innerText = this.message;
      this.waiting = true;
      this.dialog.classList.add("hidden");
      this.overlay.classList.add("hidden");
    });
  }
  handleReset() {
    this.fetchReset();
  }
  start() {
    this.fetchStart().then((data) => {
      this.startGame(data, this.game);
    });
  }
}
