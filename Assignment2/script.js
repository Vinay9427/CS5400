const fs = require('fs')

let /** Array<string> */ initialGrid; // Declaring the Grid
let /** Array<number> */ penguInitialPosition ; 
let /** Array<number> */ pathArray = []; // This array consists of the path travelled by the Pengu
let /** boolean */ isInitialPenguPosition = true; // this helps us to trigger the penguSlider 
let /** number */ counter = 0; // counter to check the count of the path
let /** number */ totalFishcount = 0; // counter to count the fishes caught by the Pengu

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

let initialState = {
    penguPosition : null,
    fishCount : 0,
    fishPositionsCaught: [],
    path: '',
    penguStatus: null
}

const status = ["KILLED", "STUCK_BY_WALL", "STUCK_AT_SNOW"];

// Reading the arguments(input and output file names) from the bash file and initializing to the variables
let [inputFile, outputFile] = process.argv.slice(2);


if(!(inputFile && outputFile)){
    inputFile = 'gradinginput.txt';
    outputFile = 'gradingoutput.txt';
}

function log(...params){
    return console.log(params)
  }

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
      //console.log(initialGrid)
      for(let i = 0; i< initialGrid.length;i++){
        for(let j = 0; j< initialGrid[0].length;j++){
          // finding Pengus position
          if(initialGrid[i][j] == 'P'){
            // initializing penguInitialPosition
            penguInitialPosition = [i,j];
            initialState.penguPosition = [i,j];
          }
          // finding total no of Fishes
          if(initialGrid[i][j] == '*'){
            totalFishcount++;
          }
        }
      }
        // Clearing the initial pengu position
        initialGrid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
        const output = BreadthFirstSearch(initialGrid);
        log('Output: ', JSON.stringify(output))
    })  
  }


/**
 * 
 * @param {*} penguPosition 
 * @param {*} grid 
 */

  const BreadthFirstSearch = function(grid){
      let queue = [initialState];
      let visitedPositions = [];
      const slidingPositions = [' ', '*'];
      while(queue.length > 0){
        const currentState = queue.shift();
        //const { direction, penguPosition, fishCount } = queue.shift();
        console.log('currentState: ',JSON.stringify(currentState))

        if(currentState.fishCount >= 8){
            return currentState;
        }

        //continueSlidingForValidMoves()
        
        if(slidingPositions.includes(grid[currentState.penguPosition[0]][currentState.penguPosition[1]]) && currentState.path.length > 0){
            log('Entered snowCell or Fish Cell: ', grid[currentState.penguPosition[0]][currentState.penguPosition[1]])
            const stuckatsomething = continueInTheSameDirection(currentState, grid)
            log('stuckatsomething: ', stuckatsomething)
        }

        const loadQueue = getNextValidMoves(currentState, grid);
        loadQueue.forEach(item => {
            if(!visitedPositions.includes(item.penguPosition.join(''))){
                queue.push(item)
            }
        })
        visitedPositions.push(currentState.penguPosition.join(''))
        log('Queue: ',JSON.stringify(queue))
      }
      return currentState;
  }


 /**
   * to pick a next Valid move from the grid
   * @param {!Array<number>} penguPos 
   * @param {!Array<string>} grid 
   * @returns {!Array<number>} direction and next moves for the Pengu
   */
  function getNextValidMoves(currentState, grid){
    const { penguPosition, fishCount, path, fishPositionsCaught, penguStatus } = currentState;
    let moves = [];
    directions.forEach(item => {
        const nextPos = [penguPosition[0]+item[1][0], penguPosition[1]+item[1][1]];
        if(grid[nextPos[0]][nextPos[1]] != '#'){
            moves.push(
                            { 
                                penguPosition: nextPos, 
                                fishPositionsCaught: fishPositionsCaught, 
                                status: penguStatus, 
                                fishCount: fishCount, 
                                path: path+item[0]
                            }
                        )
        }
    })
    log('Next Moves for ', JSON.stringify(currentState), 'are ', JSON.stringify(moves))
    return moves;
  }


  const continueSlidingForValidMoves = function(currentState, grid){
    const moves = getNextValidMoves(currentState, grid); 
    let validMoves = [];
    for(let i = 0;i<moves.length; i++){
        validMoves.push(continueInTheSameDirection(moves[i], grid));
    }
    return validMoves;
  }
  

  /**
   * Anticipating the pengus next move based on the direction and current postion of the Pengu
   * @param {number} direction 
   * @param {!Array<number>} currentPos 
   * @returns {!Array<number>}
   */
   const continueInTheSameDirection = function(currentState, grid){
    let direction = currentState.path[currentState.path.length-1];
    let tempPath = currentState.path;
    let tempPosition = currentState.penguPosition;
    let tempFishCount = currentState.fishCount;
    let tempFishCaughtPositions = currentState.fishPositionsCaught;
    let status;
    
    const rollbackPositions = ['#', '0', 'S', 'U'];
    while(!rollbackPositions.includes(grid[tempPosition[0]][tempPosition[1]])){
        if(grid[tempPosition[0]][tempPosition[1]] == '*'){
            tempFishCount++;
            tempFishCaughtPositions.push(tempPosition)
            log('FishCount: ', tempFishCount)
        }
        log(' Grid Pos before next move ', grid[tempPosition[0]][tempPosition[1]])
        tempPosition = getNextMove(tempPosition, direction)
        log(' Grid Pos after next move ', grid[tempPosition[0]][tempPosition[1]])
    }
    status = penguStatus(tempPosition)
    log(`continueInTheSameDirection for stopped at , Position: ${tempPosition}- fishCount: ${tempFishCount}- Path:${tempPath}`)
    return { 
            penguPosition: tempPosition, 
            fishPositionsCaught: tempFishCaughtPositions, 
            penguStatus: status,
            fishCount: tempFishCount, 
            path: tempPath 
        }
  }


  /**
   * Anticipating the pengus next move based on the direction and current postion of the Pengu
   * @param {number} direction 
   * @param {!Array<number>} currentPos 
   * @returns {!Array<number>}
   */
   const getNextMove = function(currentPos, direction){
    const coordinateForTheDirection = directions.find(dir => dir[0] == direction)[1];
    return [currentPos[0]+coordinateForTheDirection[0], currentPos[1]+coordinateForTheDirection[1]];
  }

  const penguStatus = function(penguPosition){
    if(getCellValue(penguPosition) == 'S' || getCellValue(penguPosition) == 'U'){
        return 'KILLED';
    }

    if(getCellValue(penguPosition) == '0'){
        return 'STUCK_AT_SNOW';
    }

    if(getCellValue(penguPosition) == '#'){
        return 'STUCK_BY_WALL';
    }
  }

  const getCellValue = function(position){
      return grid[position[0]][position[1]];
  }

readAndLoadPositions();