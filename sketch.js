function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    // Fill the array with 0s
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

let grid;
let velocityGrid;

// How big is each square?
let w = 6;
let cols, rows;

let backgroundColor = "#FDFBEE";

let sandColors = [];
let sandColors_persona1 = [
  "#000000",
  "#FE4F2D",
  "#4C4949",
  "#FEA692",
  "#FE4F2D",
  "#FEA692",
  "#57B4BA",
  "#4C4949",
];

let sandColors_persona2 = [
  "#000000",
  "#00B894",
  "#4C4949",
  "#FDCB6E",
  "#00B894",
  "#FDCB6E",
  "#0984E3",
  "#4C4949",
];

let sandColors_persona3 = [
  "#000000",
  "#57B4BA",
  "#4C4949",
  "#FF6B81",
  "#57B4BA",
  "#FF6B81",
  "#FFE66D",
  "#4C4949",
];
let sandColors_persona4 = [
  "#000000",
  "#CAD2C5",
  "#4C4949",
  "#F4A261",
  "#CAD2C5",
  "#F4A261",
  "#6C5CE7",
  "#4C4949",
];

const sandColorPalettes = {
  1: sandColors_persona1,
  2: sandColors_persona2,
  3: sandColors_persona3,
  4: sandColors_persona4,
};

let currentColorIndex = 1;

let gravity = 0.2;

let table;
let topicTotals = {};
let topicColorIndex = [];
let topicTopY = {};
let csvPath;

function preload() {
  csvPath = localStorage.getItem("personaCSV") || "assets/csv/1.csv";
  table = loadTable(csvPath, "csv", "header");
  let sandindex = parseInt(localStorage.getItem("index") || "1", 10);
  sandColors = sandColorPalettes[sandindex];
  parseCSVwithPapa();
}

function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function setup() {
  let cnv = createCanvas(313, 853 + 1300);
  cnv.parent("canvas-container");
  colorMode(HSB, 360, 255, 255);
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  velocityGrid = make2DArray(cols, rows);
  wordGrid = make2DArray(cols, rows);

  processTopicsFromTable(table);
  createTopicLabels(topicColorIndex);
}

function processTopicsFromTable(table, maxTopics = 7) {
  let uniqueSet = new Set();
  topicTotals = {};
  topicTopY = {};

  // 1. 전체 topicTotals, topicTopY 계산
  for (let i = 0; i < table.getRowCount(); i++) {
    let topic = table.getString(i, "Topic");
    let total = table.getNum(i, "TotalFrequency");

    if (!topicTotals[topic]) {
      topicTotals[topic] = 0;
    }
    topicTotals[topic] += total;

    if (!(topic in topicTopY)) {
      topicTopY[topic] = 2000;
    }

    uniqueSet.add(topic); // 여기는 중복 제거만
  }

  // 2. topicColorIndex는 totals 기준 상위 topic으로 추출
  topicColorIndex = Object.entries(topicTotals)
    .sort((a, b) => b[1] - a[1]) // 총합 내림차순 정렬
    .slice(0, maxTopics) // 상위 N개 추출
    .map((entry) => entry[0]); // topic 이름만 배열로 변환

  // 3. 디버깅 출력
  if (DEBUG) console.log("총 토픽 개수:", Object.keys(topicTotals).length);
  if (DEBUG) console.log("총 row 수:", table.getRowCount());
  for (let topic of topicColorIndex) {
    if (DEBUG) console.log(`${topic}: ${topicTotals[topic]}`);
  }
}

let saveCanvasCount = 1;

function keyPressed() {
  if (key === "s") {
    let fileName = "sand_simulation_" + nf(saveCanvasCount, 3) + ".png"; // 번호를 3자리로 맞춤
    saveCanvas(fileName); // 파일 저장
    saveCanvasCount++; // 번호 증가
  }

  // 키 입력 시 CSV 경로와 색상 배열 자체를 저장
  if (["1", "2", "3", "4"].includes(key)) {
    let index = key;
    localStorage.setItem("personaCSV", `assets/csv/${index}.csv`);
    localStorage.setItem("index", `${index}`);
    location.reload();
  }
}

function dropSand(topicColorIndex) {
  let ranCol = floor(random(120, width - 120) / w);
  let ranRow = 0;

  currentColorIndex = (currentColorIndex % (sandColors.length - 1)) + 1;
  // Randomly add an area of sand particles

  let sandNum = floor(topicTotals[topicColorIndex] / 3);
  if (DEBUG)
    console.log(
      "Event occured",
      "컬러인덱스:",
      currentColorIndex,
      "모래개수:",
      sandNum
    );
  let widthExtent = 24; // 가로 범위
  let heightExtent = sandNum;

  for (let i = -widthExtent; i <= widthExtent; i++) {
    for (let j = -heightExtent; j <= heightExtent; j++) {
      let col = ranCol + i;
      let row = ranRow + j;
      if (withinCols(col) && withinRows(row)) {
        grid[col][row] = currentColorIndex;
        velocityGrid[col][row] = 1;

        if (currentColorIndex == 7) {
          let addA = random(1) < 0.5 ? 0 : 0.1; // 50% 확률로 0 또는 0.1
          let addB = random(1) < 0.5 ? 0 : 0.01; // 50% 확률로 0 또는 0.01
          grid[col][row] = currentColorIndex + addA + addB;
        }
      }
    }
  }
}

let dropSandComplete = 0;

function dropSandbyTime() {
  let count = 0;

  let intervalId = setInterval(function () {
    dropSand(topicColorIndex[count]);
    count++;

    if (count === 7) {
      clearInterval(intervalId);
    }
  }, 2000);

  setTimeout(() => {
    dropSandComplete = 1;
    stopSand();
    if (DEBUG) console.log("stopSand");
  }, 14000);
}

function stopSand() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      velocityGrid[i][j] = 0;
    }
  }
}

let savedGridFromBasic = null;
let savedGridFromTopic = null;

function draw() {
  if (pageState == 0) {
    background(backgroundColor);

    colorTopicSand();

    let nextGrid = make2DArray(cols, rows);
    let nextVelocityGrid = make2DArray(cols, rows);

    addGravitySand(nextGrid, nextVelocityGrid, grid);

    grid = nextGrid;
    velocityGrid = nextVelocityGrid;

    updateTopYByTopic();
    updateHTMLLabels();

    if (pageState === 1) {
      savedGridFromBasic = grid;
    }
  } else if (pageState == 1) {
    spreadColor();
    drawNewGrid();

    if (pageState === 1 && checkIfGridFullyFilledWithColor(spreadingColor)) {
      if (DEBUG) console.log("🌊 전환 완료 → pageState = 2");
      stopSand();

      processWordsFromTopic(table, chosenTopic);
      createWordLabels(wordColorIndex);
      pageState = 2;
      dropWordSandbyTime();
      updateButtonVisibility();
      updateChosenTopicVisibility();
    }
  } else if (pageState == 2) {
    background(sandColors[spreadingColor]);

    colorWordSand();

    let nextGrid = make2DArray(cols, rows);
    let nextVelocityGrid = make2DArray(cols, rows);

    addGravitySand(nextGrid, nextVelocityGrid, wordGrid);

    wordGrid = nextGrid;
    velocityGrid = nextVelocityGrid;

    updateTopYByWord();
    updateHTMLLabelsByWord();
  } else if (pageState == 3) {
  } /*else if (pageState == 10) {
    background("#FDFBEE");

    colorTopicSand();

    let nextGrid = make2DArray(cols, rows);
    let nextVelocityGrid = make2DArray(cols, rows);

    addGravitySand(nextGrid, nextVelocityGrid, grid);

    grid = savedGridFromBasic;
    velocityGrid = nextVelocityGrid;

    updateTopYByTopic();
    updateHTMLLabels();
    
  } else if (pageState == 11) {
    background(sandColors[spreadingColor]);

    colorWordSand();

    let nextGrid = make2DArray(cols, rows);
    let nextVelocityGrid = make2DArray(cols, rows);

    addGravitySand(nextGrid, nextVelocityGrid, wordGrid);

    wordGrid = savedGridFromTopic;
    velocityGrid = nextVelocityGrid;

    updateTopYByWord();
    updateHTMLLabelsByWord();
  }*/
}

function colorTopicSand() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {
        fill(sandColors[floor(grid[i][j])]);
        let x = i * w;
        let y = j * w;
        if (grid[i][j] == 2) {
          fill(sandColors[3]);
          square(x, y, w);
          fill(sandColors[floor(grid[i][j])]);
          square(x, y, w / 2);
          square(x + w / 2, y + w / 2, w / 2);
        } else if (grid[i][j] == 3 || grid[i][j] == 4 || grid[i][j] == 6) {
          square(x, y, w);
        } else if (grid[i][j] == 5) {
          rect(x, y, w, w / 2);
        } else if (floor(grid[i][j]) == 7) {
          let quadrant;
          if (grid[i][j] === 7) {
            quadrant = 1;
          } else if (grid[i][j] === 7.01) {
            quadrant = 2;
          } else if (grid[i][j] === 7.1) {
            quadrant = 3;
          } else if (grid[i][j] === 7.11) {
            quadrant = 4;
          }

          let offsetX = 0;
          let offsetY = 0;

          if (quadrant === 2 || quadrant === 4) offsetX = w / 2;
          if (quadrant === 3 || quadrant === 4) offsetY = w / 2;

          square(x + offsetX, y + offsetY, w / 2);
        } else if (grid[i][j] == 1) {
          rect(x, y, w / 2, w);
        }
      }
    }
  }
}

function addGravitySand(nextGrid_, nextVelocityGrid_, grid_) {
  let nextGrid = nextGrid_;
  let nextVelocityGrid = nextVelocityGrid_;
  let grid = grid_;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let velocity = velocityGrid[i][j];
      let moved = false;
      if (state > 0) {
        let newPos = int(j + velocity);
        for (let y = newPos; y > j; y--) {
          let below = grid[i][y];
          let dir = 1;
          if (random(1) < 0.5) {
            dir *= -1;
          }
          let belowA = -1;
          let belowB = -1;
          if (withinCols(i + dir)) belowA = grid[i + dir][y];
          if (withinCols(i - dir)) belowB = grid[i - dir][y];

          if (below === 0) {
            nextGrid[i][y] = state;
            nextVelocityGrid[i][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowA === 0) {
            nextGrid[i + dir][y] = state;
            nextVelocityGrid[i + dir][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowB === 0) {
            nextGrid[i - dir][y] = state;
            nextVelocityGrid[i - dir][y] = velocity + gravity;
            moved = true;
            break;
          }
        }

        if (state > 0 && !moved) {
          nextGrid[i][j] = grid[i][j];
          nextVelocityGrid[i][j] = velocityGrid[i][j] + gravity;
        }
      }
    }
  }
}

function updateTopYByTopic() {
  for (let t = 0; t < topicColorIndex.length; t++) {
    let topic = topicColorIndex[t];

    // colorIndex는 2~7, 그 다음 1
    let colorIndex = t + 2 <= 7 ? t + 2 : 1;

    let topY = 2000;

    for (let j = rows - 1; j >= 0; j--) {
      if (Math.floor(grid[0][j]) === colorIndex) {
        topY = j;
      }
    }

    topicTopY[topic] = topY * w; // px 단위로 변환
  }
}

function updateHTMLLabels() {
  for (let topic in topicTopY) {
    const y = topicTopY[topic];

    const label = document.getElementById(`label-${topic}`);
    if (label) {
      label.style.top = `${y - 1305}px`;
    }

    const count = document.getElementById(`count-${topic}`);
    if (count && topicTotals[topic] !== undefined) {
      count.textContent = topicTotals[topic];
    }

    const line = document.getElementById(`line-${topic}`);
    if (line) {
      line.style.top = `${y - 1295}px`; // 텍스트 중앙에 맞춤
    }
  }
}

function updateButtonVisibility() {
  const btn = document.getElementById("specialBtn");

  if (pageState === 2 || pageState === 3) {
    btn.style.display = "block";
    btn.disabled = false;
  } else {
    btn.style.display = "none"; // 화면에서 숨김
    btn.disabled = true; // 혹시 보여지더라도 작동안하게
  }
}

/*
document.getElementById("specialBtn").addEventListener("click", () => {
  if (pageState === 2) {
    if (DEBUG) console.log("버튼이 작동함!");
    pageState = 10;
  } else if (pageState === 3) {
    pageState = 11;

  }
});
*/
