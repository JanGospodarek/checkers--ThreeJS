import { Pionek } from "./Pionek.js";
export default class Game {
  pionki = [];
  color;
  pionek;
  isStarted;
  running = false;
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
    this.renderer.setSize(window.innerWidth, window.innerHeight - 100, true);
    document.getElementById("root").append(this.renderer.domElement);
    const axes = new THREE.AxesHelper(1000);
    this.scene.add(axes);
    this.camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 10000);

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
      console.log(
        { x: wow.oldPosition.x, y: 5, z: wow.oldPosition.z },
        { x: wow.newPosition.x, z: wow.newPosition.z }
      );

      this.plansza = wow.data;
      // new TWEEN.Tween({ x: wow.oldPosition.x, y: 5, z: wow.oldPosition.z })
      //   .to({ x: wow.newPosition.x, y: 5, z: wow.newPosition.z }, 500)
      //   .onUpdate(() => {})
      //   .onComplete(() => {
      this.clearScene();
      this.renderBoard();
      this.rednerPionki();
      //   })
      //   .start();
    });
    this.render();
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.camera.lookAt(0, 0, 0);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  renderTimer(time) {
    document.getElementById("timer").innerText = time;
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
                  // this.kafle.forEach((kafel) => {
                  //   if (this.checkRowAndColZbijany(kafel, el)) {
                  //     kafel.material.color.setHex(0x00b300);
                  //   }
                  // });
                  el.material.color.setHex(0xff0000);

                  // if (
                  //   el.data.col + 1 == this.pionek.data.col ||
                  //   el.data.col - 1 == this.pionek.data.col
                  // ) {
                  if (this.color == "white") {
                    const index = this.kafle.findIndex(
                      (kafel) =>
                        kafel.data.row - 1 == el.data.row &&
                        (kafel.data.col + 1 == el.data.col ||
                          kafel.data.col - 1 == el.data.col)
                    );
                    console.log(this.kafle[index]);
                    this.kafle[index].material.color.setHex(0xff0000);
                  }
                  if (this.color == "black") {
                    const index = this.kafle.findIndex(
                      (kafel) =>
                        kafel.data.row + 1 == el.data.row &&
                        (kafel.data.col + 1 == el.data.col ||
                          kafel.data.col - 1 == el.data.col)
                    );
                    console.log(this.kafle[index]);

                    this.kafle[index].material.color.setHex(0xff0000);
                  }
                  // }
                } else {
                  el.material.color.setHex(0x00b300);
                }
              }
            }
          });
        }

        if (
          this.pionek &&
          object.data.name == "pole" &&
          object.data.kolor == "brown"
        ) {
          if (this.checkRowAndCol(object)) {
            this.plansza[this.pionek.data.row][this.pionek.data.col] = 0;
            this.color == "black"
              ? (this.plansza[object.data.row][object.data.col] = 2)
              : (this.plansza[object.data.row][object.data.col] = 1);
            //rerender Scene
            const oldPosition = {
              x: 0,
              z: 0,
            };
            oldPosition.x = this.pionek.position.x;
            oldPosition.z = this.pionek.position.z;
            new TWEEN.Tween(this.pionek.position)
              .to({ x: object.data.x, z: object.data.z }, 500)
              .onUpdate(() => {})
              .onComplete(() => {
                this.sendTable(this.plansza, oldPosition, {
                  x: object.data.x,
                  z: object.data.z,
                });

                this.clearScene();
                this.renderBoard();
                this.rednerPionki();
                this.pionek.material.color.setHex(
                  this.color == "black" ? "0x000000" : "0xffffff"
                );
                this.setWaiting(this.id == 1 ? 2 : 1);
                this.waiting = true;
              })
              .start();

            //wysylamy fetch do serwera i zaczynamy czekac na ruch przeciwnika (mechanika podobna jak z logowaniem)
          }
        }
      }
    });
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
    console.log(el.data.row, base.data.row);
    const correctRow =
      (this.color == "black" && el.data.row + 1 == base.data.row) ||
      (this.color == "white" && el.data.row - 1 == base.data.row);
    const col =
      el.data.col + 1 == base.data.col || el.data.col - 1 == base.data.col;
    return correctRow && col;
  }
}
