let chosenWord = "stressed";

function chooseWord(colorIndex_) {
  let word;
  let colorIndex = colorIndex_;

  if (colorIndex === 1) {
    word = wordColorIndex[wordColorIndex.length - 1]; // 마지막 토픽
  } else {
    word = wordColorIndex[colorIndex - 2];
  }
  if (word) {
    if (DEBUG) console.log(`🟨 Trigger word: ${word}`);
    chosenWord = word;

    let target = parseInt(colorIndex); // 눌린 숫자 키를 정수로 변환
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.floor(wordGrid[i][j]) !== target) {
          // 해당 색상 아니면 삭제
          wordGrid[i][j] = 0;
          velocityGrid[i][j] = 0;
        } else {
          // 해당 색상은 다시 떨어지게 설정
          velocityGrid[i][j] = 1;
        }
      }
    }
    hideAllWordsExcept(word);

    setTimeout(() => {
      stopSand();
      pageState = 3;
      updateChosenWordVisibility();
      updateChosenTopicVisibility()
    }, 500);
  }
}

function hideAllWordsExcept(selectedWord) {
  for (let word of wordColorIndex) {
    const label = document.getElementById(`label-${word}`);
    const line = document.getElementById(`line-${word}`);

    const shouldHide = word !== selectedWord;

    if (label) label.style.display = shouldHide ? "none" : "block";
    if (line) line.style.display = shouldHide ? "none" : "block";
  }
}
