const fs = require('fs')

let a;
let isInitialPenguPosition = false;
let fishArray = [];
let penguPosition ;
let hazardArray = [];
let pathArray = [];
let counter = 0;
let fishCount = 0;
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
    log(a)
    for(let i = 0; i< a.length;i++){
      for(let j = 0; j< a[0].length;j++){
        // if(a[i][j] == 'U' || a[i][j] == 'S'){
        //   hazardArray.push([i,j]);
        // }
        if(a[i][j] == 'P'){
          penguPosition = [i,j]
        }
        // if(a[i][j] == '*'){
        //   fishArray.push([i,j])
        // }
      }
    }
    penguSlider(a, penguPosition, counter)
  })  

}

function penguSlider(grid, penguPosition, counter){
  //grid[penguPosition[0]][penguPosition[1]] = ' ';
  let continueSliding = false;
  
  if(grid[penguPosition[0]][penguPosition[1]] == 'U' || grid[penguPosition[0]][penguPosition[1]] == 'S'){
    console.log('----------')
    console.log('Caught by Bear/ Shark!'); 
    console.log('pathArray: ',pathArray)
    console.log('fishCount: ', fishCount)
    console.log('----------')
    grid[penguPosition[0]][penguPosition[1]] = 'X';
    return;
  }

  if(counter == 6){
    console.log('----------')
    console.log('Counter 6')
    console.log('pathArray: ',pathArray)
    console.log('fishCount: ', fishCount)
    console.log('----------')
    return;
  }

  if(!isInitialPenguPosition){

  }

  const moves = getNextMoves(penguPosition);
  const randomMove = getRandomValidMove(moves, grid);
  log('P',penguPosition, 'NextMove',randomMove,'counter',counter)

  if(grid[penguPosition[0]][penguPosition[1]] == '*'){
    log('Fish got caught!', penguPosition); 
    grid[penguPosition[0]][penguPosition[1]] = ' ';
    fishCount++;

    const nextMove = continueInTheSameDirection(randomMove[0], randomMove[1])
    log('Fish got caught!', penguPosition,'nextMove', nextMove, randomMove); 
    if(grid[nextMove[0]][nextMove[1]] == '#'){
      penguSlider(grid, continueInTheSameDirection(randomMove[0], randomMove[1]))
    }else{

    }
  }

  if(grid[penguPosition[0]][penguPosition[1]] == '0'){
    pathArray.push(randomMove[0])
    counter++;
    penguPosition = randomMove[1];
    //grid[penguPosition[0]][penguPosition[1]] = 'P';      
    penguSlider(grid, penguPosition, counter)
  }

  if(grid[penguPosition[0]][penguPosition[1]] == '#'){
    
    pathArray.push(randomMove[0])
    penguPosition = randomMove[1];
    //grid[penguPosition[0]][penguPosition[1]] = 'P';
    counter++;
    penguSlider(grid, penguPosition, counter)
  }

  penguSlider(grid, randomMove[1], counter)
  // while(counter < 6){

  // }
}

// Perform this when Pengu gets stuck by hitting a Wall or by the Snow cell
function getNextMoves(penguPosition){
  let moves = [];
  const x = penguPosition[0];
  const y = penguPosition[1];
  directions.forEach(item => moves.push([item[0],[x+item[1][0], y+item[1][1]]]))
  //console.log(moves)
  return moves;
}

function getRandomValidMove(moves, grid){
  const randMoves = [];
  moves.forEach((item, index) => {
    if(item != undefined){
      if(grid[item[1][0]][item[1][1]] != '#'){
        randMoves.push([item[0], item[1]])
      }
    }
  })
  const randomIndex = Math.floor(Math.random() * randMoves.length);
  return [randMoves[randomIndex][0], randMoves[randomIndex][1]]
}

function continueInTheSameDirection(path, currentPos, multiplier){
  const coordinateForTheDirection = directions.find(dir => dir[0] == path)[1];
  const [nextX, nextY] = coordinateForTheDirection;
  // const pathInTheDirection = [];
  // let i = 0;
  // while(i < multiplier){
  //   i = i + 1;
  //   pathInTheDirection.push([multiplier*coordinateForTheDirection[0]+currentPos[0], multiplier*coordinateForTheDirection[1]+currentPos[1]])
  // }
  // return pathInTheDirection;
  const nextMove = [currentPos[0]+nextX, currentPos[1]+nextY]
  // if(a[nextMove[0]][nextMove[1]] == '#'){
  //   return;
  // }
  console.log(nextMove)
  //return nextMove;
}


readAndLoadPositions();