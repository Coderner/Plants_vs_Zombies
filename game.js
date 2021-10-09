const gameboard = document.getElementById("gameBoard");
const cntx = gameboard.getContext("2d");
gameboard.width = 1000;
gameboard.height = 600;

const cellSize = 100;
const cellGapping = 4;
const Grid = [];

const defenders = [];
const enemies = [];
let gridcount = 0;
let enemyPosition = [];
let enemy__interval = 400;
gameOver = false;
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};

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
//defenders
let numberOfResources = 300;

class defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.ammo = [];
    this.timer = 0;
  }
  draw() {
    cntx.fillStyle = "blue";
    cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "gold";
    cntx.font = "30px Poppins";
    cntx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}
gameboard.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderPower = 100;
  if (numberOfResources >= defenderPower) {
    defenders.push(new defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderPower;
  }
});
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
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

//zombies
class Enemy {
  constructor(verticalPosition) {
    this.x = gameboard.width;
    this.y = verticalPosition;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.4 + 0.3;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  change() {
    this.x -= this.movement;
  }
  draw() {
    cntx.fillStyle = "red";
    cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "black";
    cntx.font = "30px Poppins";
    cntx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}
function enemy() {
  for (i = 0; i < enemies.length; i++) {
    enemies[i].change();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
  }
  if (gridcount % enemy__interval === 0) {
    let verticalPosition = Math.floor(Math.random() * 6 + 1) * cellSize;
    enemies.push(new Enemy(verticalPosition));
    enemyPosition.push(verticalPosition);
    if (enemy__interval > 180) enemy__interval -= 100;
  }
}

function gameStatus() {
  cntx.fillStyle = "black";
  cntx.font = "30px Poppins";
  cntx.fillText("Left: " + numberOfResources, 20, 55);
  if (gameOver) {
    fillStyle = "black";
    cntx.font = "90 px Poppins";
    cntx.fillText("Game Over", 150, 330);
  }
}

function update() {
  //to update displayBar and grid after every change
  cntx.clearRect(0, 0, gameboard.width, gameboard.height);
  cntx.fillStyle = "skyblue";
  cntx.fillRect(0, 0, displayBar.width, displayBar.height);
  create();
  handleDefenders();
  enemy();
  gameStatus();
  gridcount++;
  if (!gameOver) requestAnimationFrame(update);
}
update();
