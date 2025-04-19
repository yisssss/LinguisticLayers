const DEBUG = false;

const hint = document.getElementById("dblClickHint");

function handleFirstDoubleClick() {
  hint.classList.add("hidden");
  window.removeEventListener("dblclick", handleFirstDoubleClick);
}

// 더블 클릭 시 한 번만 실행
window.addEventListener("dblclick", handleFirstDoubleClick);

document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById("custom-cursor");

  // 마우스 따라다니게
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // hover 가능한 요소들에 커서 효과 주기
  document
    .querySelectorAll(
      "input, button, textarea, .bar,.search-button, .back-button, .capture-button, .setting-button, .i-button, x-button, .custom_checkbox, .leftarrowBtn-date, .rightarrowBtn-date"
    )
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.backgroundColor = "var(--main-red)"; // hover 시 빨강
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.backgroundColor = "var(--main-black)"; // 벗어나면 원래대로
      });
    });
});

document.addEventListener(
  "dblclick",
  () => {
    if (DEBUG) console.log("나의 단어 퇴적층 시작하기");
    dropSandbyTime();
  },
  { once: true }
);

document.querySelector(".capture-button").addEventListener("click", () => {
  const target = document.querySelector(".mobile-frame");

  if (DEBUG) console.log("이미지 캡쳐됨");
  html2canvas(target).then((canvas) => {
    // 이미지 다운로드
    const link = document.createElement("a");
    link.download = "mobile-capture.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToastMessage("capture-toast", 2000);
  });
});

document.querySelector(".i-button").addEventListener("click", () => {
  showToastMessage("i-toast", 4000);
});

document.querySelector(".search-button").addEventListener("click", () => {
  showToastMessage("search-toast", 2000);
});

function showToastMessage(id, duration) {
  const toast = document.getElementById(id);
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration); // 2초 후 사라짐
}

// 시작 시간을 초 단위로 설정: 14일 22시간 9분 12초
let totalSeconds = 14 * 86400 + 22 * 3600 + 9 * 60 + 12;

function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days}D ${String(hours).padStart(2, "0")}H ${String(
    minutes
  ).padStart(2, "0")}M ${String(secs).padStart(2, "0")}S`;
}

function updateTimer() {
  const timer = document.querySelector(".top-timer");
  timer.textContent = formatTime(totalSeconds);
  totalSeconds++;
}
updateTimer();
setInterval(updateTimer, 1000);

function openModal() {
  document.getElementById("bottomModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("bottomModal").classList.add("hidden");
}

let startY = 0;
let isDragging = false;

document.addEventListener("mousedown", (e) => {
  isDragging = true;
  startY = e.clientY;
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging) return;
  isDragging = false;

  const deltaY = e.clientY - startY;

  if (deltaY > 80) {
    // ✅ 아래로 충분히 드래그했을 때!
    slideToSearch();
  }

  if (deltaY < -80) {
    // ✅ 아래로 충분히 드래그했을 때!
    slideToBasic();
  }
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startY;
});

function slideToSearch() {
  if (pageState == 0) {
    const basic = document.getElementById("basic-page");
    const search = document.getElementById("search-page");

    basic.style.transform = "translateY(852px)"; // 위로
    search.style.transform = "translateY(0)"; // 아래서 올라옴
    document.getElementById("canvas-container").style.transform =
      "translateY(852px)";
  }
}

function slideToBasic() {
  const basic = document.getElementById("basic-page");
  const search = document.getElementById("search-page");

  basic.style.transform = "translateY(0)";
  search.style.transform = "translateY(-852px)"; // 다시 아래로 숨김
  document.getElementById("canvas-container").style.transform = "translateY(0)";

  pageState = 0;
}

function createTopicLabels(topicColorIndex) {
  const container = document.getElementById("labels-container");
  container.innerHTML = ""; // 기존 내용 비움

  for (let topic of topicColorIndex) {
    const labelDiv = document.createElement("div");
    labelDiv.id = `label-${topic}`;
    labelDiv.className = "label";
    labelDiv.innerHTML = `
        <span class="topic">${topic}</span>
        <span class="count" id="count-${topic}">0</span>
      `;

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    lineDiv.id = `line-${topic}`;

    container.appendChild(labelDiv);
    container.appendChild(lineDiv);
  }
}

const typedBtn = document.getElementById("typedBtn");
const recordedBtn = document.getElementById("recordedBtn");

typedBtn.addEventListener("click", () => {
  const isTypedSelected = typedBtn.classList.contains("selected");
  const isRecordedSelected = recordedBtn.classList.contains("selected");

  // 둘 다 선택 해제 방지
  if (isTypedSelected && !isRecordedSelected) return;

  typedBtn.classList.toggle("selected");
});

recordedBtn.addEventListener("click", () => {
  const isTypedSelected = typedBtn.classList.contains("selected");
  const isRecordedSelected = recordedBtn.classList.contains("selected");

  // 둘 다 선택 해제 방지
  if (!isTypedSelected && isRecordedSelected) return;

  recordedBtn.classList.toggle("selected");
});

const barchart = document.getElementById("topic-barchart");
let startIndex = null;
let endIndex = null;

function resetSelection() {
  startIndex = null;
  endIndex = null;
  document
    .querySelectorAll(".bar")
    .forEach((bar) => bar.classList.remove("active"));
}

function applyRangeSelection(start, end) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  document.querySelectorAll(".bar").forEach((bar, index) => {
    bar.classList.toggle("active", index >= min && index <= max);
  });
}


const startBtn = document.getElementById("startDateBtn");
const endBtn = document.getElementById("endDateBtn");
const calendarWrapper = document.getElementById("calendarWrapper");

let activeSelection = null;

startBtn.addEventListener("click", () => {
  console.log("1");
  activeSelection = "start";
  calendarWrapper.classList.toggle("hidden");
  startBtn.classList.toggle("selected");
  endBtn.classList.remove("selected");
});

endBtn.addEventListener("click", () => {
  activeSelection = "start";
  calendarWrapper.classList.toggle("hidden");
  endBtn.classList.toggle("selected");
  startBtn.classList.remove("selected");
});

function generateCalendar(year, month) {
  const calendarDays = document.getElementById("calendarDays");
  calendarDays.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0); // 마지막 날짜
  const firstWeekday = (firstDay.getDay() + 6) % 7; // 월요일 시작 (0 = MO)

  const prevMonthLastDay = new Date(year, month, 0).getDate(); // 이전 달 말일

  const totalCells = Math.ceil((firstWeekday + lastDay.getDate()) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const span = document.createElement("span");

    if (i < firstWeekday) {
      // 이전 달 날짜
      span.textContent = prevMonthLastDay - firstWeekday + i + 1;
      span.className = "inactive";
    } else if (i < firstWeekday + lastDay.getDate()) {
      // 현재 달 날짜
      const day = i - firstWeekday + 1;
      span.textContent = day;
      span.className = "active";
    } else {
      // 다음 달 날짜
      span.textContent = i - (firstWeekday + lastDay.getDate()) + 1;
      span.className = "inactive";
    }

    calendarDays.appendChild(span);
  }
}

let selectedStart = 1;
let selectedEnd = 15;

generateCalendar(2025, 3); // 3 = April (month는 0부터 시작)
highlightDateRange(selectedStart, selectedEnd);

function highlightDateRange(start, end) {
  const spans = document.querySelectorAll("#calendarDays span");
  spans.forEach((span) => {
    const day = Number(span.textContent);
    span.classList.remove("selected-start", "selected-end", "in-range");

    if (span.classList.contains("active")) {
      if (day === start) {
        span.classList.add("selected-start");
      } else if (day === end) {
        span.classList.add("selected-end");
      } else if (day > start && day < end) {
        span.classList.add("in-range");
      }
    }
  });
}

function updateChosenTopicVisibility() {
  const chosenTopicBox = document.getElementById("chosenTopic-container");
  const chosenTitle = document.querySelector(".chosenTopic");

  if (pageState === 2) {
    chosenTopicBox.classList.remove("hidden2"); // 다음 프레임에 opacity 1
    chosenTitle.textContent = chosenTopic;
    updateTopicInfo(chosenTopic);
  } else {
    chosenTopicBox.classList.add("hidden2");
  }
}

function updateChosenWordVisibility() {
  const chosenWordBox = document.getElementById("chosenWord-container");
  const chosenTitle = document.querySelector(".chosenWord");

  if (pageState === 3) {
    chosenWordBox.classList.remove("hidden2"); // 다음 프레임에 opacity 1
    chosenTitle.textContent = chosenWord;
    updateWordInfo(chosenWord);
  } else {
    chosenWordBox.classList.add("hidden2");
  }
}

function updateTopicInfo(chosenTopic) {
  Papa.parse(csvPath, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;

      // 필터링: 해당 topic만
      const topicData = data.filter((row) => row.Topic === chosenTopic);

      if (topicData.length === 0) return;

      // 초기값
      let typedSum = 0;
      let spokenSum = 0;
      let totalSum = 0;
      let latestDate = "1900-01-01";

      topicData.forEach((row) => {
        const typed = Number(row.TypedFrequency) || 0;
        const spoken = Number(row.SpokenFrequency) || 0;
        const total = Number(row.TotalFrequency) || typed + spoken;
        const date = row.LastUsedDate;

        typedSum += typed;
        spokenSum += spoken;
        totalSum += total;

        if (date && date > latestDate) {
          latestDate = date;
        }
      });

      // 날짜 포맷 (2025-04-18 → 18. 04. 2025.)
      const dateParts = latestDate.split("-");
      const formattedDate = `${dateParts[2] + "   "}. ${
        dateParts[1] + "   "
      }. ${dateParts[0]}.`;

      // DOM에 반영
      document.getElementById("topic-typedFreq").textContent = typedSum;
      document.getElementById("topic-recordedFreq").textContent = spokenSum;
      document.getElementById("topic-totalFreq").textContent = totalSum;
      document.getElementById("topic-lastUsedDate").textContent = formattedDate;
    },
  });
}

function updateWordInfo(chosenWord) {
  Papa.parse(csvPath, {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;

      const wordRow = data.find((row) => row.Word === chosenWord);
      if (!wordRow) return;

      // Frequency 처리
      const typed = Number(wordRow.TypedFrequency) || 0;
      const recorded = Number(wordRow.RecordedFrequency) || 0;
      const total = typed + recorded;

      // 날짜 포맷
      let formattedDate = "-";
      if (wordRow.LastUsedDate) {
        const parts = wordRow.LastUsedDate.split("-");
        formattedDate = `${parts[2]}   . ${parts[1]}   . ${parts[0]}.`;
      }

      // 관련 단어 처리
      const relatedWords = (wordRow.RelatedWords || "")
        .split(",")
        .map((w) => w.trim());

      // DOM 반영
      document.getElementById("word-typedFreq").textContent = typed;
      document.getElementById("word-recordedFreq").textContent = recorded;
      document.getElementById("word-totalFreq").textContent = total;
      document.getElementById("word-lastUsedDate").textContent = formattedDate;

      // ✅ 관련 단어 렌더링 (이미지 포함)
      const relatedContainer = document.getElementById("word-relatedWords");
      relatedContainer.innerHTML = "";
      relatedWords.forEach((word, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "related-word-item";

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "img-wrapper";
        const img = document.createElement("img"); // ✅ 빠졌던 부분!

        if (index === 0) {
          img.src = "assets/relatedword1.png";
          img.className = "related-icon size-large";
        } else if (index <= 2) {
          img.src = "assets/relatedword2.png";
          img.className = "related-icon size-medium";
        } else {
          img.src = "assets/relatedword3.png";
          img.className = "related-icon size-small";
        }
        img.alt = "related-icon";

        const text = document.createElement("span");
        text.textContent = word;

        imgWrapper.appendChild(img); // 이미지를 wrapper에 넣음
        wrapper.appendChild(imgWrapper);
        wrapper.appendChild(text);
        relatedContainer.appendChild(wrapper);
      });

      // ✅ word bar chart 렌더링
      const chartContainer = document.getElementById("word-barchart");
      chartContainer.innerHTML = "";

      const barCount = 16;
      const maxHeight = 100;

      for (let i = 0; i < barCount; i++) {
        const typed = (Math.floor(Math.random() * maxHeight) / 10) * 10;
        const recorded = (Math.floor(Math.random() * typed) / 10) * 10;

        const barWrapper = document.createElement("div");
        barWrapper.className = "word-bar";

        const recordedBar = document.createElement("div");
        recordedBar.className = "recorded";
        recordedBar.style.height = `${recorded}px`;

        const typedBar = document.createElement("div");
        typedBar.className = "typed";
        typedBar.style.height = `${typed}px`;

        barWrapper.appendChild(recordedBar);
        barWrapper.appendChild(typedBar);
        chartContainer.appendChild(barWrapper);
      }
    },
  });
}

function parseCSVwithPapa() {
Papa.parse(csvPath, {
  download: true,
  header: true,
  complete: function (results) {
    const data = results.data;
    const frequencies = data
      .map((row) => Number(row.TotalFrequency))
      .filter((v) => !isNaN(v));

    const min = Math.min(...frequencies);
    const max = Math.max(...frequencies);
    const binSize = (max - min) / 16;
    const bins = new Array(16).fill(0);

    // TotalFrequency 값 기반으로 4등분 경계 계산
    const step = (max - min) / 4;
    const thresholds = Array.from({ length: 5 }, (_, i) =>
      Math.round(min + step * i)
    );

    // 레이블 표시
    const barLabels = document.getElementById("topic-barLabels");
    barLabels.innerHTML = thresholds.map((t) => `<span>${t}</span>`).join("");

    frequencies.forEach((val) => {
      const index = Math.min(15, Math.floor((val - min) / binSize));
      bins[index]++;
    });

    const maxCount = Math.max(...bins);

    bins.forEach((count, index) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${(count / maxCount) * 100}%`;

      bar.addEventListener("click", () => {
        if (startIndex === null) {
          startIndex = index;
          bar.classList.add("active");
        } else if (endIndex === null) {
          endIndex = index;
          applyRangeSelection(startIndex, endIndex);
        } else {
          // 다시 선택 시작
          resetSelection();
          startIndex = index;
          bar.classList.add("active");
        }
      });

      barchart.appendChild(bar);
    });
  },
});
}