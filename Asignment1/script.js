// importing fs module for file operations
const fs = require('fs')

let /** Array<string> */ initialGrid; // Declaring the Grid
let /** boolean */ isInitialPenguPosition = true; // this helps us to trigger the penguSlider 
let /** Array<number> */ penguInitialPosition ; 
let /** Array<number> */ pathArray = []; // This array consists of the path travelled by the Pengu
let /** number */ counter = 0; // counter to check the count of the path
let /** number */ fishCount = 0; // counter to count the fishes caught by the Pengu
let /** number */ totalFishcount = 0;

// Below directions are helpful for finding the co-ordinates wrt the direction of the Pengu
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

// Reading the arguments(input and output file names) from the bash file and initializing to the variables
const [inputFile, outputFile] = process.argv.slice(2);

/** 
 * function reads the input file and note the pengu position and grid to 2d array
*/
function readAndLoadPositions(){
  // Reading the input file which is captured in inputFile variable
  fs.readFile(inputFile, 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    // initializing the grid data into initialGrid
    initialGrid = data.split('\n').map(i => i.trim().split('')).slice(1)
    for(let i = 0; i< initialGrid.length;i++){
      for(let j = 0; j< initialGrid[0].length;j++){
        // finding Pengus position
        if(initialGrid[i][j] == 'P'){
          // initializing penguInitialPosition
          penguInitialPosition = [i,j];
        }
        // finding total no of Fishes
        if(initialGrid[i][j] == '*'){
          totalFishcount++;
        }
      }
    }
    // Clearing the initial pengu position
    initialGrid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    // 
    let output = penguSlider(initialGrid, penguInitialPosition, counter)
    writeOutputToFile(output) // Writing output to the file
  })  
}

/**
 * Triggers the pengu movement in the grid
 * @param {Array<string>} grid 
 * @param {Array<number>} penguPosition 
 * @param {number} counter 
 * @returns {Array<string|number>} grid, fishcount and the path of the pengu when Pengu caught by a Hazard or exceeds 6 moves
 */
function penguSlider(grid, penguPosition, counter){
  // If Pengu caught by a Hazard
  if(grid[penguPosition[0]][penguPosition[1]] == 'U' || grid[penguPosition[0]][penguPosition[1]] == 'S'){
    console.log('----------')
    console.log('Caught by Bear/ Shark!')
    grid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
    // updating pengu caught position
    grid[penguPosition[0]][penguPosition[1]] = 'X';
    console.log('----------')
    return [pathArray, fishCount, grid];
  }
  // Below block checks for 2 conditions
  // 1. When isInitialPenguPosition is used to trigger the recursion only once and sets to false
  // 2. When penguPosition in the grid is an Snow Cell
  if((isInitialPenguPosition || grid[penguPosition[0]][penguPosition[1]] == '0') && counter < 6){
    moves = getNextMoves(penguPosition);
    // Making isInitialPenguPosition to false so it won' run more than once
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
    // if penguin eats all the fishes, then terminate
    if(fishCount === totalFishcount){
      return [pathArray, fishCount, grid];
    }
  }
  // penguin checks for the ice cell
  if(grid[penguPosition[0]][penguPosition[1]] == ' '){
    //const nextMove = continueInTheSameDirection(direction, randomMove) 
    const direction = pathArray[pathArray.length-1]; // recent direction of the pengu
    const nextMove = continueInTheSameDirection(direction, penguPosition)
    if(grid[nextMove[0]][nextMove[1]] == '#' && counter < 6){
      moves = getNextMoves(penguPosition);
      const [direction1, randomMove1] = getRandomValidMove(moves, grid);  
      pathArray.push(direction1)
      counter++;
      return penguSlider(grid, randomMove1, counter);
    }else if(grid[nextMove[0]][nextMove[1]] != '#'){
      return penguSlider(grid, nextMove, counter)
    }
  }
  // if the counter is 6, then return
  if(counter == 6){
    console.log('----------')
    console.log('Counter 6')
    grid[penguPosition[0]][penguPosition[1]] = 'P';
    console.log('----------')
    return [pathArray, fishCount, grid];
  }
}

/**
 * This function writes the output to a file
 * @param {!Array<string>} output 
 */
function writeOutputToFile(output){
  const [pathArray, fishCount, grid] = output;
  const content = `${pathArray.join('')}\n${fishCount}\n${grid.map(i => i.join('')).join('\n')}`;

  fs.writeFile(outputFile, content, err => {
    if (err) {
      console.error(err)
      return
    }
    log(`Successfully wrote the output to ${outputFile}`)
  })
}

/**
 * this function generates next move based on Pengus Position
 * @param {!Array<number>} penguPosition 
 * @returns {!Array<number>} All possible moves for the Pnegu
 */
function getNextMoves(penguPosition){
  let moves = [];
  const x = penguPosition[0];
  const y = penguPosition[1];
  directions.forEach(item => moves.push([item[0],[x+item[1][0], y+item[1][1]]]))
  return moves;
}

/**
 * to pick a Random Valid move from the grid
 * @param {!Array<number>} moves 
 * @param {!Array<string>} grid 
 * @returns {!Array<number>} direction and next move for the Pengu
 */
function getRandomValidMove(moves, grid){
  const randMoves = [];
  moves.forEach((item) => {
    if(item != undefined){
      if(grid[item[1][0]][item[1][1]] != '#'){
        randMoves.push([item[0], item[1]])
      }
    }
  })
  const randomIndex = Math.floor(Math.random() * randMoves.length);
  const [direction, nextRandomMove] = randMoves[randomIndex]
  //return [randMoves[randomIndex][0], randMoves[randomIndex][1]]
  return [direction, nextRandomMove];
}

/**
 * Anticipating the pengus next move based on the direction and current postion of the Pengu
 * @param {number} direction 
 * @param {!Array<number>} currentPos 
 * @returns {!Array<number>}
 */
function continueInTheSameDirection(direction, currentPos){
  const coordinateForTheDirection = directions.find(dir => dir[0] == direction)[1];
  const [nextX, nextY] = coordinateForTheDirection;
  const nextMove = [currentPos[0]+nextX, currentPos[1]+nextY]
  return nextMove;
}

// Triggering the script
readAndLoadPositions();