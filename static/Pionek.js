export class Pionek extends THREE.Mesh {
  constructor(num, l, i) {
    super(); // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha
    this.num = num;
    this.l = l;
    this.i = i;
    this.num == 1 ? (this.color = "white") : (this.color = "black");

    this.material = new THREE.MeshBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide, // dwustronny
      map: new THREE.TextureLoader().load("crack.png"), // plik tekstury
    });
    this.geometry = new THREE.CylinderGeometry(12, 12, 10, 32);
    this.cylinder = new THREE.Mesh(this.geometry, this.material);
  }
}
