// game.js — Main game logic for build + solve modes

const Game = (() => {
  let currentPuzzle = null;
  let currentPuzzleIndex = 0;
  let totalPuzzles = 0;
  let solved = false;
  let hintShown = false;
  let timerInterval = null;
  let timeRemaining = 0;
  let scores = [];

  // Build mode
  let slotStates = {};

  // Solve mode
  let resistorStates = {};
  let batteryVoltageIndex = 0;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function el(id) { return document.getElementById(id); }

  // ═══════════════════════════════════════════
  //  SCREENS
  // ═══════════════════════════════════════════
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el('screen-' + name).classList.add('active');
  }

  // ═══════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════
  function init() {
    totalPuzzles = Puzzles.getAll().length;
    el('total-puzzles').textContent = totalPuzzles;
    el('btn-start').addEventListener('click', () => { currentPuzzleIndex = 0; scores = []; startPuzzle(0); });
    el('btn-next').addEventListener('click', () => {
      currentPuzzleIndex++;
      currentPuzzleIndex < totalPuzzles ? startPuzzle(currentPuzzleIndex) : showResults();
    });
    el('btn-restart').addEventListener('click', () => { currentPuzzleIndex = 0; scores = []; showScreen('title'); });
    el('btn-hint').addEventListener('click', toggleHint);
    el('btn-check').addEventListener('click', checkAnswer);
    showScreen('title');
  }

  // ═══════════════════════════════════════════
  //  START PUZZLE
  // ═══════════════════════════════════════════
  function startPuzzle(index) {
    const puzzle = Puzzles.getAll()[index];
    currentPuzzle = puzzle;
    solved = false;
    hintShown = false;
    slotStates = {};
    resistorStates = {};
    batteryVoltageIndex = 0;

    if (puzzle.type === 'build') {
      puzzle.slots.forEach(s => { slotStates[s.id] = 'empty'; });
    } else {
      getAllResistorSlots(puzzle).forEach(rs => { resistorStates[rs.id] = false; });
    }

    el('puzzle-number').textContent = `${index + 1} / ${totalPuzzles}`;
    el('puzzle-title').textContent = puzzle.title;
    el('puzzle-category').textContent = puzzle.category;
    el('puzzle-desc').textContent = puzzle.description;
    el('hint-text').textContent = puzzle.hint;
    el('hint-box').classList.add('hidden');
    el('btn-hint').textContent = '💡 Hint';
    el('feedback').className = 'feedback hidden';
    el('feedback').textContent = '';
    el('btn-check').disabled = false;
    el('btn-next').classList.add('hidden');

    el('instruction-text').innerHTML = puzzle.type === 'build'
      ? 'Click a <span style="color:#4fc3f7;">dashed slot</span> to cycle: Empty → Resistor → Switch → Battery → Bulb'
      : 'Click <span style="color:#ff8a65;">resistor slots</span> to toggle on/off · Click the <span style="color:#66bb6a;">battery</span> to change voltage · Hit the <span style="color:#ce93d8;">target range</span>';

    drawCircuit(puzzle);
    startTimer(puzzle.timeLimit);
    showScreen('puzzle');
  }

  function getAllResistorSlots(puzzle) {
    const slots = [];
    if (puzzle.resistorSlots) slots.push(...puzzle.resistorSlots);
    if (puzzle.seriesResistorSlots) slots.push(...puzzle.seriesResistorSlots);
    if (puzzle.branches) puzzle.branches.forEach(b => { if (b.resistorSlots) slots.push(...b.resistorSlots); });
    return slots;
  }

  function getAllBulbs(puzzle) {
    const bulbs = [];
    if (puzzle.bulbs) bulbs.push(...puzzle.bulbs);
    if (puzzle.branches) puzzle.branches.forEach(b => { if (b.bulb) bulbs.push(b.bulb); });
    return bulbs;
  }

  // ═══════════════════════════════════════════
  //  DRAW CIRCUIT
  // ═══════════════════════════════════════════
  function drawCircuit(puzzle) {
    const svg = el('circuit-svg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    puzzle.wires.forEach(w => {
      const line = Components.createLine(w.x1, w.y1, w.x2, w.y2, Components.COLORS.wire, 2.5);
      line.style.opacity = '0.5';
      svg.appendChild(line);
    });

    if (puzzle.junctions) {
      puzzle.junctions.forEach(j => {
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', j.x); dot.setAttribute('cy', j.y);
        dot.setAttribute('r', 5); dot.setAttribute('fill', Components.COLORS.wire);
        svg.appendChild(dot);
      });
    }

    puzzle.type === 'build' ? drawBuildMode(svg, puzzle) : drawSolveMode(svg, puzzle);
  }

  // ─── Build Mode ───
  function drawBuildMode(svg, puzzle) {
    puzzle.fixed.forEach(f => Components.draw(svg, f.type, f.cx, f.cy, f.orientation));
    puzzle.slots.forEach(s => renderBuildSlot(svg, s));
  }

  function renderBuildSlot(svg, slotDef) {
    const current = slotStates[slotDef.id];
    const old = svg.querySelector(`[data-slot="${slotDef.id}"]`);
    if (old) old.remove();

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('data-slot', slotDef.id);
    g.style.cursor = solved ? 'default' : 'pointer';

    if (current === 'empty') {
      Components.drawSlot(g, slotDef.cx, slotDef.cy, slotDef.orientation);
    } else {
      Components.draw(g, current, slotDef.cx, slotDef.cy, slotDef.orientation);
    }

    if (current !== 'empty') {
      const ly = slotDef.orientation === 'h' ? slotDef.cy + 30 : slotDef.cy;
      const lx = slotDef.orientation === 'h' ? slotDef.cx : slotDef.cx + 46;
      g.appendChild(Components.createText(lx, ly, current.toUpperCase(), 9, '#90a4ae'));
    }

    if (!solved) {
      g.addEventListener('click', () => {
        const types = Components.TYPES;
        slotStates[slotDef.id] = types[(types.indexOf(slotStates[slotDef.id]) + 1) % types.length];
        renderBuildSlot(svg, slotDef);
        el('feedback').className = 'feedback hidden';
      });
      g.addEventListener('mouseenter', () => { g.style.filter = 'brightness(1.3)'; });
      g.addEventListener('mouseleave', () => { g.style.filter = ''; });
    }
    svg.appendChild(g);
  }

  // ─── Solve Mode ───
  function drawSolveMode(svg, puzzle) {
    renderBattery(svg, puzzle);
    getAllResistorSlots(puzzle).forEach(rs => renderResistorSlot(svg, rs));
    getAllBulbs(puzzle).forEach(b => {
      Components.drawBulb(svg, b.cx, b.cy, b.orientation, {
        ratings: { resistance: b.resistance, minVoltage: b.minVoltage, maxVoltage: b.maxVoltage, minCurrent: b.minCurrent, maxCurrent: b.maxCurrent }
      });
    });
  }

  function renderBattery(svg, puzzle) {
    const batt = puzzle.battery;
    const old = svg.querySelector('[data-battery]');
    if (old) old.remove();

    const voltage = batt.voltages[batteryVoltageIndex];
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('data-battery', 'true');
    Components.drawBattery(g, batt.cx, batt.cy, batt.orientation, { voltage, clickable: !solved });

    if (!solved) {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => {
        batteryVoltageIndex = (batteryVoltageIndex + 1) % batt.voltages.length;
        renderBattery(svg, puzzle);
        el('feedback').className = 'feedback hidden';
      });
      g.addEventListener('mouseenter', () => { g.style.filter = 'brightness(1.3)'; });
      g.addEventListener('mouseleave', () => { g.style.filter = ''; });
    }
    svg.appendChild(g);
  }

  function renderResistorSlot(svg, rsDef) {
    const placed = resistorStates[rsDef.id];
    const old = svg.querySelector(`[data-rslot="${rsDef.id}"]`);
    if (old) old.remove();

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('data-rslot', rsDef.id);
    g.style.cursor = solved ? 'default' : 'pointer';
    Components.drawResistorToggle(g, rsDef.cx, rsDef.cy, rsDef.orientation, rsDef.ohms, placed);

    if (!solved) {
      g.addEventListener('click', () => {
        resistorStates[rsDef.id] = !resistorStates[rsDef.id];
        renderResistorSlot(svg, rsDef);
        el('feedback').className = 'feedback hidden';
      });
      g.addEventListener('mouseenter', () => { g.style.filter = 'brightness(1.3)'; });
      g.addEventListener('mouseleave', () => { g.style.filter = ''; });
    }
    svg.appendChild(g);
  }

  // ═══════════════════════════════════════════
  //  CHECK ANSWER
  // ═══════════════════════════════════════════
  function checkAnswer() {
    if (solved) return;
    currentPuzzle.type === 'build' ? checkBuild() : checkSolve();
  }

  function checkBuild() {
    const puzzle = currentPuzzle;
    let anyEmpty = false, allCorrect = true;
    puzzle.slots.forEach(s => {
      if (slotStates[s.id] === 'empty') anyEmpty = true;
      if (slotStates[s.id] !== s.correctAnswer) allCorrect = false;
    });
    const fb = el('feedback');
    if (anyEmpty) { fb.className = 'feedback wrong'; fb.textContent = '⚠ Fill in all empty slots before checking!'; return; }
    if (allCorrect) { puzzleSolved(); }
    else { fb.className = 'feedback wrong'; fb.textContent = '✗ Not quite right. Check your components and try again!'; shakeElements('[data-slot]'); }
  }

  function checkSolve() {
    const puzzle = currentPuzzle;
    const voltage = puzzle.battery.voltages[batteryVoltageIndex];
    const result = validateCircuit(puzzle, voltage, resistorStates);
    const fb = el('feedback');

    if (result.allInRange) {
      fb.className = 'feedback correct';
      fb.innerHTML = '✅ Perfect! ' + result.details.map(d =>
        `<strong>${d.name}</strong>: I = ${d.current.toFixed(3)}A ✓ &nbsp; V = ${d.vBulb.toFixed(2)}V ✓`
      ).join('<br>') + `<br><strong>${calcScore()} pts</strong>`;
      puzzleSolved();
    } else {
      fb.className = 'feedback wrong';
      fb.innerHTML = '✗ Not in target range!<br>' + result.details.map(d => {
        let parts = [];
        if (d.vLow) parts.push(`V = ${d.vBulb.toFixed(2)}V <span style="color:#ffb74d">⬇ too low</span> (need ≥${d.minV}V)`);
        else if (d.vHigh) parts.push(`V = ${d.vBulb.toFixed(2)}V <span style="color:#ef5350">⬆ too high</span> (need ≤${d.maxV}V)`);
        else parts.push(`V = ${d.vBulb.toFixed(2)}V ✓`);

        if (d.iLow) parts.push(`I = ${d.current.toFixed(3)}A <span style="color:#ffb74d">⬇ too low</span> (need ≥${d.minI}A)`);
        else if (d.iHigh) parts.push(`I = ${d.current.toFixed(3)}A <span style="color:#ef5350">⬆ too high</span> (need ≤${d.maxI}A)`);
        else parts.push(`I = ${d.current.toFixed(3)}A ✓`);

        return `<strong>${d.name}</strong>: ${parts.join(' · ')}`;
      }).join('<br>');
      shakeElements('[data-rslot], [data-battery]');
    }
  }

  // ═══════════════════════════════════════════
  //  CIRCUIT VALIDATION (Ohm's Law + range check)
  // ═══════════════════════════════════════════

  function checkBulb(current, vBulb, bulb) {
    const vLow = vBulb < bulb.minVoltage;
    const vHigh = vBulb > bulb.maxVoltage;
    const iLow = current < bulb.minCurrent;
    const iHigh = current > bulb.maxCurrent;
    const inRange = !vLow && !vHigh && !iLow && !iHigh;
    return {
      current, vBulb, inRange,
      vLow, vHigh, iLow, iHigh,
      minV: bulb.minVoltage, maxV: bulb.maxVoltage,
      minI: bulb.minCurrent, maxI: bulb.maxCurrent,
    };
  }

  function validateCircuit(puzzle, voltage, rStates) {
    const ct = puzzle.circuitType;
    if (ct === 'series') return validateSeries(puzzle, voltage, rStates);
    if (ct === 'parallel') return validateParallel(puzzle, voltage, rStates);
    if (ct === 'series-parallel') return validateSeriesParallel(puzzle, voltage, rStates);
    return { allInRange: false, details: [] };
  }

  function validateSeries(puzzle, voltage, rStates) {
    let rTotal = 0;
    puzzle.resistorSlots.forEach(rs => { if (rStates[rs.id]) rTotal += rs.ohms; });
    puzzle.bulbs.forEach(b => { rTotal += b.resistance; });

    const current = voltage / rTotal;
    const details = puzzle.bulbs.map((b, i) => {
      const vBulb = current * b.resistance;
      const chk = checkBulb(current, vBulb, b);
      return { name: puzzle.bulbs.length > 1 ? `Bulb ${i+1}` : 'Bulb', ...chk };
    });
    return { allInRange: details.every(d => d.inRange), details };
  }

  function validateParallel(puzzle, voltage, rStates) {
    const details = puzzle.branches.map((branch, i) => {
      let rBranch = branch.bulb.resistance;
      branch.resistorSlots.forEach(rs => { if (rStates[rs.id]) rBranch += rs.ohms; });
      const current = voltage / rBranch;
      const vBulb = current * branch.bulb.resistance;
      const chk = checkBulb(current, vBulb, branch.bulb);
      return { name: `Bulb ${i+1}`, ...chk };
    });
    return { allInRange: details.every(d => d.inRange), details };
  }

  function validateSeriesParallel(puzzle, voltage, rStates) {
    let rSeries = 0;
    if (puzzle.seriesResistorSlots) {
      puzzle.seriesResistorSlots.forEach(rs => { if (rStates[rs.id]) rSeries += rs.ohms; });
    }

    const branchR = puzzle.branches.map(branch => {
      let r = branch.bulb.resistance;
      if (branch.resistorSlots) branch.resistorSlots.forEach(rs => { if (rStates[rs.id]) r += rs.ohms; });
      return r;
    });

    const rParallel = 1 / branchR.reduce((sum, r) => sum + 1/r, 0);
    const rTotal = rSeries + rParallel;
    const iTotal = voltage / rTotal;
    const vParallel = iTotal * rParallel;

    const details = puzzle.branches.map((branch, i) => {
      const iBranch = vParallel / branchR[i];
      const vBulb = iBranch * branch.bulb.resistance;
      const chk = checkBulb(iBranch, vBulb, branch.bulb);
      return { name: `Bulb ${i+1}`, ...chk };
    });
    return { allInRange: details.every(d => d.inRange), details };
  }

  // ═══════════════════════════════════════════
  //  COMPLETION
  // ═══════════════════════════════════════════
  function puzzleSolved() {
    solved = true;
    clearInterval(timerInterval);
    const timeUsed = currentPuzzle.timeLimit - timeRemaining;
    const score = calcScore();
    scores.push({ puzzleId: currentPuzzle.id, title: currentPuzzle.title, solved: true, timeUsed, score });

    if (currentPuzzle.type === 'build') {
      const fb = el('feedback');
      fb.className = 'feedback correct';
      fb.innerHTML = `✅ Correct! Solved in ${formatTime(timeUsed)} — <strong>${score} pts</strong>`;
    }

    el('btn-check').disabled = true;
    el('btn-next').classList.remove('hidden');
    el('btn-next').textContent = currentPuzzleIndex < totalPuzzles - 1 ? 'Next Puzzle →' : 'View Results →';
  }

  function calcScore() { return Math.round((timeRemaining / currentPuzzle.timeLimit) * 1000); }

  function timeUp() {
    if (solved) return;
    solved = true;
    scores.push({ puzzleId: currentPuzzle.id, title: currentPuzzle.title, solved: false, timeUsed: currentPuzzle.timeLimit, score: 0 });

    const fb = el('feedback');
    fb.className = 'feedback wrong';

    if (currentPuzzle.type === 'build') {
      fb.innerHTML = `⏰ Time's up! Answer: <strong>${currentPuzzle.slots.map(s => s.correctAnswer).join(', ')}</strong>`;
      currentPuzzle.slots.forEach(s => { slotStates[s.id] = s.correctAnswer; });
      drawCircuit(currentPuzzle);
    } else {
      fb.innerHTML = `⏰ Time's up! Use Ohm's Law (I = V/R, V = IR) to find the combination where both voltage and current fall within the target range.`;
    }

    el('btn-check').disabled = true;
    el('btn-next').classList.remove('hidden');
    el('btn-next').textContent = currentPuzzleIndex < totalPuzzles - 1 ? 'Next Puzzle →' : 'View Results →';
  }

  // ═══════════════════════════════════════════
  //  TIMER
  // ═══════════════════════════════════════════
  function startTimer(seconds) {
    clearInterval(timerInterval);
    timeRemaining = seconds;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      if (timeRemaining <= 0) { clearInterval(timerInterval); timeUp(); }
    }, 1000);
  }

  function updateTimerDisplay() {
    const d = el('timer');
    d.textContent = formatTime(timeRemaining);
    d.classList.remove('warning', 'critical');
    if (timeRemaining <= 30) d.classList.add('critical');
    else if (timeRemaining <= 60) d.classList.add('warning');
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function toggleHint() {
    hintShown = !hintShown;
    el('hint-box').classList.toggle('hidden');
    el('btn-hint').textContent = hintShown ? '💡 Hide Hint' : '💡 Hint';
  }

  function shakeElements(sel) {
    el('circuit-svg').querySelectorAll(sel).forEach(g => {
      g.classList.add('shake');
      setTimeout(() => g.classList.remove('shake'), 500);
    });
  }

  function formatTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

  // ═══════════════════════════════════════════
  //  RESULTS
  // ═══════════════════════════════════════════
  function showResults() {
    const totalScore = scores.reduce((s, x) => s + x.score, 0);
    const maxScore = totalPuzzles * 1000;
    const solvedCount = scores.filter(s => s.solved).length;
    const pct = Math.round((totalScore / maxScore) * 100);

    el('result-score').textContent = `${totalScore} / ${maxScore}`;
    el('result-solved').textContent = `${solvedCount} / ${totalPuzzles}`;
    el('result-pct').textContent = `${pct}%`;

    let grade = '';
    if (pct >= 90) grade = '⚡ Circuit Master!';
    else if (pct >= 70) grade = '🔋 Electrician in Training';
    else if (pct >= 50) grade = '💡 Getting the Hang of It';
    else if (pct >= 30) grade = '🔌 Keep Practicing!';
    else grade = '📚 Time to Review the Basics';
    el('result-grade').textContent = grade;

    const tbody = el('result-breakdown');
    tbody.innerHTML = '';
    scores.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.puzzleId}</td><td>${s.title}</td><td>${s.solved?'✅':'❌'}</td><td>${formatTime(s.timeUsed)}</td><td><strong>${s.score}</strong></td>`;
      tbody.appendChild(tr);
    });
    showScreen('results');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Game.init);
