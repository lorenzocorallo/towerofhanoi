const timeHoursEl = document.querySelector("#time-hours");
const timeMinutesEl = document.querySelector("#time-minutes");
const timeSecondsEl = document.querySelector("#time-seconds");
const timeMillisecondsEl = document.querySelector("#time-milliseconds");

let stopwatch = {
  offset: 0,
  paused: true,
};

const startStopwatch = () => {
  if (stopwatch.paused) {
    stopwatch.paused = false;
    stopwatch.offset -= Date.now();
    renderStopwatch();
  }
};

const stopStopwatch = () => {
  if (!stopwatch.paused) {
    stopwatch.paused = true;
    stopwatch.offset += Date.now();
  }
};

const resetStopwatch = () => {
  stopStopwatch();
  if (stopwatch.paused) {
    stopwatch.offset = 0;
    renderStopwatch();
  } else {
    stopwatch.offset = -Date.now();
  }
};

const format = (value, scale, modulo, padding) => {
  value = Math.floor(value / scale) % modulo;
  return value.toString().padStart(padding, 0);
};

const renderStopwatch = () => {
  const value = stopwatch.paused
    ? stopwatch.offset
    : Date.now() + stopwatch.offset;

  timeMillisecondsEl.innerHTML = format(value, 1, 1000, 3);
  timeSecondsEl.innerHTML = format(value, 1000, 60, 2);
  timeMinutesEl.innerHTML = format(value, 60000, 60, 2);
  timeHoursEl.innerHTML = format(value, 3600000, 60, 2);

  if (!stopwatch.paused) {
    requestAnimationFrame(renderStopwatch);
  }
};
