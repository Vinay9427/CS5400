const fs = require('fs')

let a;
let isInitialPenguPosition = true;
let penguInitialPosition ;
let pathArray = [];
let counter = 0;

let directions = [
                  [1, [1, -1]],
                  [2, [1, 0]],
                  [3, [1, 1]],
                  [4, [0, -1]],
                  [6, [0, 1]],
                  [7, [-1, -1]],
                  [8, [-1, 0]],
                  [9, [-1, 1]],
                ]

function log(...params){
  return console.log(params)
}

function readAndLoadPositions(){
  fs.readFile('input.txt', 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    a = data.split('\n').map(i => i.trim().split('')).slice(1)
    //log(a)
    for(let i = 0; i< a.length;i++){
      for(let j = 0; j< a[0].length;j++){
        if(a[i][j] == 'P'){
          penguInitialPosition = [i,j]
        }
      }
    }
    a[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    let output = [];
    
    pathArray = [];
      isInitialPenguPosition = true;
      const tempGrid = JSON.parse(JSON.stringify(a));
      output = penguSlider(tempGrid, penguInitialPosition, counter)
    do{
      pathArray = [];
      isInitialPenguPosition = true;
      fishCount = 0;
      const tempGrid = JSON.parse(JSON.stringify(a));
      output = penguSlider(tempGrid, penguInitialPosition, counter, fishCount)
      console.log(output,'---------------------------start again');
    }while(output[1].length !== 6)
  })  

}

function penguSlider(grid, penguPosition, counter, fishCount){
  
  if(grid[penguPosition[0]][penguPosition[1]] == 'U' || grid[penguPosition[0]][penguPosition[1]] == 'S'){
    console.log('----------')
    console.log('Caught by Bear/ Shark!')
    grid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    grid[penguPosition[0]][penguPosition[1]] = 'X';
    // log(grid, pathArray, fishCount)
    console.log('----------')
    return [grid, pathArray, fishCount];
  }
  console.log(penguPosition);
  if((isInitialPenguPosition || grid[penguPosition[0]][penguPosition[1]] == '0') && counter < 6){
    moves = getNextMoves(penguPosition);
    isInitialPenguPosition = false;
    const [direction, randomMove] = getRandomValidMove(moves, grid);
    pathArray.push(direction)
    counter++;
    return penguSlider(grid, randomMove, counter, fishCount);
  }
  // after eating fish the cell will be the ice cell so it does not need return statement
  if(grid[penguPosition[0]][penguPosition[1]] == '*'){
    log('Fish got caught!', penguPosition); 
    fishCount++;
    grid[penguPosition[0]][penguPosition[1]] = ' ';
    //log('Fish got caught!', penguPosition,'direction',direction,'nextMove', nextMove, randomMove);
  }
  if(grid[penguPosition[0]][penguPosition[1]] == ' '){
    //const nextMove = continueInTheSameDirection(direction, randomMove)
    const direction = pathArray[pathArray.length-1];
    const nextMove = continueInTheSameDirection(direction, penguPosition)
    if(grid[nextMove[0]][nextMove[1]] == '#' && counter < 6){
      moves = getNextMoves(penguPosition);
      const [direction1, randomMove1] = getRandomValidMove(moves, grid);  
      pathArray.push(direction1)
      counter++;
      return penguSlider(grid, randomMove1, counter, fishCount);
    }else if(grid[nextMove[0]][nextMove[1]] != '#'){
      console.log('asdfasdf')
      return penguSlider(grid, nextMove, counter, fishCount)
    }
  }
  if(counter == 6){
    console.log('----------')
    console.log('Counter 6')
    grid[penguPosition[0]][penguPosition[1]] = 'P';
    log(grid, 'pathArray: ', pathArray, 'fishCount: ',fishCount)
    console.log('----------')
    return [grid, pathArray, fishCount];
  }
}

// Perform this when Pengu gets stuck by hitting a Wall or by the Snow cell
function getNextMoves(penguPosition){
  let moves = [];
  const x = penguPosition[0];
  const y = penguPosition[1];
  directions.forEach(item => moves.push([item[0],[x+item[1][0], y+item[1][1]]]))
  return moves;
}

function getRandomValidMove(moves, grid){
  const randMoves = [];
  moves.forEach((item) => {
    //log('getRandomValidMove',item)
    if(item != undefined){
      if(grid[item[1][0]][item[1][1]] != '#'){
        randMoves.push([item[0], item[1]])
      }
    }
  })
  const randomIndex = Math.floor(Math.random() * randMoves.length);
  return [randMoves[randomIndex][0], randMoves[randomIndex][1]]
}

function continueInTheSameDirection(direction, currentPos, multiplier){
  const coordinateForTheDirection = directions.find(dir => dir[0] == direction)[1];
  const [nextX, nextY] = coordinateForTheDirection;
  const nextMove = [currentPos[0]+nextX, currentPos[1]+nextY]
  return nextMove;
}


readAndLoadPositions();