/* Animated counter for the hero stat strip. */

export function initHeroStats() {
  const cells = document.querySelectorAll("#hero-stats .stat-num");
  if (!cells.length) return;

  function animate(el, end, dur = 1400) {
    const unitMatch = el.querySelector(".unit");
    const unit = unitMatch ? unitMatch.outerHTML : "";
    const start = performance.now();
    function step(t) {
      const k = Math.min(1, (t - start) / dur);
      const v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.innerHTML = v.toLocaleString() + unit;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      cells.forEach((el) => animate(el, parseInt(el.dataset.end || "0", 10)));
      io.disconnect();
      return;
    }
  }, { threshold: 0.4 });
  io.observe(cells[0]);
}
