const fs = require('fs')

let a;
let isInitialPenguPosition = true;
let penguInitialPosition ;
let pathArray = [];
let counter = 0;
let fishCount = 0;
let initailFishcount = 0;
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

const [inputFile, outputFile] = process.argv.slice(2);

log(inputFile, outputFile)

function readAndLoadPositions(){
  fs.readFile(inputFile, 'utf8' , (err, data) => {
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
        if(a[i][j] == '*'){
          initailFishcount++
        }
      }
    }
    console.log(initailFishcount)
    a[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    let output = penguSlider(a, penguInitialPosition, counter)
    //console.log(output)
    writeOutputToFile(output)
  })  

}

function penguSlider(grid, penguPosition, counter){
  
  if(grid[penguPosition[0]][penguPosition[1]] == 'U' || grid[penguPosition[0]][penguPosition[1]] == 'S'){
    console.log('----------')
    console.log('Caught by Bear/ Shark!')
    grid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    grid[penguPosition[0]][penguPosition[1]] = 'X';
    // log(grid, pathArray, fishCount)
    console.log('----------')
    return [pathArray, fishCount, grid];
  }
  console.log(penguPosition);
  if((isInitialPenguPosition || grid[penguPosition[0]][penguPosition[1]] == '0') && counter < 6){
    moves = getNextMoves(penguPosition);
    isInitialPenguPosition = false;
    const [direction, randomMove] = getRandomValidMove(moves, grid);
    pathArray.push(direction)
    counter++;
    return penguSlider(grid, randomMove, counter);
  }
  // after eating fish the cell will be the ice cell so it does not need return statement
  if(grid[penguPosition[0]][penguPosition[1]] == '*'){
    log('Fish got caught!', penguPosition); 
    fishCount++;
    grid[penguPosition[0]][penguPosition[1]] = ' ';
    if(fishCount === initailFishcount){
      return [pathArray, fishCount, grid];
    }
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
      return penguSlider(grid, randomMove1, counter);
    }else if(grid[nextMove[0]][nextMove[1]] != '#'){
      console.log('asdfasdf')
      return penguSlider(grid, nextMove, counter)
    }
  }
  if(counter == 6){
    console.log('----------')
    console.log('Counter 6')
    grid[penguPosition[0]][penguPosition[1]] = 'P';
    //log(grid, 'pathArray: ', pathArray, 'fishCount: ',fishCount)
    console.log('----------')
    return [pathArray, fishCount, grid];
  }
}


function writeOutputToFile(output){
  const [pathArray, fishCount, grid] = output;
  const content = `${pathArray.join('')}\n${fishCount}\n${grid.map(i => i.join('')).join('\n')}`;

  fs.writeFile(outputFile, content, err => {
    if (err) {
      console.error(err)
      return
    }
    //file written successfully
    log(`Printed the output to ${outputFile}`)
  })
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