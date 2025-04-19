function mouseClicked() {
  let col = floor(mouseX / w);
  let row = floor(mouseY / w);

  if (pageState == 0 && dropSandComplete == 1) {
    savedGridFromBasic = grid;

    if (withinCols(col) && withinRows(row)) {
      let cell = grid[col][row];

      if (cell > 0) {
        let colorIndex = Math.floor(cell); // 소수점 제거해서 topic index 추출
        if (DEBUG) console.log("mouseclicked on", colorIndex);
        chooseTopic(colorIndex); // ✅ 원하는 trigger 실행
      }
    }
  } else if (pageState == 2) {
    savedGridFromTopic = grid;

    if (withinCols(col) && withinRows(row)) {
      let cell = wordGrid[col][row];

      if (cell > 0) {
        let colorIndex = Math.floor(cell); // 소수점 제거해서 topic index 추출
        if (DEBUG) console.log("mouseclicked on", colorIndex);
        chooseWord(colorIndex); // ✅ 원하는 trigger 실행
        updateChosenTopicVisibility()
      }
    }
  }
}

let pageState = 0;
let spreadingColor = 4;
let chosenTopic = topicColorIndex[2];

function chooseTopic(colorIndex_) {
  pageState = 1;
  spreadingColor = colorIndex_;

  if (spreadingColor === 1) {
    chosenTopic = topicColorIndex[topicColorIndex.length - 1];
  } else {
    chosenTopic = topicColorIndex[spreadingColor - 2];
  }
  if (chosenTopic) {
    if (DEBUG) console.log(`🟨 Trigger topic: ${chosenTopic}`, spreadingColor);
  }
  checkPageStateAndMoveLabel();
}

function findSpreadOrigins(color) {
  let positions = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === color) {
        positions.push({ col: i, row: j });
      }
    }
  }
  return positions;
}

function spreadColor() {
  let newGrid = make2DArray(cols, rows);

  // 먼저 기존 그리드 복사
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      newGrid[i][j] = grid[i][j];
    }
  }
  let sources = findSpreadOrigins(spreadingColor);

  for (let pos of sources) {
    let i = pos.col;
    let j = pos.row;

    // 위로 퍼짐
    if (j > 0 && random(1) < 0.97) {
      newGrid[i][j - 1] = spreadingColor;
    }

    // 아래로 퍼짐
    if (j < rows - 1 && random(1) < 0.97) {
      newGrid[i][j + 1] = spreadingColor;
    }

    // 왼쪽으로 퍼짐
    if (i > 0 && random(1) < 0.97) {
      newGrid[i - 1][j] = spreadingColor;
    }

    // 오른쪽으로 퍼짐
    if (i < cols - 1 && random(1) < 0.97) {
      newGrid[i + 1][j] = spreadingColor;
    }
  }

  grid = newGrid;
}

function drawNewGrid() {
  //if (DEBUG) console.log("drawNewGrid");

  noStroke();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === spreadingColor) {
        fill(sandColors[spreadingColor]);
        rect(i * w, j * w, w, w);
      }
    }
  }
}

function checkPageStateAndMoveLabel() {
  const labels = document.querySelectorAll(".label"); // ✅ 클래스니까 .label

  labels.forEach((label) => {
    if (pageState === 1 || pageState === 11) {
      label.classList.add("move");
    } else {
      label.classList.remove("move");
    }
  });

  const lines = document.querySelectorAll(".line"); // ✅ 클래스니까 .line

  lines.forEach((line) => {
    if (pageState === 1 || pageState === 11) {
      line.classList.add("move");
    } else {
      line.classList.remove("move");
    }
  });
}

function checkIfGridFullyFilledWithColor(targetColor) {
  for (let i = 0; i < cols; i++) {
    for (let j = 100; j < rows; j++) {
      if (grid[i][j] !== targetColor) {
        return false;
      }
    }
  }
  return true;
}

//-----------------------------------------------------------------------------------------------------------

let wordGrid;
let wordColorIndex = [];
let wordTotals = {};
let wordTopY = {};

function processWordsFromTopic(table, chosenTopic, maxWords = 7) {
  wordColorIndex = [];
  wordTotals = {};
  wordTopY = {};

  // 1. wordTotals & wordTopY 계산
  for (let i = 0; i < table.getRowCount(); i++) {
    let topic = table.getString(i, "Topic");
    if (topic !== chosenTopic) continue;

    let word = table.getString(i, "Word");
    let freq = table.getNum(i, "TotalFrequency");

    if (!wordTotals[word]) {
      wordTotals[word] = 0;
    }
    wordTotals[word] += freq;

    if (!(word in wordTopY)) {
      wordTopY[word] = 2000;
    }
  }

  // 2. wordColorIndex: 상위 maxWords 단어만 추출
  wordColorIndex = Object.entries(wordTotals)
    .sort((a, b) => b[1] - a[1]) // 빈도수 내림차순
    .slice(0, maxWords) // 상위 maxWords개
    .map((entry) => entry[0]); // 단어 이름만 뽑기

  // 3. 로그 출력 (선택)
  if (DEBUG) console.log("선택된 topic:", chosenTopic);
  if (DEBUG) console.log("단어 총합 개수:", Object.keys(wordTotals).length);
  for (let word of wordColorIndex) {
    if (DEBUG) console.log(`${word}: ${wordTotals[word]}`);
  }
}

let wordSandColors = [
  "#000000",
  "#FDFBEE",
  "#FDFBEE",
  "#4C4949",
  "#4C4949",
  "#FDFBEE",
  "#FDFBEE",
  "#4C4949",
];
let currentWordColorIndex = 1;

function colorWordSand() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();

      if (wordGrid[i][j] > 0) {
        fill(wordSandColors[floor(wordGrid[i][j])]);
        let x = i * w;
        let y = j * w;

        if (wordGrid[i][j] == 2) {
          rect(x, y, w, w / 2);
        } else if (wordGrid[i][j] == 3) {
          square(x, y, w);
        } else if (wordGrid[i][j] == 4) {
          square(x + w / 2, y, w / 2);
          square(x, y + w / 2, w / 2);
        } else if (wordGrid[i][j] == 5) {
          let steps = 4;

          for (let k = 0; k < steps; k++) {
            let offset = k * (w / steps);
            rect(x + offset, y + offset, w / steps, w / steps);
          }
        } else if (wordGrid[i][j] == 6) {
          let quadrant;
          if (wordGrid[i][j] === 6) {
            quadrant = 1;
          } else if (wordGrid[i][j] === 6.01) {
            quadrant = 2;
          } else if (wordGrid[i][j] === 6.1) {
            quadrant = 3;
          } else if (wordGrid[i][j] === 6.11) {
            quadrant = 4;
          }

          let offsetX = 0;
          let offsetY = 0;

          if (quadrant === 2 || quadrant === 4) offsetX = w / 2;
          if (quadrant === 3 || quadrant === 4) offsetY = w / 2;

          square(x + offsetX, y + offsetY, w / 2);
        } else if (floor(wordGrid[i][j]) == 7) {
          square(x, y, w);
        } else if (wordGrid[i][j] == 1) {
          rect(x, y, w / 2, w);
        }
      }
    }
  }
}

function dropWordSand(wordColorIndex) {
  let ranCol = floor(random(120, width - 120) / w);
  let ranRow = 0;

  currentWordColorIndex =
    (currentWordColorIndex % (wordSandColors.length - 1)) + 1;
  // Randomly add an area of sand particles

  let sandNum = floor(
    (wordTotals[wordColorIndex] / topicTotals[chosenTopic]) * 500
  );
  if (DEBUG) console.log(
    "Event occured",
    "컬러인덱스:",
    currentWordColorIndex,
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
        wordGrid[col][row] = currentWordColorIndex;
        velocityGrid[col][row] = 1;

        if (currentWordColorIndex == 3) {
          if (random(1) < 0.7) {
            wordGrid[col][row] = currentWordColorIndex;
          } else {
            wordGrid[col][row] = currentWordColorIndex + 0.5;
          }
        } else if (currentWordColorIndex == 6) {
          let addA = random(1) < 0.5 ? 0 : 0.1;
          let addB = random(1) < 0.5 ? 0 : 0.01;
          wordGrid[col][row] = currentWordColorIndex + addA + addB;
        }
      }
    }
  }
}

function dropWordSandbyTime() {
  let count = 0;

  let intervalId = setInterval(function () {
    dropWordSand(wordColorIndex[count]);
    count++;

    if (count === 7) {
      clearInterval(intervalId);
    }
  }, 1000);

  setTimeout(() => {
    stopSand();
    if (DEBUG) console.log("stopSand");
  }, 3000);
}

function updateTopYByWord() {
  for (let t = 0; t < wordColorIndex.length; t++) {
    let word = wordColorIndex[t];

    // colorIndex는 2~7, 그 다음 1
    let colorIndex = t + 2 <= 7 ? t + 2 : 1;

    let topY = 2000;

    for (let j = rows - 1; j >= 0; j--) {
      if (Math.floor(wordGrid[0][j]) === colorIndex) {
        topY = j;
      }
    }

    wordTopY[word] = topY * w; // px 단위로 변환
  }
}

function updateHTMLLabelsByWord() {
  for (let word in wordTopY) {
    const y = wordTopY[word];

    const label = document.getElementById(`label-${word}`);
    if (label) {
      label.style.top = `${y - 1305}px`;
    }

    const count = document.getElementById(`count-${word}`);
    if (count && wordTotals[word] !== undefined) {
      count.textContent = wordTotals[word];
    }

    const line = document.getElementById(`line-${word}`);
    if (line) {
      line.style.top = `${y - 1295}px`; // 텍스트 중앙 기준
    }
  }
}

function createWordLabels(wordColorIndex) {
  const container = document.getElementById("words-container");
  container.innerHTML = ""; // 기존 내용 초기화

  for (let word of wordColorIndex) {
    const labelDiv = document.createElement("div");
    labelDiv.id = `label-${word}`;
    labelDiv.className = "label";
    labelDiv.innerHTML = `
      <span class="topic">${word}</span>
      <span class="count" id="count-${word}">0</span>
    `;

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    lineDiv.id = `line-${word}`;

    container.appendChild(labelDiv);
    container.appendChild(lineDiv);
  }
}
