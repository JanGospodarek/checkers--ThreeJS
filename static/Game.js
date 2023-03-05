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
  kafle = [];
  intervals = [];
  movingIntervals = [];
  constructor(client, sendTable, setWaiting) {
    this.client = client;
    this.setWaiting = setWaiting;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xfffff0);
    this.renderer.setSize(window.innerWidth, window.innerHeight, true);
    document.getElementById("root").append(this.renderer.domElement);
    const axes = new THREE.AxesHelper(1000);
    this.scene.add(axes);
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.client.on("onWait", (data) => {
      if (!data.timer) return;
      this.timer = data.timer;
      if (this.id == data.curPLayer) {
        this.renderTimer(`Pozostało na ruch: ${this.timer}`);
        this.waiting = false;
      } else {
        this.renderTimer(`Ruch przeciwnika, pozostało: ${this.timer}`);
        this.waiting = true;
      }
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
      if (wow.fromClient) return;

      const index = this.pionki.findIndex(
        (el) =>
          el.position.x == wow.oldPosition.x &&
          el.position.z == wow.oldPosition.z
      );

      this.animateOpponent(wow, this.pionki[index]);
    });

    this.render();
  }

  render = () => {
    requestAnimationFrame(this.render);
    TWEEN.update();

    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  renderTimer(time) {
    document.getElementById("timer").innerText = time;
  }
  animateOpponent(wow, object) {
    new TWEEN.Tween(object.position)
      .to(
        {
          x: wow.newPosition.x,
          y: object.position.y,
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
        i % 2 == 0 ? (color = "brown") : (color = "grey");
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,

          opacity: 1,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(-105 + 30 * l, -15, -105 + 30 * index);
        this.scene.add(cube);
        const data = {
          id: idI,
          row: index,
          col: l,
          name: "pole",
          kolor: color,
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
          index++;
        }
      });
    });
    this.addRaycasterEvents();
  }

  startGame(id, game) {
    this.camera = game.camera;
    this.isStarted = true;
    game.id = id;
    if (game.id == 1) {
      this.camera.position.set(0, 200, -300);
      game.color = "white";
      game.setWaiting(undefined, id);
    } else {
      this.camera.position.set(0, 200, 300);
      game.color = "black";
    }
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

        if (object.data.name == "pion" && object.data.kolor == this.color) {
          if (this.pionek) {
            this.pionek.material.color.setHex(
              this.color == "black" ? "0x000000" : "0xffffff"
            );
          }
          // object.material.color.setHex(0xffa500);
          this.pionek = object;
          this.kafle.forEach((el) => {
            if (this.pionek && el.data.kolor == "brown") {
              el.material.color.setHex(0xa52a2a);

              if (this.checkRowAndCol(el)) {
                if (
                  (this.color == "black" &&
                    this.plansza[el.data.row][el.data.col] == 1) ||
                  (this.color == "white" &&
                    this.plansza[el.data.row][el.data.col] == 2)
                ) {
                  el.material.color.setHex(0xff0000);
                  this.pointed = el;

                  // const index = this.checkWithZbijanie(this.pointed);

                  // this.kafle[index].material.color.setHex(0x00b300);
                  // el.material.color.setHex(0x00b300);
                } else {
                  el.material.color.setHex(0x00b300);
                }
              }
            }
          });
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
      z: 0,
    };

    oldPosition.x = this.pionek.position.x;
    oldPosition.z = this.pionek.position.z;

    new TWEEN.Tween(this.pionek.position)
      .to({ x: object.data.x, z: object.data.z }, 500)
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(() => {})
      .onComplete(() => {
        this.sendTable(this.plansza, oldPosition, {
          x: object.data.x,
          z: object.data.z,
        });

        this.clearScene();
        this.renderBoard();
        this.rednerPionki();
        this.setWaiting(this.id == 1 ? 2 : 1);

        this.pionek.material.color.setHex(
          this.color == "black" ? "0x000000" : "0xffffff"
        );
        this.waiting = true;
        this.pointed = undefined;
      })
      .start();
  }

  clearScene() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
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
