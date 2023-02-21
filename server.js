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
    res.send({ message: "Utworzono już dwóch użytkowników" });
  } else {
    if (!users.find((el) => el.name == name)) {
      users.push({ id: users.length + 1, name: name });
      if (users.length == 1)
        res.send({
          message: `Jesteś zalogowany jako ${name}, czekanie na drugiego gracza`,
        });
      else {
        res.send({ message: `Jesteś zalogowany jako ${name}` });
      }
    } else res.send({ message: `Użytkownik ${name} już istnieje` });
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

socketio.on("connection", (client) => {
  console.log(client.id);
  client.on("onTable", (data) => {
const arr=data.data
client.broadcast.emit('onTable',{data:arr})
  });
});



server.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});