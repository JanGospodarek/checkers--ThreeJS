const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const fs = require("fs");
const hbs = require("express-handlebars");
const http = require("http");
const server = http.createServer(app);

app.use(express.json());
app.use(express.static("static"));

let users = [];

app.set("views", path.join(__dirname, "static/views"));
app.engine("hbs", hbs({ defaultLayout: "main.hbs" }));
app.set("view engine", "hbs");

app.get("/", function (req, res) {
  res.render("index.hbs");
});

app.post("/handleLogIn", function (req, res) {
  const name = req.body.name;
  if (users.length == 2) {
    res.send({ message: "Utworzono już dwóch użytkowników", error: true });
  } else {
    if (!users.find((el) => el.name == name)) {
      users.push({ id: users.length + 1, name: name, waiting: false });
      if (users.length == 1)
        res.send({
          message: `Jesteś zalogowany jako ${name}, czekanie na drugiego gracza`,
        });
      else {
        res.send({ message: `Jesteś zalogowany jako ${name}` });
      }
    } else
      res.send({ message: `Użytkownik ${name} już istnieje`, error: true });
  }
});

app.post("/checkForPlayers", function (req, res) {
  if (users.length == 2) {
    res.send({
      waiting: false,
      message: `Jesteś zalogowany jako ${users[0].name}`,
    });
  } else res.send({ waiting: true });
});

app.post("/reset", function (req, res) {
  users = [];
});

let sendedFirstId = false;

app.post("/start", function (req, res) {
  if (!sendedFirstId) {
    res.send({ id: 1 });
    sendedFirstId = true;
  } else {
    res.send({ id: 2 });
  }
});

const { Server } = require("socket.io");
const socketio = new Server(server);
let interval,
  intervals = [];
let curPLayer = 1;

socketio.on("connection", (client) => {
  client.on("onTable", (data) => {
    const arr = data.data;

    client.broadcast.emit("onTable", {
      data: arr,
      oldPosition: data.oldPosition,
      newPosition: data.newPosition,
    });
  });

  client.on("start", (id) => {
    intervals.forEach((el, i) => clearInterval(el));
    if (id.curPLayer) return;

    curPLayer = id.id;
    timer = 10;

    interval = setInterval(() => {
      timer--;

      if (timer == 0) {
        curPLayer == 1 ? (curPLayer = 2) : (curPLayer = 1);
        console.log("zmiana", id.id, curPLayer);
        client.broadcast.emit("onWait", { timer: timer, curPLayer: curPLayer });
        timer = 10;
      }

      client.broadcast.emit("onWait", { timer: timer, curPLayer: curPLayer });
    }, 1000);

    intervals.push(interval);
  });
});

server.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
