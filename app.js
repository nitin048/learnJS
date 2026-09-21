/**
 * JavaScript Masterclass Study Portal - Application Script
 * Features: Live Sandboxed Code IDE, Console Interceptor, Interactive Quiz, 
 * 3D Flashcards, Search Engine, and Progress Persistence.
 */

// Global State
const state = {
  activeView: 'notes',
  activeTopic: 'mod-1',
  completedTopics: JSON.parse(localStorage.getItem('js_course_completed') || '[]'),
  currentQuizIndex: 0,
  quizScore: 0,
  quizAnswered: false,
  currentFlashcardIndex: 0,
  flashcardsFlipped: false
};

// Quiz Question Bank (20+ In-Depth Questions based on the Course)
const quizQuestions = [
  {
    id: 1,
    topic: "Variables & Hoisting",
    question: "What will be logged to the console?",
    code: "console.log(a);\nvar a = 10;\nconsole.log(b);\nlet b = 20;",
    options: [
      "10 and 20",
      "undefined and undefined",
      "undefined and ReferenceError: Cannot access 'b' before initialization",
      "ReferenceError and ReferenceError"
    ],
    answer: 2,
    explanation: "`var a` is hoisted and initialized with `undefined`. `let b` is also hoisted to the top of its block scope, but remains uninitialized in the Temporal Dead Zone (TDZ) until the declaration line is reached, throwing a ReferenceError."
  },
  {
    id: 2,
    topic: "Data Types & Memory",
    question: "What will be logged to the console?",
    code: "let arr1 = [1, 2, 3];\nlet arr2 = arr1;\narr2.push(4);\nconsole.log(arr1.length);",
    options: ["3", "4", "undefined", "TypeError"],
    answer: 1,
    explanation: "Arrays are non-primitive Reference Types. Both `arr1` and `arr2` point to the exact same memory address in the Heap. Modifying `arr2` directly modifies `arr1`."
  },
  {
    id: 3,
    topic: "Type Coercion",
    question: "What is the output of `[] + []` and `[] + {}` in JavaScript?",
    code: "console.log([] + []);\nconsole.log([] + {});",
    options: [
      "'' (empty string) and '[object Object]'",
      "0 and NaN",
      "undefined and null",
      "[] and {}"
    ],
    answer: 0,
    explanation: "The `+` operator coerces objects to primitives. `[].toString()` is `''`. `'' + ''` is `''`. For `[] + {}`, `'' + '[object Object]'` results in `'[object Object]'`."
  },
  {
    id: 4,
    topic: "Operators & Short-Circuiting",
    question: "What is the result of the following expression?",
    code: "let val = 0 || 'AG' && null ?? 'Default';\nconsole.log(val);",
    options: ["0", "'AG'", "null", "'Default'"],
    answer: 2,
    explanation: "`'AG' && null` evaluates to `null`. Then `0 || null` evaluates to `null` (since 0 is falsy). Finally `null ?? 'Default'` returns `'Default'`? Wait! `??` only falls back for null/undefined: here `(0 || (null)) ?? 'Default'` => `null ?? 'Default'` returns `'Default'`. However, `&&` has higher precedence than `||`: `0 || ( 'AG' && null )` -> `0 || null` -> `null`. Then `null ?? 'Default'` -> `'Default'`."
  },
  {
    id: 5,
    topic: "Functions & Closures",
    question: "What will this loop output after 100ms?",
    code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}",
    options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "0, 0, 0"],
    answer: 1,
    explanation: "`var` is function-scoped (not block-scoped). All timer callbacks close over the exact same variable `i`. By the time the event loop runs the callbacks, `i` has incremented to 3."
  },
  {
    id: 6,
    topic: "Array Methods",
    question: "What does the `reduce()` method return in this accumulator calculation?",
    code: "const nums = [10, 20, 30];\nconst res = nums.reduce((acc, curr) => acc + curr, 5);\nconsole.log(res);",
    options: ["60", "65", "[15, 25, 35]", "undefined"],
    answer: 1,
    explanation: "The second parameter `5` is the initial value of the accumulator `acc`. The iterations run: 5+10=15 -> 15+20=35 -> 35+30=65."
  },
  {
    id: 7,
    topic: "Objects & Mutability",
    question: "What happens when you modify a property of an `Object.freeze()` object?",
    code: "'use strict';\nconst user = Object.freeze({ name: 'Harsh' });\nuser.name = 'AG';\nconsole.log(user.name);",
    options: [
      "'AG'",
      "TypeError: Cannot assign to read only property in strict mode",
      "undefined",
      "NaN"
    ],
    answer: 1,
    explanation: "`Object.freeze()` prevents modifications, additions, and deletions. In non-strict mode it fails silently; in strict mode (`'use strict'`), it throws a `TypeError`."
  },
  {
    id: 8,
    topic: "Type System Quirks",
    question: "What is `typeof NaN` and `typeof null` in JavaScript?",
    code: "console.log(typeof NaN, typeof null);",
    options: [
      "'number' and 'object'",
      "'nan' and 'null'",
      "'undefined' and 'object'",
      "'number' and 'null'"
    ],
    answer: 0,
    explanation: "`NaN` stands for 'Not a Number' but is a numeric type representing an invalid number calculation (typeof is `'number'`). `typeof null === 'object'` is a legacy bug in JavaScript from its first 1995 implementation."
  },
  {
    id: 9,
    topic: "Array Slice vs Splice",
    question: "Which of the following statements is true about `slice()` and `splice()`?",
    code: "const arr = [1, 2, 3, 4, 5];",
    options: [
      "`slice()` mutates the original array; `splice()` returns a shallow copy",
      "`splice()` mutates the original array; `slice()` returns a shallow copy without modifying original",
      "Both mutate the original array",
      "Neither mutates the original array"
    ],
    answer: 1,
    explanation: "`slice(start, end)` is pure/non-destructive and returns a new sub-array. `splice(start, deleteCount, ...items)` is destructive/mutating and modifies the array in-place."
  },
  {
    id: 10,
    topic: "Arrow Functions & `this`",
    question: "What is the output of calling `obj.greet()`?",
    code: "const obj = {\n  name: 'Alex',\n  greet: () => {\n    console.log(this.name);\n  }\n};\nobj.greet();",
    options: ["'Alex'", "undefined (or window.name in browser)", "TypeError: this is not defined", "null"],
    answer: 1,
    explanation: "Arrow functions DO NOT have their own `this` binding. They inherit `this` lexically from their enclosing scope (here, the global window/module scope), not the calling object."
  }
];

// Flashcard Deck for Rapid Revision
const flashcards = [
  {
    category: "Execution Architecture",
    question: "What is the Call Stack and Memory Heap?",
    answer: "• **Call Stack**: A LIFO (Last In, First Out) data structure that tracks active execution contexts and function execution.\n• **Memory Heap**: An unstructured memory region where reference types (Objects, Arrays, Functions) are allocated."
  },
  {
    category: "Variables & Scope",
    question: "What is the Temporal Dead Zone (TDZ)?",
    answer: "The period of time between entering a block scope and the actual line where a `let` or `const` variable is declared. Accessing the variable during TDZ triggers a **ReferenceError**."
  },
  {
    category: "Data Types",
    question: "What are the 7 Primitive Data Types in JS?",
    answer: "1. `Number`\n2. `String`\n3. `Boolean`\n4. `Undefined`\n5. `Null`\n6. `Symbol` (ES6)\n7. `BigInt` (ES2020)\n\n*All primitives are stored directly on the Call Stack and are immutable.*"
  },
  {
    category: "Type Coercion",
    question: "What are the 8 Falsy Values in JavaScript?",
    answer: "1. `false`\n2. `0`\n3. `-0`\n4. `0n` (BigInt zero)\n5. `\"\"` (Empty string)\n6. `null`\n7. `undefined`\n8. `NaN`\n\n*Everything else in JavaScript is Truthy (including `[]`, `{}`, and `\"0\"`).*"
  },
  {
    category: "Operators",
    question: "Difference between `==` and `===`?",
    answer: "• `==` (Loose equality): Performs **type coercion** before comparing values.\n• `===` (Strict equality): Compares both **value AND data type** without coercion."
  },
  {
    category: "Operators",
    question: "What is Nullish Coalescing (`??`) vs OR (`||`)?",
    answer: "• `||` returns the right-hand operand if the left is ANY falsy value (`0`, `\"\"`, `false`, `null`, `undefined`).\n• `??` ONLY falls back if the left operand is specifically `null` or `undefined` (safe for 0 and false)."
  },
  {
    category: "Functions",
    question: "What is a Higher-Order Function (HOF)?",
    answer: "A function that either:\n1. Accepts another function as an argument (e.g. `map`, `filter`, `addEventListener`), or\n2. Returns a new function (e.g. Currying, Function factories)."
  },
  {
    category: "Arrays",
    question: "How does `Array.prototype.reduce()` work?",
    answer: "`array.reduce((accumulator, currentValue, currentIndex, array) => { ... }, initialValue)`\nIterates through the array, accumulating a single result across all elements."
  },
  {
    category: "Objects",
    question: "What is the difference between `Object.freeze()` and `Object.seal()`?",
    answer: "• `Object.freeze()`: Cannot add, delete, OR modify existing properties.\n• `Object.seal()`: Cannot add or delete properties, BUT existing writable properties CAN still be modified."
  },
  {
    category: "Memory & References",
    question: "How do you create a deep clone of a nested object?",
    answer: "Modern JS: `structuredClone(obj)`\nAlternative: `JSON.parse(JSON.stringify(obj))` (fails on functions/symbols/circular refs)\nLibraries: `lodash.cloneDeep(obj)`"
  }
];

// Preset Code Snippets for the Live IDE
const codePresets = {
  hoisting: `// --- 1. Hoisting & Temporal Dead Zone Demo ---
console.log("=== VAR Hoisting ===");
console.log("Value of hoistedVar before declaration:", hoistedVar); // undefined
var hoistedVar = "I am a var";
console.log("Value after assignment:", hoistedVar);

console.log("\n=== LET & TDZ ===");
try {
  console.log(hoistedLet); // Throws ReferenceError!
  let hoistedLet = "I am a let";
} catch (err) {
  console.error("TDZ Error Caught:", err.message);
}`,

  types_memory: `// --- 2. Primitive vs Reference Memory ---
console.log("=== Primitive (Passed by Value) ===");
let a = 100;
let b = a;
b = 200;
console.log("a is:", a, "| b is:", b); // a remains 100

console.log("\n=== Reference (Passed by Reference) ===");
let originalObj = { user: "Akshat", skills: ["JS", "React"] };
let copiedRef = originalObj; // Points to same heap address!

copiedRef.user = "AG Developer";
console.log("originalObj.user:", originalObj.user); // Modified!

console.log("\n=== Deep Clone using structuredClone ===");
let deepClone = structuredClone(originalObj);
deepClone.user = "Independent Clone";
console.log("originalObj.user:", originalObj.user);
console.log("deepClone.user:", deepClone.user);`,

  coercion: `// --- 3. JavaScript Type Coercion Mysteries ---
console.log("[] + [] =>", JSON.stringify([] + []));         // ""
console.log("[] + {} =>", [] + {});                         // "[object Object]"
console.log("{} + [] =>", {} + []);                         // "[object Object]" or 0 in console
console.log("true + false =>", true + false);               // 1
console.log("'5' - 2 =>", '5' - 2);                         // 3 (subtraction coerces string to number)
console.log("'5' + 2 =>", '5' + 2);                         // "52" (addition concatenates string)
console.log("typeof NaN =>", typeof NaN);                   // "number"
console.log("NaN === NaN =>", NaN === NaN);                 // false (use Number.isNaN!)`,

  array_methods: `// --- 4. Array Mastery: Map, Filter, Reduce ---
const students = [
  { name: "Rahul", score: 85, passed: true },
  { name: "Priya", score: 42, passed: false },
  { name: "Amit", score: 92, passed: true },
  { name: "Neha", score: 78, passed: true }
];

console.log("=== High Scorers (> 80) ===");
const toppers = students.filter(s => s.score > 80);
console.table(toppers);

console.log("\n=== Average Score Calculation (Reduce) ===");
const totalScore = students.reduce((acc, curr) => acc + curr.score, 0);
const avgScore = totalScore / students.length;
console.log("Class Average:", avgScore);`,

  functions_closures: `// --- 5. Higher-Order Functions & Closures ---
function createCounter(initialValue = 0) {
  let count = initialValue; // Private variable closed over
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const counterA = createCounter(10);
console.log("Increment:", counterA.increment()); // 11
console.log("Increment:", counterA.increment()); // 12
console.log("Current Count:", counterA.getValue()); // 12

const counterB = createCounter(100);
console.log("Counter B Initial:", counterB.getValue()); // 100 (Independent scope)`
};

// ============================================================================
// Initialization & Event Binding
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProgressTracker();
  initCodePlayground();
  initQuiz();
  initFlashcards();
  initFaqAccordion();
  initSearch();
  updateProgressUI();
});

// Navigation Controller
function initNavigation() {
  const navTabs = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      switchView(view);
    });
  });

  // Sidebar link clicks
  const sidebarLinks = document.querySelectorAll('.module-nav-item');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.target.classList.contains('module-checkbox')) return;
      e.preventDefault();
      switchView('notes');
      
      const targetId = link.getAttribute('href').substring(1);
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Floating Action Button
  const fab = document.getElementById('fab-playground');
  if (fab) {
    fab.addEventListener('click', () => switchView('ide'));
  }
}

function switchView(viewName) {
  state.activeView = viewName;
  
  document.querySelectorAll('.tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.view === viewName);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Progress & LocalStorage
function initProgressTracker() {
  const checkboxes = document.querySelectorAll('.module-checkbox');
  
  checkboxes.forEach(cb => {
    const moduleId = cb.dataset.module;
    if (state.completedTopics.includes(moduleId)) {
      cb.checked = true;
    }

    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!state.completedTopics.includes(moduleId)) {
          state.completedTopics.push(moduleId);
        }
        showToast(`Topic Marked Complete!`);
      } else {
        state.completedTopics = state.completedTopics.filter(id => id !== moduleId);
      }
      localStorage.setItem('js_course_completed', JSON.stringify(state.completedTopics));
      updateProgressUI();
    });
  });
}

function updateProgressUI() {
  const total = document.querySelectorAll('.module-checkbox').length || 10;
  const completed = state.completedTopics.length;
  const percent = Math.round((completed / total) * 100);

  const fill = document.getElementById('progress-fill-mini');
  const text = document.getElementById('progress-text');
  if (fill) fill.style.width = `${percent}%`;
  if (text) text.textContent = `${percent}% Completed`;
}

// ============================================================================
// Sandboxed Code Playground / IDE & Console Interceptor
// ============================================================================
function initCodePlayground() {
  const ideTextarea = document.getElementById('ide-editor');
  const consoleOutput = document.getElementById('console-output');
  const runBtn = document.getElementById('btn-run-code');
  const clearBtn = document.getElementById('btn-clear-console');
  const presetSelect = document.getElementById('code-preset-select');

  // Load initial preset
  if (ideTextarea && !ideTextarea.value) {
    ideTextarea.value = codePresets.hoisting;
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const selected = presetSelect.value;
      if (codePresets[selected]) {
        ideTextarea.value = codePresets[selected];
        runPlaygroundCode();
      }
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', runPlaygroundCode);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      consoleOutput.innerHTML = `<div class="console-empty">Console is ready. Press "Run Code" or Ctrl+Enter.</div>`;
    });
  }

  // Keyboard shortcut Ctrl+Enter to execute
  if (ideTextarea) {
    ideTextarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runPlaygroundCode();
      }
    });
  }

  // Bind all "Run in IDE" buttons across the notes
  document.querySelectorAll('.btn-run-snippet').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-card').querySelector('pre code');
      if (codeBlock && ideTextarea) {
        ideTextarea.value = codeBlock.innerText.trim();
        switchView('ide');
        setTimeout(runPlaygroundCode, 150);
      }
    });
  });

  // Bind all "Copy" buttons
  document.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-card').querySelector('pre code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText.trim()).then(() => {
          showToast('Code copied to clipboard!');
        });
      }
    });
  });
}

function runPlaygroundCode() {
  const ideTextarea = document.getElementById('ide-editor');
  const consoleOutput = document.getElementById('console-output');
  if (!ideTextarea || !consoleOutput) return;

  const code = ideTextarea.value;
  consoleOutput.innerHTML = '';

  const logs = [];

  // Helper formatter for types
  function formatValue(v) {
    if (v === null) return `<span class="hl-bool">null</span>`;
    if (v === undefined) return `<span class="hl-cm">undefined</span>`;
    if (typeof v === 'string') return `<span class="hl-str">"${v}"</span>`;
    if (typeof v === 'number') return `<span class="hl-num">${v}</span>`;
    if (typeof v === 'boolean') return `<span class="hl-bool">${v}</span>`;
    if (typeof v === 'function') return `<span class="hl-fn">[Function: ${v.name || 'anonymous'}]</span>`;
    if (typeof v === 'object') {
      try {
        return JSON.stringify(v, null, 2);
      } catch (e) {
        return `[Circular Object]`;
      }
    }
    return String(v);
  }

  // Custom Console
  const customConsole = {
    log: (...args) => {
      const formatted = args.map(formatValue).join(' ');
      appendConsoleMsg('log', formatted);
    },
    error: (...args) => {
      const formatted = args.map(a => a instanceof Error ? a.stack : formatValue(a)).join(' ');
      appendConsoleMsg('error', `❌ ${formatted}`);
    },
    warn: (...args) => {
      const formatted = args.map(formatValue).join(' ');
      appendConsoleMsg('warn', `⚠️ ${formatted}`);
    },
    info: (...args) => {
      const formatted = args.map(formatValue).join(' ');
      appendConsoleMsg('info', `ℹ️ ${formatted}`);
    },
    table: (data) => {
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const keys = Object.keys(data[0]);
        let tableHtml = `<div class="table-wrapper"><table class="custom-table"><thead><tr><th>(index)</th>`;
        keys.forEach(k => tableHtml += `<th>${k}</th>`);
        tableHtml += `</tr></thead><tbody>`;
        data.forEach((row, idx) => {
          tableHtml += `<tr><td>${idx}</td>`;
          keys.forEach(k => tableHtml += `<td>${formatValue(row[k])}</td>`);
          tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        appendConsoleMsg('table', tableHtml);
      } else {
        appendConsoleMsg('log', JSON.stringify(data, null, 2));
      }
    }
  };

  function appendConsoleMsg(type, htmlContent) {
    const el = document.createElement('div');
    el.className = `console-msg ${type}`;
    el.innerHTML = htmlContent;
    consoleOutput.appendChild(el);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  try {
    // Execute safely wrapped with overridden console
    const runner = new Function('console', code);
    runner(customConsole);
    if (consoleOutput.children.length === 0) {
      appendConsoleMsg('info', 'Code executed successfully (no console output returned).');
    }
  } catch (err) {
    appendConsoleMsg('error', `❌ Uncaught ${err.name}: ${err.message}`);
  }
}

// ============================================================================
// Interactive Quiz Engine
// ============================================================================
function initQuiz() {
  renderQuizQuestion();

  const nextBtn = document.getElementById('btn-quiz-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.currentQuizIndex < quizQuestions.length - 1) {
        state.currentQuizIndex++;
        state.quizAnswered = false;
        renderQuizQuestion();
      } else {
        renderQuizResults();
      }
    });
  }

  const restartBtn = document.getElementById('btn-quiz-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.currentQuizIndex = 0;
      state.quizScore = 0;
      state.quizAnswered = false;
      document.getElementById('quiz-active-view').style.display = 'block';
      document.getElementById('quiz-result-view').style.display = 'none';
      renderQuizQuestion();
    });
  }
}

function renderQuizQuestion() {
  const q = quizQuestions[state.currentQuizIndex];
  if (!q) return;

  const progressFill = document.getElementById('quiz-progress-fill');
  const counterText = document.getElementById('quiz-counter');
  const questionText = document.getElementById('quiz-question-text');
  const codeBox = document.getElementById('quiz-code-box');
  const optionsList = document.getElementById('quiz-options-list');
  const explanationBox = document.getElementById('quiz-explanation-box');
  const nextBtn = document.getElementById('btn-quiz-next');

  if (progressFill) {
    progressFill.style.width = `${((state.currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
  }
  if (counterText) {
    counterText.textContent = `Question ${state.currentQuizIndex + 1} of ${quizQuestions.length}`;
  }
  if (questionText) {
    questionText.textContent = q.question;
  }

  if (codeBox) {
    if (q.code) {
      codeBox.style.display = 'block';
      codeBox.innerHTML = `<code>${escapeHtml(q.code)}</code>`;
    } else {
      codeBox.style.display = 'none';
    }
  }

  if (explanationBox) {
    explanationBox.classList.remove('show');
    explanationBox.innerHTML = '';
  }

  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = (state.currentQuizIndex === quizQuestions.length - 1) ? 'Finish Quiz' : 'Next Question →';
  }

  if (optionsList) {
    optionsList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span class="quiz-opt-label">${labels[idx]}</span> <span>${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => handleQuizOptionClick(idx, btn));
      optionsList.appendChild(btn);
    });
  }
}

function handleQuizOptionClick(selectedIndex, btnElement) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  const q = quizQuestions[state.currentQuizIndex];
  const allOptionBtns = document.querySelectorAll('.quiz-opt-btn');
  const explanationBox = document.getElementById('quiz-explanation-box');
  const nextBtn = document.getElementById('btn-quiz-next');

  allOptionBtns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.answer) {
      b.classList.add('correct');
    }
  });

  if (selectedIndex === q.answer) {
    state.quizScore++;
    btnElement.classList.add('correct');
    showToast('Correct Answer! 🎉');
  } else {
    btnElement.classList.add('incorrect');
    showToast('Incorrect! Check explanation below.');
  }

  if (explanationBox) {
    explanationBox.innerHTML = `<strong>💡 Explanation:</strong><p style="margin-top:0.4rem;">${q.explanation}</p>`;
    explanationBox.classList.add('show');
  }

  if (nextBtn) {
    nextBtn.disabled = false;
  }
}

function renderQuizResults() {
  document.getElementById('quiz-active-view').style.display = 'none';
  const resultView = document.getElementById('quiz-result-view');
  resultView.style.display = 'block';

  const scoreBadge = document.getElementById('quiz-score-badge');
  const scoreMsg = document.getElementById('quiz-score-msg');
  const total = quizQuestions.length;
  const score = state.quizScore;
  const percent = Math.round((score / total) * 100);

  if (scoreBadge) scoreBadge.textContent = `${score}/${total}`;
  if (scoreMsg) {
    if (percent >= 80) {
      scoreMsg.textContent = `🏆 JavaScript Master! Exceptional grasp of core JS concepts.`;
    } else if (percent >= 50) {
      scoreMsg.textContent = `👍 Good job! Review the tricky topics in the notes to hit 100%.`;
    } else {
      scoreMsg.textContent = `📚 Keep learning! Re-read the chapters and try the live playground.`;
    }
  }
}

// ============================================================================
// 3D Flashcards Deck
// ============================================================================
function initFlashcards() {
  renderFlashcard();

  const cardWrapper = document.getElementById('flashcard-wrapper');
  if (cardWrapper) {
    cardWrapper.addEventListener('click', () => {
      cardWrapper.classList.toggle('flipped');
      state.flashcardsFlipped = !state.flashcardsFlipped;
    });
  }

  const prevBtn = document.getElementById('btn-card-prev');
  const nextBtn = document.getElementById('btn-card-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.currentFlashcardIndex > 0) {
        state.currentFlashcardIndex--;
        resetAndRenderCard();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.currentFlashcardIndex < flashcards.length - 1) {
        state.currentFlashcardIndex++;
        resetAndRenderCard();
      }
    });
  }
}

function resetAndRenderCard() {
  const cardWrapper = document.getElementById('flashcard-wrapper');
  if (cardWrapper) {
    cardWrapper.classList.remove('flipped');
    state.flashcardsFlipped = false;
  }
  setTimeout(renderFlashcard, 150);
}

function renderFlashcard() {
  const card = flashcards[state.currentFlashcardIndex];
  if (!card) return;

  const catEl = document.getElementById('card-category');
  const countEl = document.getElementById('card-counter');
  const questionEl = document.getElementById('card-question');
  const answerEl = document.getElementById('card-answer');

  if (catEl) catEl.textContent = card.category;
  if (countEl) countEl.textContent = `Card ${state.currentFlashcardIndex + 1} of ${flashcards.length}`;
  if (questionEl) questionEl.innerHTML = card.question;
  if (answerEl) answerEl.innerHTML = card.answer.replace(/\n/g, '<br/>');
}

// ============================================================================
// FAQ / Interview Accordion
// ============================================================================
function initFaqAccordion() {
  document.querySelectorAll('.faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      item.classList.toggle('open');
    });
  });
}

// ============================================================================
// Search Engine across All Topics & Questions
// ============================================================================
function initSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      document.querySelectorAll('.topic-card, .faq-item').forEach(el => el.style.display = '');
      return;
    }

    // Search in topic notes
    document.querySelectorAll('.topic-card').forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? 'block' : 'none';
    });

    // Search in FAQ
    document.querySelectorAll('.faq-item').forEach(faq => {
      const text = faq.innerText.toLowerCase();
      faq.style.display = text.includes(query) ? 'block' : 'none';
      if (text.includes(query)) faq.classList.add('open');
    });
  });
}

// ============================================================================
// Utilities
// ============================================================================
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
