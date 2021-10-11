const gameboard = document.getElementById("gameBoard");
const cntx = gameboard.getContext("2d");
gameboard.width = 1000;
gameboard.height = 600;

const cellSize = 100;
const cellGapping = 4;
let gridcount = 0;
const Grid = [];

const defenders = [];
const enemies = [];
const resources = [];

let enemyPosition = [];
let enemy__interval = 400;
gameOver = false;
const beams = []; //to hold all the projectile beams for all defender objects
let score = 0;
const win_score = 10;
let chosenDefender = 1;

const mouse = {
  x: 0,
  y: 0,
  width: 0.1,
  height: 0.1,
  clicked: false
};
gameboard.addEventListener("mousedown", function () {
   mouse.clicked = true;
});
gameboard.addEventListener("mouseup", function () {
  mouse.clicked = false;
});

let gameboardposition = gameboard.getBoundingClientRect();
gameboard.addEventListener("mousemove", function (e) {
  mouse.x = e.x - gameboardposition.left;
  mouse.y = e.y - gameboardposition.top;
});
gameboard.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

//bar that displays score and controls
const displayBar = {
  width: gameboard.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && ifcollide(this, mouse)) {
      cntx.strokeStyle = "black";
      cntx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function gridpush() {
  for (let y = cellSize; y < gameboard.height; y += cellSize)
    for (let x = 0; x < gameboard.width; x += cellSize) {
      Grid.push(new Cell(x, y));
    }
}
gridpush();

function create() {
  for (i = 0; i < Grid.length; i++) Grid[i].draw();
}
function ifcollide(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

//beams
class Beams {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  move() {
    this.x += this.speed;
  }
  create() {
    cntx.fillStyle = "black";
    cntx.beginPath();
    cntx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    cntx.fill();
  }
}
function handleBeams() {
  for (let i = 0; i < beams.length; i++) {
    beams[i].move();
    beams[i].create();

    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j] && beams[i] && ifcollide(beams[i], enemies[j])) {
        enemies[j].health -= beams[i].power;
        beams.splice(i, 1);
        i--;
      }
    }

    if (beams[i] && beams[i].x > gameboard.width - cellSize) {
      beams.splice(i, 1);
      i--; //no beam gets skipped
    }
  }
}

//defenders
let numberOfResources = 300;
const defender1 = new Image();
defender1.src = "alien__anime.png";

class defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGapping * 2; //to prevent collision of defenders and enemies from adjacent rows
    this.height = cellSize - cellGapping * 2;
    this.shooting = false;
    this.health = 100;
    this.timer = 0;
    this.animationX = 0;
    this.animationY = 0;
    this.animationwidth = 128;
    this.animationheight = 128;
    this.minframe = 0;
    this.maxframe = 16;
    this.chosenDefender = chosenDefender;
  }
  draw() {
    // cntx.fillStyle = "blue";
    // cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "gold";
    cntx.font = "30px Poppins";
    cntx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    if(this.chosenDefender === 1){
      cntx.drawImage(
        defender1,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if(this.chosenDefender ===2 ){
      cntx.drawImage(
        defender1,
        this.animationX * this.animationwidth,
        0,
        this.animationwidth,
        this.animationheight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    
  }
  update_beam() {
    if (gridcount % 10 === 0) {
      if (this.animationX < this.maxframe) this.animationX++;
      else this.animationX = this.minframe;
    }
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        beams.push(new Beams(this.x + 50, this.y + 50));
      }
    } else {
      this.timer = 0;
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update_beam();

    if (enemyPosition.indexOf(defenders[i].y) !== -1) {
      // beam wont be fired untill enemy occurs
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }

    for (let j = 0; j < enemies.length; j++) {
      if (ifcollide(defenders[i] && defenders[i], enemies[j])) {
        enemies[i].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}

//switching units for defenders
const layout1 = {
  x: 10,
  y: 10,
  width: 70,
  height: 85
}
const layout2 = {
  x: 90,
  y: 10,
  width: 70,
  height: 85
}
function selectDefender(){
  let layout1stroke = "black";
  let layout2stroke = "black";
  if(ifcollide(mouse, layout1) && mouse.clicked){
    chosenDefender = 1;
  }
  else if(ifcollide(mouse, layout2) && mouse.clicked){
    chosenDefender = 2;
  }
  
  if(chosenDefender === 1){
     layout1stroke = "gold";
     layout2stroke = "black";
  }else if(chosenDefender === 2){
     layout2stroke = "gold";
     layout1stroke = "black";
  }else{
    layout1stroke = "black";
    layout2stroke = "black";
  }
  
  cntx.linewidth = 1;
  cntx.fillStyle = "rgba(0,0,0,0.2)"
  cntx.fillRect(layout1.x, layout1.y, layout1.width, layout1.height);
  cntx.strokeStyle = layout1stroke;
  cntx.strokeRect(layout1.x, layout1.y, layout1.width, layout1.height);
  cntx.drawImage(defender1, 0, 0, 180, 194, 0, 5, 194/2, 194/2);
  cntx.fillRect(layout2.x, layout2.y, layout2.width, layout2.height);
  cntx.strokeStyle = layout2stroke;
  cntx.strokeRect(layout2.x, layout2.y, layout2.width, layout2.height);
  cntx.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194/2, 194/2);
}


//Messages
const messages = [];
class message {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }
  change_y() {
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.001) this.opacity -= 0.01;
  }
  draw() {
    cntx.globalAlpha = this.opacity; //sets current transparency value
    cntx.fillStyle = this.color;
    cntx.font = this.size + "px Orbitron";
    cntx.fillText(this.value, this.x, this.y);
    cntx.globalAlpha = 1;
  }
}
function handlemessages() {
  for (let i = 0; i < messages.length; i++) {
    messages[i].change_y();
    messages[i].draw();
    if (messages[i].lifeSpan >= 50) {
      messages.splice(i, 1);
      i--;
    }
  }
}

//Enemies

const EnemyTypes = [];
const enemy1 = new Image();
enemy1.src = "incoming1.png";
EnemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = "incoming2.png";
EnemyTypes.push(enemy2);
const enemy3 = new Image();
enemy3.src = "incoming3.png";
EnemyTypes.push(enemy3);

class Enemy {
  constructor(verticalPosition) {
    this.x = gameboard.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGapping * 2;
    this.height = cellSize - cellGapping * 2;
    this.speed = Math.random() * 0.01 + 0.3;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
    this.EnemyType = EnemyTypes[Math.floor(Math.random() * EnemyTypes.length)];
    this.animationX = 0;
    this.animationY = 0;
    this.minframe = 0;
    this.maxframe = 4;
    this.animationwidth = 128;
    this.animationheight = 128;
  }
  change() {
    this.x -= this.movement;
    if (gridcount % 10 === 0) {
      if (this.animationX < this.maxframe) this.animationX++;
      else this.animationX = this.minframe;
    }
  }
  draw() {
    // cntx.fillStyle = "red";
    // cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "black";
    cntx.font = "30px Poppins";
    cntx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    cntx.drawImage(
      this.EnemyType,
      this.animationX * this.animationwidth,
      0,
      this.animationwidth,
      this.animationheight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
function enemy() {
  for (i = 0; i < enemies.length; i++) {
    enemies[i].change();
    enemies[i].draw();

    if (enemies[i].x < 0) {
      gameOver = true;
    }

    if (enemies[i].health <= 0) {
      let earnedResources = enemies[i].maxHealth / 10;
      messages.push(new message("+ " + earnedResources, 250, 20, 20, "gold"));
      messages.push(
        new message(
          "+ " + earnedResources,
          enemies[i].x,
          enemies[i].y,
          20,
          "black"
        )
      );
      numberOfResources += earnedResources;
      score += earnedResources;
      const index_position = enemyPosition.indexOf(enemies[i].y);
      enemyPosition.splice(index_position, 1);
      enemies.splice(i, 1);
      i--;
    }
  }

  if (gridcount % enemy__interval === 0 && score < win_score) {
    let verticalPosition =
      Math.floor(Math.random() * 6 + 1) * cellSize + cellGapping;
    enemies.push(new Enemy(verticalPosition));
    enemyPosition.push(verticalPosition);
    if (enemy__interval > 180) enemy__interval -= 100;
  }
}

//additional resources
const value = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (gameboard.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.value = value[Math.floor(Math.random() * value.length)];
  }
  draw() {
    cntx.fillStyle = "yellow";
    cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "black";
    cntx.font = "20px Orbitron";
    cntx.fillText(this.value, this.x + 15, this.y + 25);
  }
}
function handleResources() {
  if (gridcount % 500 === 0 && score < win_score) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && ifcollide(resources[i], mouse)) {
      numberOfResources += resources[i].value;
      messages.push(
        new message(
          "+ " + resources[i].value,
          resources[i].x,
          resources[i].y,
          20,
          "black"
        )
      );
      messages.push(
        new message("+ " + resources[i].value, 300, 55, 20, "gold")
      );
      resources.splice(i, 1);
      i--;
    }
  }
}

function gameStatus() {
  cntx.fillStyle = "black";
  cntx.font = "30px Poppins";
  cntx.fillText("Score: " + score, 170, 40);
  cntx.fillText("Resources: " + numberOfResources, 170, 80);
  if (gameOver) {
    fillStyle = "black";
    cntx.font = "190 px poppins";
    cntx.fillText("Game Over", 150, 330);
  }
  if (score > win_score && enemies.length === 0) {
    cntx.fillStyle = "black";
    cntx.font = "60px Orbitron";
    cntx.fillText("LEVEL COMPLETE", 130, 300);
    cntx.font = "30px Orbitron";
    cntx.fillText("You win with " + score + " points", 134, 340);
  }
}

//event listener for creating defenders
gameboard.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGapping;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGapping;
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderPower = 100;
  if (numberOfResources >= defenderPower) {
    defenders.push(new defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderPower;
  } else {
    messages.push(
      new message("Need more Resources", mouse.x, mouse.y, 20, "blue")
    );
  }
});

function main__animation() {
  //to update displayBar and grid after every change
  cntx.clearRect(0, 0, gameboard.width, gameboard.height);
  cntx.fillStyle = "skyblue";
  cntx.fillRect(0, 0, displayBar.width, displayBar.height);
  create();
  handleDefenders();
  handleResources();
  handleBeams();
  enemy();
  selectDefender();
  gameStatus();
  handlemessages();
  gridcount++;
  if (!gameOver) requestAnimationFrame(main__animation);
}
main__animation();
