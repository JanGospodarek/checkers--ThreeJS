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
    game,
    client
  ) {
    this.fetchData = fetchPost;
    this.fetchReset = fetchReset;
    this.game = game;
    this.client = client;
    this.startGame = startGame;
    this.fetchStart = fetchStart;
    this.fetchCheckForPlayers = fetchCheckForPlayers;
    this.name = document.querySelector("#nazwa");
    this.status = document.querySelector("#status");
    this.dialog = document.querySelector("#dialog");
    // this.reset = document.querySelector("#reset");

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
    // this.reset.addEventListener("click", () => {
    //   this.handleReset();
    // });
    client.on("error", (data) => {
      this.status.innerText = data.msg;
      client.emit("readyForDisconnect", { b: true });
    });
  }
  handleLog(event) {
    const mesPromise = this.fetchData(this.name.value);
    mesPromise.then((data) => {
      console.log(data);
      this.message = data.message;
      this.status.innerText = this.message;
      this.waiting = true;
      if (!data.error) {
        this.dialog.classList.add("hidden");
        this.overlay.classList.add("hidden");
      }
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
