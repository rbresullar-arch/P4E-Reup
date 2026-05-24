// components.js — SVG drawing functions for circuit elements

const Components = (() => {
  const TYPES = ['empty', 'resistor', 'switch', 'battery', 'bulb'];

  const COLORS = {
    wire: '#c8e6c9',
    resistor: '#ff8a65',
    switch: '#ffeb3b',
    battery: '#66bb6a',
    bulb: '#fff176',
    bulbGlow: '#fff9c4',
    slot: '#455a64',
    correct: '#66bb6a',
    wrong: '#ef5350',
    text: '#eceff1',
    accent: '#4fc3f7',
    target: '#ce93d8',
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // ─── SVG Helpers ───
  function createLine(x1, y1, x2, y2, stroke, width) {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', stroke);
    l.setAttribute('stroke-width', width);
    l.setAttribute('stroke-linecap', 'round');
    return l;
  }

  function createRect(x, y, w, h, fill, rx) {
    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y);
    r.setAttribute('width', w); r.setAttribute('height', h);
    r.setAttribute('fill', fill); r.setAttribute('rx', rx || 0);
    return r;
  }

  function createCircleFill(cx, cy, r, fill) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy);
    c.setAttribute('r', r); c.setAttribute('fill', fill);
    return c;
  }

  function createText(x, y, text, size, fill) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('font-size', size);
    t.setAttribute('font-family', "'JetBrains Mono', monospace");
    t.setAttribute('fill', fill);
    t.setAttribute('font-weight', '600');
    t.textContent = text;
    return t;
  }

  // ─── Components ───

  function drawResistor(parent, cx, cy, orientation = 'h', opts = {}) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'comp-resistor');
    const w = 56, h = 22;
    if (orientation === 'h') {
      g.appendChild(createLine(cx - w/2 - 14, cy, cx - w/2, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx + w/2, cy, cx + w/2 + 14, cy, COLORS.wire, 2.5));
      g.appendChild(createRect(cx - w/2, cy - h/2, w, h, COLORS.resistor, 3));
      g.appendChild(createText(cx, cy + 1, opts.ohms ? `${opts.ohms}Ω` : (opts.label || 'R'), 11, '#fff'));
    } else {
      g.appendChild(createLine(cx, cy - h/2 - 14, cx, cy - h/2, COLORS.wire, 2.5));
      g.appendChild(createLine(cx, cy + h/2, cx, cy + h/2 + 14, COLORS.wire, 2.5));
      g.appendChild(createRect(cx - h/2, cy - w/2, h, w, COLORS.resistor, 3));
      g.appendChild(createText(cx, cy + 1, opts.ohms ? `${opts.ohms}Ω` : (opts.label || 'R'), 11, '#fff'));
    }
    parent.appendChild(g);
    return g;
  }

  function drawSwitch(parent, cx, cy, orientation = 'h', opts = {}) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'comp-switch');
    if (orientation === 'h') {
      g.appendChild(createLine(cx - 40, cy, cx - 14, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx + 14, cy, cx + 40, cy, COLORS.wire, 2.5));
      g.appendChild(createCircleFill(cx - 14, cy, 4, COLORS.switch));
      g.appendChild(createCircleFill(cx + 14, cy, 4, COLORS.switch));
      g.appendChild(createLine(cx - 14, cy, cx + 10, cy - 18, COLORS.switch, 3));
    } else {
      g.appendChild(createLine(cx, cy - 40, cx, cy - 14, COLORS.wire, 2.5));
      g.appendChild(createLine(cx, cy + 14, cx, cy + 40, COLORS.wire, 2.5));
      g.appendChild(createCircleFill(cx, cy - 14, 4, COLORS.switch));
      g.appendChild(createCircleFill(cx, cy + 14, 4, COLORS.switch));
      g.appendChild(createLine(cx, cy - 14, cx + 18, cy + 10, COLORS.switch, 3));
    }
    parent.appendChild(g);
    return g;
  }

  function drawBattery(parent, cx, cy, orientation = 'h', opts = {}) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'comp-battery');
    if (orientation === 'h') {
      g.appendChild(createLine(cx - 36, cy, cx - 8, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx + 8, cy, cx + 36, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx - 8, cy - 16, cx - 8, cy + 16, COLORS.battery, 3.5));
      g.appendChild(createLine(cx + 8, cy - 9, cx + 8, cy + 9, COLORS.battery, 5));
      g.appendChild(createText(cx - 16, cy - 18, '+', 11, COLORS.battery));
      g.appendChild(createText(cx + 16, cy - 14, '−', 11, COLORS.battery));
      if (opts.voltage != null) g.appendChild(createText(cx, cy + 26, `${opts.voltage}V`, 13, COLORS.battery));
    } else {
      g.appendChild(createLine(cx, cy - 36, cx, cy - 8, COLORS.wire, 2.5));
      g.appendChild(createLine(cx, cy + 8, cx, cy + 36, COLORS.wire, 2.5));
      g.appendChild(createLine(cx - 16, cy - 8, cx + 16, cy - 8, COLORS.battery, 3.5));
      g.appendChild(createLine(cx - 9, cy + 8, cx + 9, cy + 8, COLORS.battery, 5));
      g.appendChild(createText(cx + 20, cy - 8, '+', 11, COLORS.battery));
      g.appendChild(createText(cx + 18, cy + 14, '−', 11, COLORS.battery));
      if (opts.voltage != null) g.appendChild(createText(cx - 30, cy, `${opts.voltage}V`, 13, COLORS.battery));
    }
    if (opts.clickable) {
      const ly = orientation === 'h' ? cy + 40 : cy + 50;
      g.appendChild(createText(cx, ly, '⟳ click to change', 8, COLORS.accent));
      g.style.cursor = 'pointer';
    }
    parent.appendChild(g);
    return g;
  }

  function drawBulb(parent, cx, cy, orientation = 'h', opts = {}) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'comp-bulb');
    const r = 14;
    if (orientation === 'h') {
      g.appendChild(createLine(cx - r - 20, cy, cx - r, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx + r, cy, cx + r + 20, cy, COLORS.wire, 2.5));
    } else {
      g.appendChild(createLine(cx, cy - r - 20, cx, cy - r, COLORS.wire, 2.5));
      g.appendChild(createLine(cx, cy + r, cx, cy + r + 20, COLORS.wire, 2.5));
    }
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', opts.lit ? COLORS.bulbGlow : 'none');
    circle.setAttribute('stroke', COLORS.bulb);
    circle.setAttribute('stroke-width', '2.5');
    g.appendChild(circle);
    g.appendChild(createLine(cx - 8, cy - 8, cx + 8, cy + 8, COLORS.bulb, 1.8));
    g.appendChild(createLine(cx + 8, cy - 8, cx - 8, cy + 8, COLORS.bulb, 1.8));

    // Show target ranges for solve mode
    if (opts.ratings) {
      const rt = opts.ratings;
      const below = orientation === 'h';
      const lx = below ? cx : cx + 38;
      const ly = below ? cy + 26 : cy - 14;
      g.appendChild(createText(lx, ly, `R = ${rt.resistance}Ω`, 9, '#90a4ae'));
      g.appendChild(createText(lx, ly + 13, `V: ${rt.minVoltage}–${rt.maxVoltage}V`, 8, COLORS.target));
      g.appendChild(createText(lx, ly + 24, `I: ${rt.minCurrent}–${rt.maxCurrent}A`, 8, COLORS.target));
    }
    parent.appendChild(g);
    return g;
  }

  function drawSlot(parent, cx, cy, orientation = 'h', opts = {}) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'comp-slot');
    g.style.cursor = 'pointer';
    const w = orientation === 'h' ? 64 : 28;
    const h = orientation === 'h' ? 28 : 64;
    if (orientation === 'h') {
      g.appendChild(createLine(cx - w/2 - 14, cy, cx - w/2, cy, COLORS.wire, 2.5));
      g.appendChild(createLine(cx + w/2, cy, cx + w/2 + 14, cy, COLORS.wire, 2.5));
    } else {
      g.appendChild(createLine(cx, cy - h/2 - 14, cx, cy - h/2, COLORS.wire, 2.5));
      g.appendChild(createLine(cx, cy + h/2, cx, cy + h/2 + 14, COLORS.wire, 2.5));
    }
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', cx - w/2); rect.setAttribute('y', cy - h/2);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('fill', 'rgba(69, 90, 100, 0.3)');
    rect.setAttribute('stroke', opts.highlight ? COLORS.correct : COLORS.slot);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '6 4');
    rect.setAttribute('rx', '4');
    g.appendChild(rect);
    g.appendChild(createText(cx, cy + 1, opts.slotLabel || '?', opts.slotLabel ? 10 : 16, COLORS.slot));
    parent.appendChild(g);
    return g;
  }

  function drawResistorToggle(parent, cx, cy, orientation, ohms, placed) {
    if (placed) {
      return drawResistor(parent, cx, cy, orientation, { ohms });
    } else {
      return drawSlot(parent, cx, cy, orientation, { slotLabel: `${ohms}Ω?` });
    }
  }

  function draw(parent, type, cx, cy, orientation = 'h', opts = {}) {
    switch (type) {
      case 'resistor': return drawResistor(parent, cx, cy, orientation, opts);
      case 'switch': return drawSwitch(parent, cx, cy, orientation, opts);
      case 'battery': return drawBattery(parent, cx, cy, orientation, opts);
      case 'bulb': return drawBulb(parent, cx, cy, orientation, opts);
      case 'empty':
      default: return drawSlot(parent, cx, cy, orientation, opts);
    }
  }

  return {
    TYPES, COLORS, SVG_NS,
    draw, drawResistor, drawSwitch, drawBattery, drawBulb, drawSlot, drawResistorToggle,
    createLine, createText, createRect, createCircleFill
  };
})();
