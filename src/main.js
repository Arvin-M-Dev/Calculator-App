// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_DIGITS = 15;

// ─── DOM References ──────────────────────────────────────────────────────────

const toggleTheme = document.getElementById("toggle-theme");
const buttons = document.querySelectorAll("button");
const resultElement = document.getElementById("result-calculator");
const errorToast = document.getElementById("error-toast");
const errorToastMessage = document.getElementById("error-toast-message");

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  currentValue: "0",
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  justCalculated: false,
};

// ─── Keyboard Key Mapping ────────────────────────────────────────────────────

const typeKeys = {
  "+": { handle: handleOperator, bg: "bg-(--color-key-background)", bgActive: "bg-(--color-key-hover)" },
  "-": { handle: handleOperator, bg: "bg-(--color-key-background)", bgActive: "bg-(--color-key-hover)" },
  "*": { handle: handleOperator, bg: "bg-(--color-key-background)", bgActive: "bg-(--color-key-hover)" },
  "/": { handle: handleOperator, bg: "bg-(--color-key-background)", bgActive: "bg-(--color-key-hover)" },
  ".": { handle: handleDecimal, bg: "bg-(--color-key-background)", bgActive: "bg-(--color-key-hover)" },
  "Enter": { handle: handleEquals, bg: "bg-(--color-key-equal-background)", bgActive: "bg-(--color-key-equal-hover)" },
  "Backspace": { handle: handleDelete, bg: "bg-(--color-key-del-background)", bgActive: "bg-(--color-key-del-hover)" },
  "Escape": { handle: resetCalculator, bg: "bg-(--color-key-del-background)", bgActive: "bg-(--color-key-del-hover)" },
};

// ─── Calculator Core Functions ───────────────────────────────────────────────

function handleNumber(value) {
  if (
    state.currentValue === "0" ||
    state.waitingForOperand ||
    state.justCalculated
  ) {
    state.currentValue = value;
    state.justCalculated = false;
  } else {
    if (countDigits(state.currentValue) >= MAX_DIGITS) {
      showError("maxLength");
      return;
    }
    state.currentValue += value;
  }
  state.waitingForOperand = false;
  updateDisplay();
}

function handleDecimal(value) {
  if (
    state.currentValue === "0" ||
    state.waitingForOperand ||
    state.justCalculated
  ) {
    state.currentValue = "0.";
    state.justCalculated = false;
  } else if (!state.currentValue.includes(".")) {
    state.currentValue += value;
  }
  state.waitingForOperand = false;
  updateDisplay();
}

function handleOperator(value) {
  if (state.waitingForOperand) {
    state.operator = value;
  } else if (state.previousValue === null) {
    state.previousValue = state.currentValue;
    state.operator = value;
    state.currentValue = "0";
  } else if (
    state.operator === "/" &&
    !state.waitingForOperand &&
    Number(state.currentValue) === 0
  ) {
    console.error("Can't divided by zero");
    return;
  } else {
    const result = resultValue();
    state.previousValue = String(result);
    state.operator = value;
    state.currentValue = "0";
  }

  state.waitingForOperand = true;
  updateDisplay();
}

function handleEquals() {
  if (state.waitingForOperand) {
    showError("invalid");
    return;
  }
  if (
    state.operator === "/" &&
    !state.waitingForOperand &&
    Number(state.currentValue) === 0
  ) {
    showError("divide");
    return;
  }

  const result = resultValue();

  if (result || result === 0) {
    state.currentValue = String(formatResult(result));
    state.previousValue = null;
    state.operator = null;
    state.justCalculated = true;
    state.waitingForOperand = false;
    updateDisplay();
  } else {
    showError("invalid");
  }
}

function resetCalculator() {
  state.currentValue = "0";
  state.previousValue = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justCalculated = false;
  resultElement.textContent = state.currentValue;
}

function handleDelete() {
  if (state.waitingForOperand) return;

  const newCurrentValue = state.currentValue.slice(0, -1);

  if (!newCurrentValue.length) {
    state.currentValue = "0";
    if (state.previousValue) {
      state.waitingForOperand = true;
    }
  } else {
    state.currentValue = newCurrentValue;
  }
  state.justCalculated = false;
  updateDisplay();
}

// ─── Calculation Engine ──────────────────────────────────────────────────────

function resultValue() {
  const prevNum = Number(state.previousValue);
  const currentNum = Number(state.currentValue);

  let result;
  switch (state.operator) {
    case "+":
      result = prevNum + currentNum;
      break;
    case "-":
      result = prevNum - currentNum;
      break;
    case "*":
      result = prevNum * currentNum;
      break;
    case "/":
      result = prevNum / currentNum;
      break;
  }

  return result;
}

// ─── Display & Formatting ────────────────────────────────────────────────────

function updateDisplay() {
  if (state.previousValue === null && state.operator === null) {
    resultElement.textContent = formatNumber(state.currentValue);
  } else if (state.waitingForOperand) {
    resultElement.textContent =
      formatNumber(state.previousValue) + state.operator;
  } else {
    resultElement.textContent =
      formatNumber(state.previousValue) +
      state.operator +
      formatNumber(state.currentValue);
  }
}

function formatNumber(value) {
  if (value === "") return "0";
  if (value.includes("e")) return value;
  const [integerPart, decimalPart] = value.split(".");

  const formattedInteger = Number(integerPart).toLocaleString("en-US");

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
}

function formatResult(result) {
  if (!Number.isFinite(result)) {
    console.error("Result is not finite.");
    return;
  }

  if (result === 0) return "0";

  const magnitude = Math.floor(Math.log10(Math.abs(result)));

  if (magnitude >= 14 || magnitude <= -10) {
    return result.toExponential();
  }

  return String(result);
}

function countDigits(value) {
  return value.replace(/[.-]/g, "").length;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const themes = {
  "theme-1": { newTheme: "theme-2", position: "-translate-x-[50%]" },
  "theme-2": { newTheme: "theme-3", position: "translate-x-[50%]" },
  "theme-3": { newTheme: "theme-1", position: "translate-x-[-150%]" },
};

// ─── Audio ───────────────────────────────────────────────────────────────────

const audioCtx = new window.AudioContext();
let clickBuffer = null;

async function loadClickSound(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  clickBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

loadClickSound("./click.mp3");

function playClick() {
  if (!clickBuffer) return;
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  const source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// ─── Error Toast ─────────────────────────────────────────────────────────────

const errorsType = {
  divide: { message: "Can't divide by zero." },
  invalid: { message: "Invalid format used." },
  maxLength: { message: "Can't enter more than 15 digits." },
};

let toastTimeoutId;

function showError(type) {
  errorToastMessage.textContent = errorsType[type].message;
  errorToast.classList.remove("opacity-0", "scale-95", "pointer-events-none");
  errorToast.classList.add("opacity-100", "scale-100");

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    errorToast.classList.remove("opacity-100", "scale-100");
    errorToast.classList.add("opacity-0", "scale-95", "pointer-events-none");
  }, 2500);
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

document.documentElement.addEventListener("keydown", (e) => {
  const type = e.key;
  const isNumberKey = e.key >= "0" && e.key <= "9";

  const key = document.getElementById(type);

  if (isNumberKey && type !== " ") {
    handleNumber(key.dataset.value);
    key.classList.remove("bg-(--color-key-background)");
    key.classList.add("bg-(--color-key-hover)");
    playClick();
  } else {
    const keyConfig = typeKeys[type];
    if (keyConfig) {
      keyConfig.handle(key.dataset.value);
      key.classList.remove(keyConfig.bg);
      key.classList.add(keyConfig.bgActive);
      playClick();
    }
  }
});

document.documentElement.addEventListener("keyup", (e) => {
  const type = e.key;
  const isNumberKey = e.key >= "0" && e.key <= "9";

  const key = document.getElementById(type);

  if (isNumberKey && type !== " ") {
    key.classList.add("bg-(--color-key-background)");
    key.classList.remove("bg-(--color-key-hover)");
  } else {
    const keyConfig = typeKeys[type];
    if (keyConfig) {
      key.classList.add(keyConfig.bg);
      key.classList.remove(keyConfig.bgActive);
    }
  }
});

buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const type = e.currentTarget.dataset.type;

    switch (type) {
      case "number":
        handleNumber(e.currentTarget.dataset.value);
        break;
      case "decimal":
        handleDecimal(e.currentTarget.dataset.value);
        break;
      case "operator":
        handleOperator(e.currentTarget.dataset.value);
        break;
      case "equal":
        handleEquals();
        break;
      case "reset":
        resetCalculator();
        break;
      case "delete":
        handleDelete();
        break;
    }
  });
});

toggleTheme.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") ?? "theme-1";

  const newTheme = themes[currentTheme] ?? "theme-1";
  const newPosition = themes[currentTheme] ?? "translate-x-[-150%]";

  toggleTheme.children[0].classList.remove(
    "translate-x-[-150%]",
    "-translate-x-[50%]",
    "translate-x-[50%]",
  );
  toggleTheme.children[0].classList.add(newPosition.position);
  document.documentElement.setAttribute("data-theme", newTheme.newTheme);
  localStorage.setItem(
    "toggle-theme",
    JSON.stringify({
      theme: newTheme.newTheme,
      position: newPosition.position,
    }),
  );
});

window.addEventListener("DOMContentLoaded", () => {
  let getTheme = localStorage.getItem("toggle-theme");

  if (getTheme) {
    const { theme, position } = JSON.parse(getTheme);
    document.documentElement.setAttribute("data-theme", theme);
    toggleTheme.children[0].classList.add(position);
  } else {
    document.documentElement.setAttribute("data-theme", "theme-1");
    toggleTheme.children[0].classList.add("translate-x-[-150%]");
  }
});

document.querySelectorAll("button").forEach((item) => {
  item.addEventListener("click", playClick);
});
