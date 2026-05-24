// puzzles.js — 10 circuit puzzles
// 1–5: BUILD mode (place correct component)
// 6–10: SOLVE mode (toggle resistors + cycle voltage to hit target range)
//       Each solve puzzle has EXACTLY ONE valid combination.

const Puzzles = (() => {

  const all = [

    // ══════════════════════════════════════════════
    //  BUILD MODE — Puzzles 1–5
    // ══════════════════════════════════════════════

    {
      id: 1, type: 'build',
      title: "First Light", category: "Series",
      description: "Place a component to complete the circuit and produce light.",
      hint: "What component emits light when current flows through it?",
      timeLimit: 180,
      wires: [
        { x1: 120, y1: 80, x2: 580, y2: 80 },
        { x1: 580, y1: 80, x2: 580, y2: 320 },
        { x1: 580, y1: 320, x2: 120, y2: 320 },
        { x1: 120, y1: 320, x2: 120, y2: 80 },
      ],
      fixed: [{ type: 'battery', cx: 120, cy: 200, orientation: 'v' }],
      slots: [{ id: 's1', cx: 580, cy: 200, orientation: 'v', correctAnswer: 'bulb' }],
    },

    {
      id: 2, type: 'build',
      title: "Resistance Training", category: "Series",
      description: "The bulb is burning too bright! Add a component to limit the current.",
      hint: "Which component opposes the flow of electric current?",
      timeLimit: 180,
      wires: [
        { x1: 120, y1: 80, x2: 580, y2: 80 },
        { x1: 580, y1: 80, x2: 580, y2: 320 },
        { x1: 580, y1: 320, x2: 120, y2: 320 },
        { x1: 120, y1: 320, x2: 120, y2: 80 },
      ],
      fixed: [
        { type: 'battery', cx: 120, cy: 200, orientation: 'v' },
        { type: 'bulb', cx: 580, cy: 200, orientation: 'v' },
      ],
      slots: [{ id: 's1', cx: 350, cy: 80, orientation: 'h', correctAnswer: 'resistor' }],
    },

    {
      id: 3, type: 'build',
      title: "Switch It Up", category: "Series",
      description: "The circuit works, but we need a way to turn it on and off!",
      hint: "Which component can open or close a circuit?",
      timeLimit: 180,
      wires: [
        { x1: 120, y1: 80, x2: 580, y2: 80 },
        { x1: 580, y1: 80, x2: 580, y2: 320 },
        { x1: 580, y1: 320, x2: 120, y2: 320 },
        { x1: 120, y1: 320, x2: 120, y2: 80 },
      ],
      fixed: [
        { type: 'battery', cx: 120, cy: 200, orientation: 'v' },
        { type: 'resistor', cx: 350, cy: 320, orientation: 'h' },
        { type: 'bulb', cx: 580, cy: 200, orientation: 'v' },
      ],
      slots: [{ id: 's1', cx: 350, cy: 80, orientation: 'h', correctAnswer: 'switch' }],
    },

    {
      id: 4, type: 'build',
      title: "Series Assembly", category: "Series",
      description: "Build a complete series circuit! Place a switch, a resistor, and a bulb.",
      hint: "A switch controls flow, a resistor limits it, and a bulb uses it.",
      timeLimit: 180,
      wires: [
        { x1: 120, y1: 80, x2: 580, y2: 80 },
        { x1: 580, y1: 80, x2: 580, y2: 320 },
        { x1: 580, y1: 320, x2: 120, y2: 320 },
        { x1: 120, y1: 320, x2: 120, y2: 80 },
      ],
      fixed: [{ type: 'battery', cx: 120, cy: 200, orientation: 'v' }],
      slots: [
        { id: 's1', cx: 260, cy: 80, orientation: 'h', correctAnswer: 'switch' },
        { id: 's2', cx: 460, cy: 80, orientation: 'h', correctAnswer: 'resistor' },
        { id: 's3', cx: 580, cy: 200, orientation: 'v', correctAnswer: 'bulb' },
      ],
    },

    {
      id: 5, type: 'build',
      title: "Branch Out", category: "Parallel",
      description: "Place bulbs in both parallel branches so they light independently.",
      hint: "In a parallel circuit, each branch gets the same voltage.",
      timeLimit: 180,
      wires: [
        { x1: 100, y1: 200, x2: 100, y2: 80 },
        { x1: 100, y1: 80, x2: 250, y2: 80 },
        { x1: 250, y1: 80, x2: 500, y2: 80 },
        { x1: 250, y1: 80, x2: 250, y2: 280 },
        { x1: 250, y1: 280, x2: 500, y2: 280 },
        { x1: 500, y1: 80, x2: 500, y2: 280 },
        { x1: 100, y1: 200, x2: 100, y2: 320 },
        { x1: 100, y1: 320, x2: 600, y2: 320 },
        { x1: 600, y1: 320, x2: 600, y2: 80 },
        { x1: 600, y1: 80, x2: 500, y2: 80 },
      ],
      junctions: [
        { x: 250, y: 80 }, { x: 500, y: 80 },
        { x: 500, y: 280 }, { x: 250, y: 280 },
      ],
      fixed: [{ type: 'battery', cx: 100, cy: 200, orientation: 'v' }],
      slots: [
        { id: 's1', cx: 375, cy: 80, orientation: 'h', correctAnswer: 'bulb' },
        { id: 's2', cx: 375, cy: 280, orientation: 'h', correctAnswer: 'bulb' },
      ],
    },


    // ══════════════════════════════════════════════════════
    //  SOLVE MODE — Puzzles 6–10
    //  Each has EXACTLY ONE valid combination.
    //  Bulbs have a TARGET RANGE for both V and I.
    //  Too low = won't work.  Too high = burns out.
    // ══════════════════════════════════════════════════════


    // ── PUZZLE 6: Safe Glow (Series) ─────────────────────
    // Bulb: R=10Ω, target 4V–5V, 0.4A–0.5A
    // Battery options: 6V, 9V, 18V, 24V
    // Resistor slots: 2 × 10Ω
    // ✅ UNIQUE ANSWER: 9V + 1 resistor
    //    R_total=20Ω, I=0.45A, V_bulb=4.5V
    {
      id: 6, type: 'solve',
      title: "Safe Glow", category: "Series",
      description: "Pick the right battery voltage and add resistors so the bulb operates within its target range. There is only ONE correct combination!",
      hint: "I = V_source ÷ R_total.  V_bulb = I × R_bulb.  Both V and I must land inside the target range.",
      timeLimit: 180,
      circuitType: 'series',
      wires: [
        { x1: 120, y1: 100, x2: 580, y2: 100 },
        { x1: 580, y1: 100, x2: 580, y2: 300 },
        { x1: 580, y1: 300, x2: 120, y2: 300 },
        { x1: 120, y1: 300, x2: 120, y2: 100 },
      ],
      battery: {
        cx: 120, cy: 200, orientation: 'v',
        voltages: [6, 9, 18, 24],
      },
      resistorSlots: [
        { id: 'r1', cx: 280, cy: 100, orientation: 'h', ohms: 10 },
        { id: 'r2', cx: 450, cy: 100, orientation: 'h', ohms: 10 },
      ],
      bulbs: [
        { id: 'b1', cx: 580, cy: 200, orientation: 'v',
          resistance: 10, minVoltage: 4, maxVoltage: 5, minCurrent: 0.4, maxCurrent: 0.5 },
      ],
    },


    // ── PUZZLE 7: Voltage Drop (Series) ──────────────────
    // Bulb: R=20Ω, target 5.5V–6.5V, 0.27A–0.33A
    // Battery options: 8V, 12V, 18V, 24V
    // Resistor slots: 3 × 10Ω
    // ✅ UNIQUE ANSWER: 12V + 2 resistors
    //    R_total=40Ω, I=0.3A, V_bulb=6V
    {
      id: 7, type: 'solve',
      title: "Voltage Drop", category: "Series",
      description: "This bulb needs a precise voltage. Calculate carefully — only one combination works!",
      hint: "Each 10Ω resistor drops some voltage. With n resistors: R_total = (n×10) + 20. Then use I = V ÷ R_total.",
      timeLimit: 180,
      circuitType: 'series',
      wires: [
        { x1: 100, y1: 80, x2: 620, y2: 80 },
        { x1: 620, y1: 80, x2: 620, y2: 320 },
        { x1: 620, y1: 320, x2: 100, y2: 320 },
        { x1: 100, y1: 320, x2: 100, y2: 80 },
      ],
      battery: {
        cx: 100, cy: 200, orientation: 'v',
        voltages: [8, 12, 18, 24],
      },
      resistorSlots: [
        { id: 'r1', cx: 210, cy: 80, orientation: 'h', ohms: 10 },
        { id: 'r2', cx: 370, cy: 80, orientation: 'h', ohms: 10 },
        { id: 'r3', cx: 530, cy: 80, orientation: 'h', ohms: 10 },
      ],
      bulbs: [
        { id: 'b1', cx: 620, cy: 200, orientation: 'v',
          resistance: 20, minVoltage: 5.5, maxVoltage: 6.5, minCurrent: 0.27, maxCurrent: 0.33 },
      ],
    },


    // ── PUZZLE 8: Parallel Protection (Parallel – different bulbs) ──
    // Branch 1 bulb: R=10Ω, target 3V–3.5V, 0.3A–0.35A
    // Branch 2 bulb: R=20Ω, target 5V–6V, 0.25A–0.3A
    // Battery: 4V, 6V, 10V, 15V
    // Each branch: 1 × 10Ω resistor slot
    // ✅ UNIQUE ANSWER: 6V, Branch 1 gets 1R, Branch 2 gets 0R
    //    B1: R_br=20, I=0.3A, V_b=3V  |  B2: R_br=20, I=0.3A, V_b=6V
    {
      id: 8, type: 'solve',
      title: "Parallel Protection", category: "Parallel",
      description: "Two different bulbs share the same battery. Each branch sees the full voltage! Only one setup keeps BOTH safe.",
      hint: "In parallel, V_branch = V_battery. For each branch: I = V ÷ (R_resistor + R_bulb). V_bulb = I × R_bulb.",
      timeLimit: 180,
      circuitType: 'parallel',
      wires: [
        { x1: 100, y1: 200, x2: 100, y2: 80 },
        { x1: 100, y1: 80, x2: 220, y2: 80 },
        { x1: 220, y1: 80, x2: 530, y2: 80 },
        { x1: 220, y1: 80, x2: 220, y2: 280 },
        { x1: 220, y1: 280, x2: 530, y2: 280 },
        { x1: 530, y1: 80, x2: 530, y2: 280 },
        { x1: 530, y1: 80, x2: 600, y2: 80 },
        { x1: 600, y1: 80, x2: 600, y2: 320 },
        { x1: 600, y1: 320, x2: 100, y2: 320 },
        { x1: 100, y1: 320, x2: 100, y2: 200 },
      ],
      junctions: [
        { x: 220, y: 80 }, { x: 530, y: 80 },
        { x: 530, y: 280 }, { x: 220, y: 280 },
      ],
      battery: {
        cx: 100, cy: 200, orientation: 'v',
        voltages: [4, 6, 10, 15],
      },
      branches: [
        {
          resistorSlots: [
            { id: 'r1', cx: 320, cy: 80, orientation: 'h', ohms: 10 },
          ],
          bulb: { id: 'b1', cx: 460, cy: 80, orientation: 'h',
                  resistance: 10, minVoltage: 3, maxVoltage: 3.5, minCurrent: 0.3, maxCurrent: 0.35 },
        },
        {
          resistorSlots: [
            { id: 'r2', cx: 320, cy: 280, orientation: 'h', ohms: 10 },
          ],
          bulb: { id: 'b2', cx: 460, cy: 280, orientation: 'h',
                  resistance: 20, minVoltage: 5, maxVoltage: 6, minCurrent: 0.25, maxCurrent: 0.3 },
        },
      ],
    },


    // ── PUZZLE 9: Uneven Load (Parallel – tighter) ───────
    // Branch 1 bulb: R=15Ω, target 4V–4.5V, 0.26A–0.3A
    // Branch 2 bulb: R=30Ω, target 5V–6V, 0.17A–0.2A
    // Battery: 5V, 8V, 12V, 16V
    // Each branch: 1 × 15Ω resistor slot
    // ✅ UNIQUE ANSWER: 8V, both branches get 1R
    //    B1: R_br=30, I=0.267A, V_b=4V  |  B2: R_br=45, I=0.178A, V_b=5.33V
    {
      id: 9, type: 'solve',
      title: "Uneven Load", category: "Parallel",
      description: "Two bulbs with very different specs. Find the ONE battery + resistor combo that satisfies both at once!",
      hint: "Try each battery option. For each, calculate I and V_bulb for both branches (with and without R). Only one combo fits both targets.",
      timeLimit: 180,
      circuitType: 'parallel',
      wires: [
        { x1: 100, y1: 200, x2: 100, y2: 80 },
        { x1: 100, y1: 80, x2: 220, y2: 80 },
        { x1: 220, y1: 80, x2: 530, y2: 80 },
        { x1: 220, y1: 80, x2: 220, y2: 280 },
        { x1: 220, y1: 280, x2: 530, y2: 280 },
        { x1: 530, y1: 80, x2: 530, y2: 280 },
        { x1: 530, y1: 80, x2: 600, y2: 80 },
        { x1: 600, y1: 80, x2: 600, y2: 320 },
        { x1: 600, y1: 320, x2: 100, y2: 320 },
        { x1: 100, y1: 320, x2: 100, y2: 200 },
      ],
      junctions: [
        { x: 220, y: 80 }, { x: 530, y: 80 },
        { x: 530, y: 280 }, { x: 220, y: 280 },
      ],
      battery: {
        cx: 100, cy: 200, orientation: 'v',
        voltages: [5, 8, 12, 16],
      },
      branches: [
        {
          resistorSlots: [
            { id: 'r1', cx: 320, cy: 80, orientation: 'h', ohms: 15 },
          ],
          bulb: { id: 'b1', cx: 460, cy: 80, orientation: 'h',
                  resistance: 15, minVoltage: 4, maxVoltage: 4.5, minCurrent: 0.26, maxCurrent: 0.3 },
        },
        {
          resistorSlots: [
            { id: 'r2', cx: 320, cy: 280, orientation: 'h', ohms: 15 },
          ],
          bulb: { id: 'b2', cx: 460, cy: 280, orientation: 'h',
                  resistance: 30, minVoltage: 5, maxVoltage: 6, minCurrent: 0.17, maxCurrent: 0.2 },
        },
      ],
    },


    // ── PUZZLE 10: Master Engineer (Series-Parallel) ─────
    // 2 series R-slots (10Ω each) → 2 parallel bulbs (R=20Ω each)
    // Bulbs target: 3.5V–5V, 0.18A–0.25A
    // Battery: 6V, 12V, 18V, 24V
    // ✅ UNIQUE ANSWER: 12V + 2 series resistors
    //    R_par=10Ω, R_total=30Ω, I_total=0.4A,
    //    V_par=4V, I_branch=0.2A, V_bulb=4V
    {
      id: 10, type: 'solve',
      title: "Master Engineer", category: "Combo",
      description: "The final challenge! Series resistors feed into parallel bulbs. Find the ONE setup that hits the target for both bulbs.",
      hint: "R_parallel = (R₁×R₂)/(R₁+R₂) for identical branches. R_total = R_series + R_parallel. Voltage divides proportionally between series and parallel sections.",
      timeLimit: 180,
      circuitType: 'series-parallel',
      wires: [
        { x1: 80, y1: 320, x2: 80, y2: 60 },
        { x1: 80, y1: 60, x2: 350, y2: 60 },
        { x1: 350, y1: 60, x2: 350, y2: 130 },
        { x1: 350, y1: 130, x2: 570, y2: 130 },
        { x1: 350, y1: 130, x2: 350, y2: 260 },
        { x1: 350, y1: 260, x2: 570, y2: 260 },
        { x1: 570, y1: 130, x2: 570, y2: 260 },
        { x1: 570, y1: 260, x2: 620, y2: 260 },
        { x1: 620, y1: 260, x2: 620, y2: 320 },
        { x1: 620, y1: 320, x2: 80, y2: 320 },
      ],
      junctions: [
        { x: 350, y: 130 }, { x: 570, y: 130 },
        { x: 570, y: 260 }, { x: 350, y: 260 },
      ],
      battery: {
        cx: 350, cy: 320, orientation: 'h',
        voltages: [6, 12, 18, 24],
      },
      seriesResistorSlots: [
        { id: 'rs1', cx: 160, cy: 60, orientation: 'h', ohms: 10 },
        { id: 'rs2', cx: 290, cy: 60, orientation: 'h', ohms: 10 },
      ],
      branches: [
        {
          resistorSlots: [],
          bulb: { id: 'b1', cx: 460, cy: 130, orientation: 'h',
                  resistance: 20, minVoltage: 3.5, maxVoltage: 5, minCurrent: 0.18, maxCurrent: 0.25 },
        },
        {
          resistorSlots: [],
          bulb: { id: 'b2', cx: 460, cy: 260, orientation: 'h',
                  resistance: 20, minVoltage: 3.5, maxVoltage: 5, minCurrent: 0.18, maxCurrent: 0.25 },
        },
      ],
    },

  ];

  function getPuzzle(id) { return all.find(p => p.id === id); }
  function getAll() { return all; }
  return { getPuzzle, getAll };
})();
