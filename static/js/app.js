/**********************/
/* Declarations
/*********************/
const diskContainers = document.querySelectorAll(".disk__container");
const diskNumberInput = document.querySelector("#disk-number");
const defaultWidth = 28;
const diskContainerHeight = 26;
const displayDiskNumber = document.querySelector(".display-disk-number");
const startBtn = document.querySelector("#start-btn");
const sliderAnimate = document.querySelector(".custom__slider__remaining");
const estimatedTimeEl = document.querySelector("#estimated-time");
const movesNumberEl = document.querySelector("#moves");
const displaySequence = document.querySelector("#display-sequence");
const displayMoves = document.querySelector("#display-moves");
const velocityBtns = document.querySelectorAll(".velocity-btn");

const speed = {
  slow: 1000,
  medium: 500,
  fast: 80,
};

let max = 3;
let velocity = speed.medium;
let state = "init";
let shouldStop = false;

/**********************/
/* Functions
/*********************/

const changeVelocity = (e) => {
  velocityBtns.forEach((btn) => {
    btn.classList.remove("selected");
  });
  e.target.classList.add("selected");
  const speedName = e.target.attributes["data-speed"].value;
  velocity = speed[speedName];

  updateEstimatedTime();
};

const updateSliderAnimate = () => {
  sliderAnimate.style.transform = `translateX(${
    Math.round((max / 17) * 100) - 5
  }%)`;
};

const checkSequenceCondition = (n, target) => {
  const cond1 =
    (n - Math.pow(2, target - 1)) % (2 * Math.pow(2, target - 1)) == 0;
  const cond2 = n - Math.pow(2, target - 1) == 0;
  return cond1 || cond2;
};

const constructSequence = () => {
  const sequence = [];
  for (let n = 1; n <= Math.pow(2, max) - 1; n++) {
    if (n % 2) sequence.push(1);
    else {
      let a = 2;
      let ok = false;
      while (!ok) {
        ok = checkSequenceCondition(n, a);
        a += 1;
      }
      sequence.push(a - 1);
    }
  }
  movesNumberEl.innerHTML = sequence.length.toLocaleString();
  if (sequence.length > 20000) {
    displaySequence.innerHTML = "";
    let arrays = [];
    let temp = [];
    for (let i = 0; i < sequence.length; i++) {
      if (temp.length > 1900) {
        arrays.push(temp);
        temp = [];
      } else {
        temp.push(sequence[i]);
      }
    }
    arrays.push(temp);
    temp = [];
    arrays.forEach((a) => {
      const p = document.createElement("p");
      p.innerHTML = a.join(" ");
      displaySequence.append(p);
    });
    arrays = [];
  } else {
    displaySequence.innerHTML = sequence.join(" ");
  }

  return sequence;
};

const updateEstimatedTime = () => {
  const base_ms = parseInt(Math.pow(2, parseInt(max)) * velocity);
  const hValue = parseInt(base_ms / (3.6 * Math.pow(10, 6)));
  const mValue =
    parseInt(base_ms / (6 * Math.pow(10, 4))) - parseInt(hValue * 60);
  const sValue =
    parseInt(base_ms / (1 * Math.pow(10, 3))) -
    parseInt(hValue * 60 * 60) -
    parseInt(mValue * 60);
  const msValue =
    base_ms -
    parseInt(hValue * 60 * 60 * 1000) -
    parseInt(mValue * 60 * 1000) -
    parseInt(sValue * 1000);

  const h = hValue ? hValue + "h " : "";
  const m = mValue ? mValue + "m " : "";
  const s = sValue ? sValue + "s " : "";
  const ms = msValue ? msValue + "ms" : "";

  estimatedTimeEl.innerHTML = h + m + s + ms;
};

const createDisk = (n) => {
  const disk = document.createElement("div");
  disk.classList.add("disk");
  disk.style.width = `${(defaultWidth * (n + 1)) / max}vw`;
  disk.style.height = `${Math.min(diskContainerHeight / max, 15)}rem`;
  disk.attributes["data-number"] = n + 1;
  diskContainers[0].append(disk);
};

const constructDisks = () => {
  const disks = [];
  const disksHtml = document.getElementsByClassName("disk");
  for (const disk of disksHtml) {
    disks.push({ id: disk.attributes["data-number"], disk: disk });
  }

  return disks;
};

// Print move to the terminal (#display-moves)
const printMove = (id, currentIndex, pos) => {
  const p = document.createElement("p");
  p.innerHTML = `> ${id}: (${currentIndex} => ${pos})`;
  displayMoves.append(p);
  displayMoves.parentNode.scrollTop = displayMoves.parentNode.scrollHeight;
};

const move = (disk, id, direction) => {
  try {
    const diskParent = disk.parentNode;
    const currentIndex = parseInt(diskParent.attributes["data-number"].value);
    let pos = -1;
    if (direction === "left") {
      pos = currentIndex === 0 ? 2 : currentIndex - 1;
    } else if (direction === "right") {
      pos = currentIndex === 2 ? 0 : currentIndex + 1;
    } else {
      throw new Error('Direction not valid. Use "left" or "right"');
    }
    diskContainers.forEach((v, i) => {
      if (i === pos) {
        const children = v.children;
        v.insertBefore(disk, children[0]);
      }
    });
    printMove(id, currentIndex, pos);
  } catch (err) {
    console.error("Move function: ", err.message);
  }
};

const execution = (sequence, disks) => {
  startBtn.classList.add("reset");
  startBtn.innerHTML = "Reset";
  state = "solving";
  startStopwatch();
  timer = sequence.every(async (n, i) => {
    setTimeout(() => {
      const { disk, id } = disks.find(({ id }) => id == n);
      if (shouldStop || !disk.parentNode) return false;
      if (n % 2) {
        move(disk, id, "left");
      } else {
        move(disk, id, "right");
      }
      if (i === sequence.length - 1) {
        state = "solved";
        stopStopwatch();
      }
    }, velocity * (i + 1));
  });
};

const initGame = () => {
  displayDiskNumber.innerHTML = max;
  constructSequence();
  updateSliderAnimate();
  updateEstimatedTime();
  resetStopwatch();

  for (let i = 0; i < max; i++) {
    createDisk(i, max);
  }

  state = "init";
  startBtn.classList.remove("reset");
  startBtn.innerHTML = "Solve";
  shouldStop = false;
};

const destroyGame = () => {
  diskContainers.forEach((container) => {
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  });
  while (displayMoves.lastChild) {
    displayMoves.removeChild(displayMoves.lastChild);
  }
  while (displaySequence.lastChild) {
    displaySequence.removeChild(displaySequence.lastChild);
  }
  disks = [];
};

const startGame = () => {
  if (state === "init") {
    const disks = constructDisks();
    const sequence = constructSequence();
    execution(sequence, disks);
  } else {
    shouldStop = true;
    destroyGame();
    initGame();
  }
};

/**********************/
/* Event Listeners
/*********************/

velocityBtns.forEach((v) => {
  v.addEventListener("click", changeVelocity);
});

diskNumberInput.addEventListener("input", (e) => {
  state = "modified";
  max = e.target.value;
  startGame();
});

startBtn.addEventListener("click", startGame);

/**********************/
/* Calls
/*********************/

initGame();
