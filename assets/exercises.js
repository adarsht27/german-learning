/* ============================================================
   German Learning KB — Exercise Engine  (exercises.js)
   Shared logic for all four exercise types on every topic page.

   Exercise types:
     1. Lückentext        — gap-fill text inputs
     2. Sprachbausteine   — dropdown selects in a running text
     3. Multiple Choice   — button-group selection
     4. Fehlerkorrektur   — spot-and-correct text inputs
   ============================================================ */

/* ── Shared: score display ─────────────────────────────────── */
function _showScore(el, correct, total) {
  if (!el) return;
  var pct = Math.round((correct / total) * 100);
  el.textContent = 'Score: ' + correct + '/' + total + ' (' + pct + '%)';
  el.className = 'exercise-score ' +
    (pct >= 80 ? 'score-pass' : pct >= 50 ? 'score-partial' : 'score-fail');
}

/* ── 1. Gap-fill (Lückentext) ──────────────────────────────── */
function checkGapFill(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  var inputs = block.querySelectorAll('.gap-input');
  var correct = 0;
  inputs.forEach(function (input) {
    var answer   = input.value.trim().toLowerCase();
    var expected = (input.dataset.answer || '').toLowerCase();
    input.classList.remove('correct', 'incorrect');
    if (answer === expected)  { input.classList.add('correct');   correct++; }
    else if (answer !== '')   { input.classList.add('incorrect'); }
  });
  _showScore(block.querySelector('.exercise-score'), correct, inputs.length);
}

function resetGapFill(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  block.querySelectorAll('.gap-input').forEach(function (i) {
    i.value = ''; i.classList.remove('correct', 'incorrect');
  });
  var s = block.querySelector('.exercise-score');
  if (s) { s.textContent = ''; s.className = 'exercise-score'; }
}

/* ── 2. Sprachbausteine (dropdowns) ───────────────────────── */
function checkSB(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  var selects = block.querySelectorAll('.sb-select');
  var correct = 0;
  selects.forEach(function (sel) {
    var answer   = sel.value.toLowerCase();
    var expected = (sel.dataset.answer || '').toLowerCase();
    sel.classList.remove('correct', 'incorrect');
    if (answer === expected)  { sel.classList.add('correct');   correct++; }
    else if (answer !== '')   { sel.classList.add('incorrect'); }
  });
  _showScore(block.querySelector('.exercise-score'), correct, selects.length);
}

function resetSB(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  block.querySelectorAll('.sb-select').forEach(function (s) {
    s.selectedIndex = 0; s.classList.remove('correct', 'incorrect');
  });
  var sc = block.querySelector('.exercise-score');
  if (sc) { sc.textContent = ''; sc.className = 'exercise-score'; }
}

/* ── 3. Multiple Choice ────────────────────────────────────── */
function selectMC(btn, blockId, itemIdx) {
  var block = document.getElementById(blockId);
  if (!block) return;
  var items = block.querySelectorAll('.mc-list > li');
  if (!items[itemIdx]) return;
  items[itemIdx].querySelectorAll('.mc-btn').forEach(function (b) {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
}

function checkMC(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  var items = block.querySelectorAll('.mc-list > li');
  var correct = 0;
  items.forEach(function (item) {
    var selected = item.querySelector('.mc-btn.selected');
    var feedback = item.querySelector('.mc-feedback');
    item.querySelectorAll('.mc-btn').forEach(function (b) {
      b.classList.remove('correct', 'incorrect', 'reveal-correct');
      b.disabled = true;
    });
    if (selected) {
      var ok = selected.dataset.correct === 'true';
      selected.classList.add(ok ? 'correct' : 'incorrect');
      if (!ok) {
        item.querySelectorAll('.mc-btn').forEach(function (b) {
          if (b.dataset.correct === 'true') b.classList.add('reveal-correct');
        });
      }
      if (feedback) {
        feedback.textContent = ok
          ? '✓ Correct!'
          : '✗ ' + (selected.dataset.hint || 'Incorrect.');
        feedback.className = 'mc-feedback ' + (ok ? 'correct' : 'incorrect');
      }
      if (ok) correct++;
    } else {
      if (feedback) { feedback.textContent = '(no answer selected)'; }
    }
  });
  _showScore(block.querySelector('.exercise-score'), correct, items.length);
}

function resetMC(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  block.querySelectorAll('.mc-btn').forEach(function (b) {
    b.classList.remove('selected', 'correct', 'incorrect', 'reveal-correct');
    b.disabled = false;
  });
  block.querySelectorAll('.mc-feedback').forEach(function (f) {
    f.textContent = ''; f.className = 'mc-feedback';
  });
  var sc = block.querySelector('.exercise-score');
  if (sc) { sc.textContent = ''; sc.className = 'exercise-score'; }
}

/* ── 4. Fehlerkorrektur ────────────────────────────────────── */
function checkErrCor(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  var inputs = block.querySelectorAll('.errcor-input');
  var correct = 0;
  inputs.forEach(function (input) {
    var answer   = input.value.trim().toLowerCase();
    var expected = (input.dataset.answer || '').toLowerCase();
    var fb = input.nextElementSibling;
    input.classList.remove('correct', 'incorrect');
    if (answer === expected) {
      input.classList.add('correct');
      if (fb && fb.classList.contains('item-feedback')) {
        fb.textContent = '✓'; fb.className = 'item-feedback correct';
      }
      correct++;
    } else if (answer !== '') {
      input.classList.add('incorrect');
      if (fb && fb.classList.contains('item-feedback')) {
        fb.textContent = '✗'; fb.className = 'item-feedback incorrect';
      }
    }
  });
  _showScore(block.querySelector('.exercise-score'), correct, inputs.length);
}

function resetErrCor(blockId) {
  var block = document.getElementById(blockId);
  if (!block) return;
  block.querySelectorAll('.errcor-input').forEach(function (i) {
    i.value = ''; i.classList.remove('correct', 'incorrect');
  });
  block.querySelectorAll('.item-feedback').forEach(function (f) {
    f.textContent = ''; f.className = 'item-feedback';
  });
  var sc = block.querySelector('.exercise-score');
  if (sc) { sc.textContent = ''; sc.className = 'exercise-score'; }
}
