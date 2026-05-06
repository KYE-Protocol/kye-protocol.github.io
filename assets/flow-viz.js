/**
 * KYE Protocol™ — flow visualisation.
 *
 * Renders an interactive SVG sequence diagram with actor lanes,
 * lifelines, animated arrows between actors, a moving payload pill
 * for amounts/tokens, and a branch state pill (allow / deny /
 * require_approval / revoke / evidence) for each step.
 *
 * Mounts on any element with [data-flow-viz="<key>"]. The key picks
 * a flow definition from the FLOWS dictionary below. Controls:
 *   ▶ Play / ⏸ Pause / ⟲ Reset
 *   keyboard:  ← →   step manually
 *   keyboard:  Space pause/resume
 *   keyboard:  Esc   reset
 *   speed:     1× / 2× / 4× toggle
 *   loop:      checkbox
 *   auto-play: IntersectionObserver triggers play() once on first
 *              scroll into viewport (suppressed if reduced-motion).
 */

const ACTOR_DEFAULTS = {
  customer:     { label: "Customer",       color: "#1A8754", icon: "person" },
  holder:       { label: "Account holder", color: "#1A8754", icon: "person" },
  tpp:          { label: "TPP",            color: "#1A73E8", icon: "business" },
  agent:        { label: "AI agent",       color: "#8E24AA", icon: "smart_toy" },
  kye:          { label: "KYE™",           color: "#00ACC1", icon: "verified" },
  bank:         { label: "Bank",           color: "#B47200", icon: "account_balance" },
  aspsp:        { label: "ASPSP",          color: "#B47200", icon: "account_balance" },
  merchant:     { label: "Merchant",       color: "#5F6368", icon: "shopping_cart" },
};

const FLOWS = {
  "open-banking": {
    title: "PISP / TPP flow — account holder → TPP → AI agent → ASPSP",
    actors: ["holder", "tpp", "agent", "aspsp"],
    steps: [
      { from: "holder", to: "tpp",   label: "delegation",         detail: "≤ €1,000 single / ≤ €10,000 monthly · EUR + SEPA only · SCA at the human edge",                       branch: "ok",       payload: "consent" },
      { from: "tpp",    to: "agent", label: "sub-delegation",     detail: "attenuated: EUR only · EU corridors · prepare-and-stage · approval > €500",                          branch: "ok",       payload: "scope" },
      { from: "agent",  to: "aspsp", label: "€420 payment intent",detail: "agent → TPP → holder chain attached; every link signed; ePDP walks the chain at the bank edge",        branch: "ok",       payload: "€420" },
      { from: "aspsp",  to: "agent", label: "allow_with_constraints", detail: "ASPSP verifies the chain offline using public keys; constraint: emit SCA proof + audit-chain entry", branch: "allow",    payload: "✓" },
      { from: "holder", to: "tpp",   label: "revoke at T+30 days", detail: "cascade kills every authority + every downstream agent grant in <1s; next agent call → deny",         branch: "revoke",   payload: "✗" },
      { from: "aspsp",  to: "kye",   label: "60d later · Evidence Pack", detail: "complainant disputes the €420; bank pulls the Evidence Pack; regulator verifies offline using public keys", branch: "evidence", payload: "📜" },
    ],
  },
  "agent-purchasing": {
    title: "Agent-backed card purchasing — runtime decision flow",
    actors: ["customer", "agent", "kye", "bank", "merchant"],
    steps: [
      { from: "agent",    to: "agent",    label: "1. prepare purchase", detail: "merchant + basket + amount + currency + delivery + tokenised card",       branch: "ok",       payload: "£99.99" },
      { from: "agent",    to: "kye",      label: "2. authorize",        detail: "POST /v1/runtime/authorize · signed purchase request · payload hash",      branch: "ok",       payload: "request" },
      { from: "kye",      to: "kye",      label: "3. resolve entities", detail: "customer + agent + card token + capability + scope all looked up",         branch: "ok",       payload: "URN×5" },
      { from: "kye",      to: "kye",      label: "4. evaluate policy",  detail: "state · delegation · authority · risk · merchant allowlist · amount cap",  branch: "ok",       payload: "policy" },
      { from: "kye",      to: "agent",    label: "5. decision",         detail: "allow_with_constraints / require_approval / deny + reason code",          branch: "allow",    payload: "✓" },
      { from: "agent",    to: "bank",     label: "6. issuer auth",      detail: "bank's normal card-issuer authorisation pipeline runs (independent of KYE™)", branch: "ok",       payload: "auth" },
      { from: "kye",      to: "merchant", label: "7. evidence pack",    detail: "Decision Map™ + signed Evidence Pack emitted to the audit chain",          branch: "evidence", payload: "📜" },
    ],
  },
};

const BRANCH_COLOR = {
  ok:       "#1A8754",
  allow:    "#1A8754",
  approve:  "#B47200",
  deny:     "#C5221F",
  revoke:   "#C5221F",
  evidence: "#00ACC1",
};

function actor(id) {
  return ACTOR_DEFAULTS[id] || { label: id, color: "#5F6368", icon: "circle" };
}

function svgEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderFlow(host, flow) {
  const W = host.clientWidth || 720;
  const N = flow.actors.length;
  const padX = 48;
  const laneSpan = (W - padX * 2) / Math.max(1, N - 1);
  const headY = 48, footY = 64 + flow.steps.length * 56, laneTop = 64;
  const H = footY + 24;

  const lanes = flow.actors.map((id, i) => ({
    ...actor(id),
    id,
    x: padX + i * laneSpan,
  }));

  const stepsSvg = flow.steps.map((s, i) => {
    const fromIdx = flow.actors.indexOf(s.from);
    const toIdx   = flow.actors.indexOf(s.to);
    const y = laneTop + 24 + i * 56;
    const x1 = lanes[fromIdx].x;
    const x2 = lanes[toIdx].x;
    const sameLane = fromIdx === toIdx;
    const branchColour = BRANCH_COLOR[s.branch] || "#1A8754";
    const dx = sameLane ? 30 : 0;
    const path = sameLane
      ? `M ${x1} ${y} q ${dx} 0 ${dx} 12 q 0 12 -${dx} 12`
      : `M ${x1} ${y} L ${x2} ${y}`;
    const labelX = sameLane ? x1 + dx + 8 : (x1 + x2) / 2;
    const labelAnchor = sameLane ? "start" : "middle";
    const arrowX = sameLane ? x1 : x2;
    const arrowY = sameLane ? y + 24 : y;
    const arrowDir = sameLane ? "down" : (x2 > x1 ? "right" : "left");
    const arrowPoints =
      arrowDir === "right" ? `${arrowX - 8},${arrowY - 4} ${arrowX},${arrowY} ${arrowX - 8},${arrowY + 4}` :
      arrowDir === "left"  ? `${arrowX + 8},${arrowY - 4} ${arrowX},${arrowY} ${arrowX + 8},${arrowY + 4}` :
                             `${arrowX - 4},${arrowY - 8} ${arrowX},${arrowY} ${arrowX + 4},${arrowY - 8}`;
    return `
      <g class="fv-step" data-step="${i}">
        <path class="fv-path" d="${path}" stroke="${branchColour}" stroke-width="2.4" fill="none" stroke-linecap="round" pathLength="100"/>
        <polyline class="fv-arrow" points="${arrowPoints}" stroke="${branchColour}" stroke-width="2.4" fill="${branchColour}" stroke-linecap="round" stroke-linejoin="round"/>
        <text class="fv-step-label" x="${labelX}" y="${y - 8}" text-anchor="${labelAnchor}" fill="${branchColour}">${svgEscape(s.label)}</text>
        ${s.payload ? `<g class="fv-payload" transform="translate(${x1} ${y})"><rect x="-26" y="-12" width="52" height="22" rx="11" fill="${branchColour}"/><text x="0" y="3" text-anchor="middle" fill="white" class="fv-payload-text">${svgEscape(s.payload)}</text></g>` : ""}
      </g>
    `;
  }).join("");

  const lanesSvg = lanes.map(l => `
    <g class="fv-lane">
      <line x1="${l.x}" y1="${headY}" x2="${l.x}" y2="${footY - 16}" stroke="${l.color}" stroke-width="1" stroke-dasharray="3 4" opacity="0.45"/>
      <circle cx="${l.x}" cy="${headY}" r="18" fill="${l.color}"/>
      <text x="${l.x}" y="${headY + 5}" text-anchor="middle" class="fv-actor-icon">${svgEscape(l.icon[0].toUpperCase())}</text>
      <text x="${l.x}" y="${headY + 38}" text-anchor="middle" class="fv-actor-label" fill="${l.color}">${svgEscape(l.label)}</text>
    </g>
  `).join("");

  host.innerHTML = `
    <div class="fv-controls">
      <button class="fv-btn fv-play" type="button" aria-label="Play flow"><span class="ms" aria-hidden="true">play_arrow</span><span class="fv-play-l">Play</span></button>
      <button class="fv-btn fv-reset" type="button" aria-label="Reset flow"><span class="ms" aria-hidden="true">replay</span></button>
      <div class="fv-speed" role="radiogroup" aria-label="Playback speed">
        <button class="fv-speed-btn is-on" data-speed="1" type="button" role="radio" aria-checked="true">1×</button>
        <button class="fv-speed-btn"        data-speed="2" type="button" role="radio" aria-checked="false">2×</button>
        <button class="fv-speed-btn"        data-speed="4" type="button" role="radio" aria-checked="false">4×</button>
      </div>
      <label class="fv-loop"><input type="checkbox" data-loop> <span>Loop</span></label>
      <span class="fv-progress" aria-live="polite">0 / ${flow.steps.length}</span>
    </div>
    <div class="fv-stage">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${svgEscape(flow.title)}">
        ${lanesSvg}
        ${stepsSvg}
      </svg>
    </div>
    <div class="fv-detail" aria-live="polite">
      <div class="fv-detail-num"></div>
      <div class="fv-detail-text">Press ▶ Play to walk through ${flow.steps.length} steps. ← → to step manually. Space to pause/resume.</div>
    </div>
  `;
  return { lanes, host, flow };
}

export function initFlowViz() {
  const hosts = document.querySelectorAll('[data-flow-viz]');
  if (!hosts.length) return;
  const reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  hosts.forEach(host => {
    const key = host.dataset.flowViz;
    const flow = FLOWS[key];
    if (!flow) return;

    const { } = renderFlow(host, flow);
    // Query EVERYTHING from the host element (not from the SVG) so SVG
    // namespace quirks of innerHTML-injected SVG content don't trip us
    // up. The .fv-step <g>s are still the same DOM nodes regardless of
    // which ancestor we walk down from.
    const stepNodes    = Array.from(host.querySelectorAll('.fv-step'));
    const playBtn      = host.querySelector('.fv-play');
    const playLabel    = host.querySelector('.fv-play-l');
    const playIcon     = playBtn && playBtn.querySelector('.ms');
    const resetBtn     = host.querySelector('.fv-reset');
    const speedBtns    = host.querySelectorAll('.fv-speed-btn');
    const loopCb       = host.querySelector('input[data-loop]');
    const progressEl   = host.querySelector('.fv-progress');
    const detailNum    = host.querySelector('.fv-detail-num');
    const detailText   = host.querySelector('.fv-detail-text');
    if (!playBtn || !stepNodes.length) {
      // Render didn't produce expected DOM — leave the host alone so
      // the <details> text fallback is still readable.
      return;
    }

    // Single recurring tick. Only ONE setTimeout is ever in flight, so
    // every control (play / pause / reset / speed / replay) just calls
    // clearTimeout(tickTimer) and mutates state — no array of stale
    // timers to track, no tangled scheduling.
    let tickTimer = null;
    let speed = 1;
    let cursor = -1;
    let state  = 'idle'; // 'idle' | 'playing' | 'paused' | 'done'

    // Hide all steps initially.
    stepNodes.forEach(n => n.classList.remove('is-on', 'is-done'));

    function stagger() {
      return reduced ? 60 : Math.max(220, 1600 / speed);
    }

    function setStep(i, opts = {}) {
      cursor = i;
      stepNodes.forEach((n, idx) => {
        n.classList.toggle('is-on',   idx === i);
        n.classList.toggle('is-done', idx <  i || (opts.markDone && idx === i));
      });
      progressEl.textContent = `${Math.max(0, i + 1)} / ${stepNodes.length}`;
      if (i >= 0 && i < flow.steps.length) {
        const s = flow.steps[i];
        detailNum.textContent  = `Step ${i + 1}`;
        detailText.textContent = s.detail || s.label;
      }
    }

    function tick() {
      if (state !== 'playing') return;
      // Mark the current step as done before advancing.
      if (cursor >= 0 && cursor < stepNodes.length) {
        stepNodes[cursor].classList.add('is-done');
      }
      const next = cursor + 1;
      if (next >= stepNodes.length) {
        // Finished the run.
        if (loopCb && loopCb.checked) {
          cursor = -1;
          stepNodes.forEach(n => n.classList.remove('is-on', 'is-done'));
          tickTimer = setTimeout(tick, stagger());
          return;
        }
        state = 'done';
        host.classList.remove('fv-playing');
        playLabel.textContent = 'Replay';
        playIcon.textContent  = 'replay';
        playBtn.setAttribute('aria-label', 'Replay flow');
        return;
      }
      setStep(next);
      tickTimer = setTimeout(tick, stagger());
    }

    function stop() {
      if (tickTimer) { clearTimeout(tickTimer); tickTimer = null; }
    }

    function reset() {
      stop();
      cursor = -1;
      stepNodes.forEach(n => n.classList.remove('is-on', 'is-done'));
      progressEl.textContent = `0 / ${stepNodes.length}`;
      detailNum.textContent  = '';
      detailText.textContent = `Press ▶ Play to walk through ${flow.steps.length} steps. ← → to step manually. Space to pause/resume.`;
      state = 'idle';
      host.classList.remove('fv-playing');
      playLabel.textContent = 'Play';
      playIcon.textContent  = 'play_arrow';
      playBtn.setAttribute('aria-label', 'Play flow');
    }

    function play() {
      stop();
      // From done → start fresh. From paused → resume from current cursor.
      if (state === 'done' || cursor >= stepNodes.length - 1) {
        cursor = -1;
        stepNodes.forEach(n => n.classList.remove('is-on', 'is-done'));
      }
      state = 'playing';
      host.classList.add('fv-playing');
      playLabel.textContent = 'Pause';
      playIcon.textContent  = 'pause';
      playBtn.setAttribute('aria-label', 'Pause flow');
      // Light up the next step IMMEDIATELY so the click is obviously
      // doing something, then schedule the recurring tick.
      const first = cursor + 1;
      if (first < stepNodes.length) setStep(first);
      tickTimer = setTimeout(tick, stagger());
    }

    function pause() {
      stop();
      state = 'paused';
      host.classList.remove('fv-playing');
      playLabel.textContent = 'Resume';
      playIcon.textContent  = 'play_arrow';
      playBtn.setAttribute('aria-label', 'Resume flow');
    }

    playBtn.addEventListener('click', () => {
      if (state === 'playing') pause();
      else play();
    });
    resetBtn.addEventListener('click', reset);

    speedBtns.forEach(b => {
      b.addEventListener('click', () => {
        speed = parseInt(b.dataset.speed, 10) || 1;
        speedBtns.forEach(x => {
          const on = x === b;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        // Always restart from the start at the new speed so the user
        // SEES the speed change immediately, regardless of prior state.
        stop();
        cursor = -1;
        stepNodes.forEach(n => n.classList.remove('is-on', 'is-done'));
        state = 'idle';
        play();
      });
    });

    // Keyboard navigation when the host or any descendant is focused.
    host.tabIndex = 0;
    host.addEventListener('keydown', e => {
      if (e.target.matches('input, button, select, textarea')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (state === 'playing') pause();
        const next = Math.min(stepNodes.length - 1, cursor + 1);
        setStep(next, { markDone: true });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state === 'playing') pause();
        const prev = Math.max(0, cursor - 1);
        setStep(prev);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (state === 'playing') pause(); else play();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        reset();
      }
    });

    // Auto-play removed — confused users when the animation finished
    // before they had read the controls. Pulse the play button briefly
    // when the host enters viewport so the user knows it's interactive.
    let pulsed = false;
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver(entries => {
        for (const en of entries) {
          if (en.isIntersecting && !pulsed) {
            pulsed = true;
            playBtn.classList.add('fv-pulse');
            setTimeout(() => playBtn.classList.remove('fv-pulse'), 2200);
          }
        }
      }, { threshold: 0.4 });
      io.observe(host);
    }

    // Re-render on resize (debounced) so the SVG fits new widths.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasState = state;
        const wasCursor = cursor;
        renderFlow(host, flow);
        // Re-bind: simplest is to re-init the entire viz; recursive call.
        // Avoid infinite loop by checking flag.
        if (!host.dataset.fvReinit) {
          host.dataset.fvReinit = '1';
          initFlowViz();
        }
      }, 200);
    }, { once: true });
  });
}
