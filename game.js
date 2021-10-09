const gameboard = document.getElementById('gameBoard');
const cntx= gameboard.getContext('2d');
gameboard.width = 1000;
gameboard.height = 600;

const cellSize = 100;
const cellGapping = 4;
const Grid=[];

const mouse= {
    x:10,
    y:10,
    width: 0.1,
    height: 0.1
}

let gameboardposition = gameboard.getBoundingClientRect();
gameboard.addEventListener('mousemove',function(e){
    mouse.x = e.x- gameboardposition.left;
    mouse.y = e.y- gameboardposition.top;
});
gameboard.addEventListener('mouseleave',function(){
    mouse.x=undefined;
    mouse.y=undefined;
})

//bar that displays score and controls
const displayBar= {
    width: gameboard.width,
    height: cellSize,
}

class Cell{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
      if(mouse.x && mouse.y && ifcollide(this,mouse))
      {
          cntx.strokeStyle = "black";
          cntx.strokeRect(this.x,this.y,this.width,this.height);
      }
    }
}

function gridpush(){
  for(let y=cellSize; y<gameboard.height; y+=cellSize)
         for(let x=0; x<gameboard.width; x+=cellSize)
         {
            Grid.push(new Cell(x,y));
         }
}
gridpush();

function create(){
    for(i=0;i<Grid.length;i++)
        Grid[i].draw();
}

function update(){ //to update displayBar and grid after every change
    cntx.clearRect(0,0,gameboard.width,gameboard.height);
    cntx.fillStyle='skyblue';
    cntx.fillRect(0,0,displayBar.width,displayBar.height);
    create();
    requestAnimationFrame(update);
}
update();

function ifcollide(first, second){
    if( !( first.x > second.x + second.width ||
           first.x + first.width < second.x ||
           first.y > second.y + second.height ||
           first.y + first.height <second.y))
           {
               return true;
           }
}