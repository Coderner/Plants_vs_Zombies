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

//beams
class Beams {
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  move(){
    this.x += this.speed;
  }
  create(){
    cntx.fillStyle = "black";
    cntx.beginPath();
    cntx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    cntx.fill();
  }
}
function handleBeams(){
  for( let i = 0; i < beams.length; i++ ){
    beams[i].move();
    beams[i].create();

    for(let j = 0; j < enemies.length; j++){
      if (enemies[j] && beams[i] && ifcollide(beams[i],enemies[j]))
      {
        enemies[j].health -= beams[i].power;
        beams.splice(i,1);
        i--;

      }
    }

    if(beams[i] && beams[i].x > gameboard.width - cellSize){
      beams.splice(i, 1);
      i--; //no beam gets skipped
    }
  }
}


//defenders
let numberOfResources = 300;

class defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGapping * 2; //to prevent collision of defenders and enemies from adjacent rows
    this.height = cellSize - cellGapping * 2;
    this.shooting = false;
    this.health = 100;
    this.timer = 0;
  }
  draw() {
    cntx.fillStyle = "blue";
    cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "gold";
    cntx.font = "30px Poppins";
    cntx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
  update_beam(){
    if(this.shooting){
      this.timer ++;
      if(this.timer % 100 === 0){
        beams.push(new Beams(this.x + 50 ,this.y + 50));
      }
    }
    else{
      this.timer = 0;
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update_beam();

    if(enemyPosition.indexOf(defenders[i].y) !== -1) // beam wont be fired untill enemy occurs
        {
          defenders[i].shooting = true;
        }    
    else{
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

//Messages
const messages = [];
class message {
  constructor(value, x, y, size, color){
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }
  change_y(){
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.001)
       this.opacity -= 0.01;
  }
  draw(){
    cntx.globalAlpha = this.opacity; //sets current transparency value
    cntx.fillStyle = this.color;
    cntx.font = this.size + "px Orbitron";
    cntx.fillText(this.value, this.x, this.y);
    cntx.globalAlpha = 1;
  }
}
function handlemessages(){
  for(let i=0; i<messages.length; i++){
    messages[i].change_y();
    messages[i].draw();
    if(messages[i].lifeSpan >= 50){
       messages.splice(i,1);
       i--;
    }     
  }
}


//Enemies
class Enemy {
  constructor(verticalPosition) {
    this.x = gameboard.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGapping * 2;
    this.height = cellSize - cellGapping * 2;
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

    if (enemies[i].health <= 0){
      let earnedResources = enemies[i].maxHealth/10;
      messages.push(new message("+ " + earnedResources ,130 ,20 , 20, "gold"));
      messages.push(new message("+ " + earnedResources ,enemies[i].x ,enemies[i].y , 20, "black"));
      numberOfResources += earnedResources;
      score += earnedResources; 
      const index_position = enemyPosition.indexOf(enemies[i].y);
      enemyPosition.splice(index_position,1);
      enemies.splice(i,1);
      i--;
  }
 }
  
 if (gridcount % enemy__interval === 0 && score < win_score) {
    let verticalPosition = Math.floor(Math.random() * 6 + 1) * cellSize + cellGapping;
    enemies.push(new Enemy(verticalPosition));
    enemyPosition.push(verticalPosition);
    if (enemy__interval > 180) enemy__interval -= 100;
  }
}

//additional resources
const value = [20, 30, 40];
class Resource {
  constructor(){
    this.x = Math.random() * (gameboard.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.value = value[Math.floor(Math.random() * value.length)];
  }
  draw(){
    cntx.fillStyle = "yellow";
    cntx.fillRect(this.x, this.y, this.width, this.height);
    cntx.fillStyle = "black";
    cntx.font = "20px Orbitron";
    cntx.fillText(this.value, this.x + 15, this.y + 25);
  }
}
function handleResources(){
  if(gridcount % 500 === 0 && score < win_score){
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++){
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && ifcollide(resources[i], mouse))
    {
      numberOfResources += resources[i].value;
      messages.push(new message("+ " + resources[i].value, resources[i].x, resources[i].y, 20, "black"));
      messages.push(new message("+ " + resources[i].value,  120, 55, 20, "gold"));
      resources.splice(i,1);
      i--;
    }
  }
}


function gameStatus() {
  cntx.fillStyle = "black";
  cntx.font = "30px Poppins";
  cntx.fillText("Score: " + score, 20, 40);
  cntx.fillText("Left: " + numberOfResources, 20, 80);
  if (gameOver) {
    fillStyle = "black";
    cntx.font = "90 px Poppins";
    cntx.fillText("Game Over", 150, 330);
  }
  if (score > win_score && enemies.length === 0){
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
  }
  else{
    messages.push(new message("Need more Resources", mouse.x, mouse.y, 20, "blue"));
  }
});

function update() {
  //to update displayBar and grid after every change
  cntx.clearRect(0, 0, gameboard.width, gameboard.height);
  cntx.fillStyle = "skyblue";
  cntx.fillRect(0, 0, displayBar.width, displayBar.height);
  create();
  handleDefenders();
  handleResources();
  handleBeams();
  enemy();
  gameStatus();
  handlemessages();
  gridcount++;
  if (!gameOver) requestAnimationFrame(update);
}
update();
