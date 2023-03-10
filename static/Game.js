import { Pionek } from "./Pionek.js";
export default class Game {
  pionki = [];
  color;
  pionek;
  isStarted;
  running = false;
  pointed;
  waiting = false;
  pole;
  animateOp = false;
  opponent;
  vactor;
  newPos;
  kafle = [];
  intervals = [];
  inters = [];
  mojaTura;
  animation;
  timer = 10;
  movingIntervals = [];
  constructor(client, sendTable, setWaiting) {
    this.client = client;
    this.setWaiting = setWaiting;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xfffff0);
    this.board = new THREE.Group();
    this.pions = new THREE.Group();
    this.renderer.setSize(window.innerWidth, window.innerHeight, true);
    document.getElementById("root").append(this.renderer.domElement);
    // const axes = new THREE.AxesHelper(1000);
    // this.scene.add(axes);
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.client.on("onWait", (data) => {
      // if (!data.timer) return;
      // this.timer = data.timer;
      // if (this.id == data.curPLayer) {
      //   this.renderTimer(`Pozostało na ruch: ${this.timer}`);
      //   this.waiting = false;
      // } else {
      //   this.renderTimer(`Ruch przeciwnika, pozostało: ${this.timer}`);
      //   this.waiting = true;
      // }
    });
    this.client.on("changePlayer", (data) => {
      // if (data && data.color == this.color) return;
      this.changePlayer();
      console.log("wowwww");
    });
    this.sendTable = sendTable;
    //
    this.plansza = [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
    ];

    //

    this.renderBoard();
    this.rednerPionki();

    //
    this.client.on("onTable", (wow) => {
      // if (wow.fromClient) return;

      const index = this.pionki.findIndex(
        (el) =>
          el.position.x == wow.oldPosition.x &&
          el.position.z == wow.oldPosition.z
      );
      console.log("animuj");

      this.animateOpponent(wow, this.pionki[index]);
    });

    this.render();
  }
  changePlayer() {
    this.inters.forEach((el) => clearInterval(el));
    console.log("koks!");
    this.mojaTura = !this.mojaTura;
    this.timer = 10;
    this.timerF();
  }
  render = () => {
    // if (this.animateOp) {

    // const x = this.opponent.position.x;
    // const y = this.opponent.position.y;
    // const z = this.opponent.position.z;
    // console.log(this.opponent);
    // if (Math.ceil(x) == this.newPos.x && Math.ceil(z) == this.newPos.z) {
    //   this.animateOp = false;
    // clearInterval(i);
    //}

    // console.log(this.vector);
    // let mn;
    // this.color == "black" ? (mn = -1) : (mn = 1);
    // console.log(
    //   this.vector.x / Math.abs(this.vector.x),
    //   this.vector.z / Math.abs(this.vector.z)
    // );
    //   this.opponent.position.x += this.vector.x / Math.abs(this.vector.x) / 10;
    //   this.opponent.position.z += this.vector.z / Math.abs(this.vector.z) / 10;
    // }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
    this.camera.lookAt(0, 0, 0);
    TWEEN.update();
  };

  renderTimer(time) {
    document.getElementById("timer").innerText = time;
  }
  timerF() {
    this.inters.forEach((el) => clearInterval(el));
    let i = setInterval(() => {
      console.log(this.mojaTura);
      if (this.mojaTura) {
        this.renderTimer(`Pozostało na ruch: ${this.timer}`);
        this.waiting = false;
      } else {
        this.renderTimer(`Ruch przeciwnika, pozostało: ${this.timer}`);
        this.waiting = true;
      }
      if (this.timer == 0) {
        this.client.emit("changePlayer");
        // this.mojaTura = false;
        clearInterval(i);
      }
      this.timer--;
    }, 1000);
    this.inters.push(i);
  }
  animateOpponent(wow, object) {
    // this.animateOp = true;
    // this.vector = {
    //   x: wow.newPosition.x - wow.oldPosition.x,
    //   y: 0,
    //   z: wow.newPosition.z - wow.oldPosition.z,
    // };

    // this.newPos = wow.newPosition;
    // let i = setInterval(() => {
    //   // if (this.animateOp) {
    //   const x = this.opponent.position.x;
    //   const y = this.opponent.position.y;
    //   const z = this.opponent.position.z;

    //   if (Math.ceil(x) == this.newPos.x && Math.ceil(z) == this.newPos.z) {
    //     // this.animateOp = false;
    //     clearInterval(i);
    //   }

    //   // console.log(this.vector);
    //   let mn;
    //   // this.color == "black" ? (mn = -1) : (mn = 1);
    //   console.log(
    //     this.vector.x / Math.abs(this.vector.x),
    //     this.vector.z / Math.abs(this.vector.z)
    //   );
    //   this.opponent.position.x += this.vector.x / Math.abs(this.vector.x) / 10;
    //   this.opponent.position.z += this.vector.z / Math.abs(this.vector.z) / 10;
    //   // }
    // }, 100 / 60);
    console.log(object);

    this.animation = new TWEEN.Tween(object.position)
      .to(
        {
          x: wow.newPosition.x,
          y: wow.newPosition.y,
          z: wow.newPosition.z,
        },
        500
      )
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(() => {
        console.log("idzie");
      })
      .onComplete(() => {
        this.plansza = wow.data;

        this.clearScene();
        this.renderBoard();
        this.rednerPionki();
      })
      .start();
  }
  helperClearInterval(arr) {
    arr.forEach((el) => clearInterval(el));
  }

  renderBoard() {
    const geometry = new THREE.BoxGeometry(30, 30, 30);
    let i = 0;
    let idI = 0;
    for (let index = 0; index < 8; index++) {
      for (let l = 0; l < 8; l++) {
        let color = "";
        i % 2 == 0 ? (color = "grey") : (color = "lightgrey");
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide, // dwustronny
          map: new THREE.TextureLoader().load("images.jpg"), // plik tekstury
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(-105 + 30 * l, -15, -105 + 30 * index);
        this.scene.add(cube);
        // this.board.add(cube);

        const data = {
          id: idI,
          row: index,
          col: l,
          name: "pole",
          kolor: color == "grey" ? "brown" : "grey",
          x: -105 + 30 * l,
          z: -105 + 30 * index,
        };
        cube.data = data;
        this.kafle.push(cube);
        i++;
        idI++;
        if (l == 7) i++;
      }
    }
    // this.scene.add(this.board);
  }

  rednerPionki() {
    let index = 0;
    this.plansza.forEach((el, i) => {
      el.forEach((pion, l) => {
        let pionek;
        if (pion !== 0) {
          pionek = new Pionek(pion, l, i);
          pionek.position.set(-105 + 30 * l, 5, -105 + 30 * i);
          this.scene.add(pionek);
          const data = {
            id: index,
            row: i,
            col: l,
            pionek: pionek,
            kolor: pion == 1 ? "white" : "black",
            name: "pion",
          };
          pionek.data = data;
          this.pionki.push(pionek);
          // this.pions.add(pionek);
          index++;
        }
      });
    });
    // this.scene.add(this.pions);
    this.addRaycasterEvents();
  }

  startGame(id, game) {
    this.camera = game.camera;
    this.isStarted = true;
    game.id = id;

    if (game.id == 1) {
      this.camera.position.set(0, 200, -300);
      game.color = "white";
      game.mojaTura = true;
      game.setWaiting(undefined, id);
    } else {
      this.camera.position.set(0, 200, 300);
      game.color = "black";
      game.mojaTura = false;
    }
    game.timerF();
  }

  addRaycasterEvents() {
    window.addEventListener("click", (event) => {
      if (this.waiting) return;
      const raycaster = new THREE.Raycaster();
      const mouseVector = new THREE.Vector2();

      mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVector, this.camera);

      const intersects = raycaster.intersectObjects(this.scene.children);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (!object.data) return;
        if (this.mojaTura === false) return;
        if (object.data.name == "pion" && object.data.kolor == this.color) {
          if (this.pionek) {
            this.pionek.material.color.setHex(
              this.color == "black" ? "0x000000" : "0xffffff"
            );
          }
          object.material.color.setHex(0xffa500);
          this.pionek = object;

          this.kafle.forEach((el) => {
            if (this.pionek && el.data.kolor == "brown") {
              el.material.color.setHex(0x808080);

              if (this.checkRowAndCol(el)) {
                console.log(el);
                if (
                  (this.color == "black" &&
                    this.plansza[el.data.row][el.data.col] == 1) ||
                  (this.color == "white" &&
                    this.plansza[el.data.row][el.data.col] == 2)
                ) {
                  // el.material.color.setHex(0xff0000);
                  this.pointed = el;
                } else {
                  el.material.color.setHex(0x00b300);
                }
              }
            }
          });
          //głupi sposob ale omija to bug
          if (this.pointed) {
            let znaleziono = false;
            this.kafle.forEach((el) => {
              // if (znaleziono) return;
              const bool = this.checkWithZbijanie(this.pointed, el);
              if (bool) {
                el.material.color.setHex(0x00b300);
                znaleziono = true;
              }
            });
          }
        }

        if (
          this.pionek &&
          object.data.name == "pole" &&
          object.data.kolor == "brown"
        ) {
          if (this.checkRowAndCol(object)) {
            this.animate(object);

            //wysylamy fetch do serwera i zaczynamy czekac na ruch przeciwnika (mechanika podobna jak z logowaniem)
          }

          if (!this.pointed) return;
          const index = this.checkWithZbijanie(this.pointed);

          if (index !== -1) {
            if (this.kafle[index].data.id == object.data.id) {
              //rerender Scene
              this.animate(object, true);
            }
          }
        }
      }
    });
  }

  animate(object, bicie = false) {
    if (this.plansza[object.data.row][object.data.col] !== 0) return;

    if (bicie) this.plansza[this.pointed.data.row][this.pointed.data.col] = 0;

    this.plansza[this.pionek.data.row][this.pionek.data.col] = 0;

    this.color == "black"
      ? (this.plansza[object.data.row][object.data.col] = 2)
      : (this.plansza[object.data.row][object.data.col] = 1);

    const oldPosition = {
      x: 0,
      y: 0,
      z: 0,
    };

    oldPosition.x = this.pionek.position.x;
    oldPosition.y = this.pionek.position.y;
    oldPosition.z = this.pionek.position.z;

    new TWEEN.Tween(this.pionek.position)
      .to({ x: object.data.x, z: object.data.z }, 500)
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(() => {})
      .onComplete(() => {
        this.sendTable(this.plansza, oldPosition, {
          x: object.data.x,
          y: oldPosition.y,
          z: object.data.z,
        });

        this.clearScene();
        this.renderBoard();
        this.rednerPionki();
        // this.setWaiting(this.id == 1 ? 2 : 1);
        this.client.emit("changePlayer", { color: this.color });
        this.pionek.material.color.setHex(
          this.color == "black" ? "0x000000" : "0xffffff"
        );
        this.waiting = true;
        this.pointed = undefined;
      })
      .start();
  }

  clearScene() {
    // this.board.parent.remove(this.board);
    // for (let index = 0; index < this.board.children.length; index++) {
    //   this.board.remove(this.board.children[index]);
    // }
    // for (let index = 0; index < this.pions.children.length; index++) {
    //   this.pions.remove(this.pions.children[index]);
    // }
    // // this.renderBoard();
    // for (let index = 0; index < this.scene.children.length; index++) {
    //   const el = this.scene.children[index];
    //   if (el.data) {
    //     switch (el.data.kolor) {
    //       case "grey":
    //         el.material.color.setHex("0x696969");
    //         break;
    //       case "black":
    //         el.material.color.setHex("0x000000");
    //         break;
    //       case "white":
    //         el.material.color.setHex("0xffffff");
    //         break;
    //       case "brown":
    //         el.material.color.setHex("0xa52a2a");
    //         break;
    //     }
    //   }
    // }
    while (this.scene.children.length > 0)
      this.scene.remove(this.scene.children[0]);
  }

  checkRowAndCol(el) {
    const correctRow =
      (this.color == "black" && el.data.row + 1 == this.pionek.data.row) ||
      (this.color == "white" && el.data.row - 1 == this.pionek.data.row);
    const correctCol =
      el.data.col + 1 == this.pionek.data.col ||
      el.data.col - 1 == this.pionek.data.col;
    const zajete =
      (this.color == "black" && this.plansza[el.data.row][el.data.col] == 2) ||
      (this.color == "white" && this.plansza[el.data.row][el.data.col] == 1);

    return correctRow && correctCol && !zajete;
  }

  checkRowAndColZbijany(el, base) {
    const correctRow =
      (this.color == "black" && el.data.row + 1 == base.data.row) ||
      (this.color == "white" && el.data.row - 1 == base.data.row);
    const col =
      el.data.col + 1 == base.data.col || el.data.col - 1 == base.data.col;
    return correctRow && col;
  }

  checkWithZbijanie(base, el = undefined) {
    let row;
    let index;
    this.color == "black" ? (row = 1) : (row = -1);

    index = this.kafle.findIndex((kafel) => {
      if (this.pionek.data.col + 1 == base.data.col) {
        return (
          kafel.data.row + row == base.data.row &&
          kafel.data.col - 1 == base.data.col
        );
      } else if (this.pionek.data.col - 1 == base.data.col) {
        return (
          kafel.data.row + row == base.data.row &&
          kafel.data.col + 1 == base.data.col
        );
      }
    });
    if (!el) {
      return index;
    } else {
      if (this.plansza[el.data.row][el.data.col] !== 0) return false;
      if (el.data.id == this.kafle[index].data.id) {
        return true;
      } else {
        return false;
      }
    }
  }

  //   checkKolejne(base, el) {
  //     let row;
  //     let index;
  //     this.color == "black" ? (row = 1) : (row = -1);

  //     index = this.kafle.findIndex((kafel) => {
  //       if (this.pionek.data.col + 1 == base.data.col) {
  //         return (
  //           kafel.data.row + row == base.data.row &&
  //           kafel.data.col - 1 == base.data.col
  //         );
  //       } else if (this.pionek.data.col - 1 == base.data.col) {
  //         return (
  //           kafel.data.row + row == base.data.row &&
  //           kafel.data.col + 1 == base.data.col
  //         );
  //       }
  //     });

  //     if (el.data.id == this.kafle[index].data.id) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
}
