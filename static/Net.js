export default class Net {
  constructor(client) {
    this.client = client;
  }

  fetchPost(nazwa) {
    const body = JSON.stringify({ name: nazwa }); // body czyli przesyłane na serwer dane

    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych
    const resData = fetch("/handleLogIn", { method: "post", body, headers }) // fetch
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
    return resData;
  }
  fetchCheckForPlayers() {
    const resData = fetch("/checkForPlayers", { method: "post" }) // fetch
      .then((response) => response.json())
      .then((data) => {
        return { waiting: data.waiting, message: data.message };
      });
    return resData;
  }
  fetchReset() {
    const resData = fetch("/reset", { method: "post" }); // fetch
  }
  fetchStart() {
    const resData = fetch("/start", { method: "post" }) // fetch
      .then((response) => response.json())
      .then((data) => {
        return data.id;
      });
    return resData;
  }
  sendTableSocket(data, oldPosition, newPosition) {
    this.client.emit("onTable", {
      fromClient: true,
      data: data,
      oldPosition: oldPosition,
      newPosition: newPosition,
    });
  }
  setWaiting(id) {
    this.client.emit("start", { id: id });
  }
}
