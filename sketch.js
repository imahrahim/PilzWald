
 var socket;

let data = [];
let systems = [];

let yScalePlant = d3.scalePoint();
let yScaleFungi = d3.scalePoint();
let vScaleConnection = d3.scaleSqrt();
let cScale = d3.scaleOrdinal();
let colScale = d3.scaleSequential();

let v1;
let v2;

let xFungi;
let yFungi;
let imageArray;
let currentImage = 0;


function setup() {
  createCanvas(1920 * 2, 1080);

  //socket = socket.io.connect('http://localhost:3000');
  socket = io.connect("https://dda-miflck.herokuapp.com/");


    // Callback function
    socket.on("message", (data) => {
      console.log("callback from server", data);
      switch(data){
        case 1:
          currentImage = 1;
          break;
      }
      switch(data){
        case 2:
          currentImage = 2;
          break;
      }
      switch(data){
        case 3:
          currentImage = 3;
          break;
      }
      switch(data){
        case 4:
          currentImage = 4;
          break;
      }
      switch(data){
        case 5:
          currentImage = 5;
          break;
      }
      switch(data){
        case 6:
          currentImage = 6;
          break;
      }
      switch(data){
        case 7:
          currentImage = 7;
          break;
      }
      switch(data){
        case 8:
          currentImage = 8;
          break;
      }
    });
  
    // gets called when new client arrives
    socket.on("client connected", (data) => {
      console.log("client added", data);
    });

  wald = loadImage("M/Wald_Bild.png");
  m1 = loadImage("M/M1.png");
  m2 = loadImage("M/M2.png");
  m3 = loadImage("M/M3.png");
  m4 = loadImage("M/M4.png");
  m5 = loadImage("M/M5.png");
  m6 = loadImage("M/M6.png");
  m7 = loadImage("M/M7.png");
  m8 = loadImage("M/M8.png");

  imageArray = [wald, m1, m2, m3, m4, m5, m6, m7, m8];

  d3.csv("Matrix97.csv", d3.autoType).then((csv, error) => {
    data = csv;



    let plant = data.map(function (d) {
      return d.Plant;
    });

    let fungi = data.map(function (d) {
      return d.Fungi;
    });

    let module = data.map(function (d) {
      return d.Module;
    });

    let fun = data.map(function (d) {
      return d.Function;
    });

    let plants = _.uniq(plant);
    let fungis = _.uniq(fungi);
    let modules = _.uniq(module);
    let functions = _.uniq(fun);

    console.log(plants);
    console.log(fungis);
    console.log(modules);
    console.log(functions);

    yScalePlant = d3
      .scalePoint()
      .domain(plants)
      .range([50, 1920 - 50]);
    yScaleFungi = d3.scalePoint().domain(fungis).range([20, 780]);
    cScale = d3
      .scaleOrdinal()
      .domain(modules)
      .range(["#717bc1",
      "#979446",
      "#ae66b1",
      "#59a270",
      "#bf637d",
      "#74b3c9",
      "#bc764f",
      "#4c707b"]);
    colScale = d3
      .scaleSequential()
      .domain(modules)
      .interpolator(d3.interpolatePuBuGn);

    for (let i = 0; i < data.length; i++) {
      let plant = data[i].Plant;
      let fungi = data[i].Fungi;
      let functions = data[i].Function;
      let modules = data[i].Module;

      let xPlant = yScalePlant(plant);
      yFungi = random(50, height - 50);
      xFungi = random(50, 1920 - 50);
      //let yFungi = yScaleFungi(fungi);
      let s = data[i].Connection * 0.5;
      let c = cScale(modules);

      v1 = createVector(xPlant, height / 2);
      v2 = createVector(xFungi, yFungi);

      let ps = new ParticleSystem(v1, v2, s, c);

      systems.push(ps);
    }
  });

  noStroke();
}

function draw() {
  background(4, 47, 16, 30);

  for (let i = 0; i < data.length; i++) {
    if (data[i].Module == currentImage) {
      let n = 10;
      if (data[i].Function == "AM") {
        n = 10;
      }
      if (data[i].Function == "Unknown") {
        n = 40;
      }
      if (data[i].Function == "EcM") {
        n = 1;
      }
      if (frameCount % n == 0) {
        systems[i].addParticle();
      }
    }
  }

  for (let i = 0; i < systems.length; i++) {
    systems[i].run();
  }

  for (let i = 0; i < data.length; i++) {
    let plant = data[i].Plant;
    let fungi = data[i].Fungi;
    let modules = data[i].Module;
    let functions = data[i].Function;

    let xPlant = yScalePlant(plant);
    //let yFungi = yScaleFungi(fungi);
    let c = cScale(modules);
    let col = colScale(modules);

    noStroke();
    fill(c);
    ellipse(xPlant, height / 2, 5);
  }

  image(imageArray[currentImage], 1920, 0);
}

class ParticleSystem {
  constructor(v1, v2, s, c) {
    this.start = v2;
    this.end = v1;
    this.particles = [];
    this.stroke = s;
    this.color = c;
  }

  addParticle() {
    let p = new Particle(this.end, this.start, this.stroke, this.color);
    this.particles.push(p);

    fill(this.color);
    ellipse(this.start.x, this.start.y, 3);

    // if (frameCount % n == 0) {
    //   let p = new Particle(this.end, this.start, this.stroke, this.color);
    //   this.particles.push(p);
    // }
  }
  run() {

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.update();
      p.display();

      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class Particle {
  constructor(v1, v2, s, c) {
    this.start = v2;
    this.end = v1;
    this.maxSpeed = 1;
    this.maxForce = 0.1;
    this.vel = createVector(0, 0);
    this.acc = createVector(1, 1);
    this.v = p5.Vector.sub(this.end, this.start);
    this.v.setMag(this.maxSpeed);
    this.vel = this.v;
    this.lifespan = 60;
    this.stroke = s;
    this.pos = this.start.copy();
    this.color = c;
    this.n = 3;
    let distance = dist(this.start.x, this.start.y, this.end.x, this.end.y);
    this.weg = this.n / distance;

    //console.log(this.weg);
  }

  update() {
    this.n = this.n - this.weg;

    if (this.n < 0.5) {
      let f = p5.Vector.sub(this.end, this.pos);
      f.setMag(this.maxSpeed);
      this.vel = f;
      this.n = 0;
    }

    let noiseValue = noise(this.pos.x * 0.1, this.pos.y * 0.1);
    let theta = map(noiseValue, 0, 1, -this.n, this.n);

    this.pos.y += theta;
    this.pos.x += theta;

    this.pos.add(this.vel);

    this.lifespan = this.lifespan - 1;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.stroke);
  }
  isDead() {
    return this.pos.x < 0;
  }
}

function keyPressed() {
  if (key == "s") {
    saveCanvas("fungi", "png");
  }
 }
