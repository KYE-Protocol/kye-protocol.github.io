/* Scroll-to-top button with progress ring.
 * Fades in once the user is past 30% of the viewport height.
 * The ring fills as a function of (scrollY / scrollMax). Click → smooth top.
 */

export function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  const ring = document.getElementById("scroll-top-progress");
  if (!btn || !ring) return;
  const RING_LEN = 138.23; // 2 * π * 22

  function update() {
    const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    const y = window.scrollY;
    const pct = Math.max(0, Math.min(1, y / max));
    ring.setAttribute("stroke-dashoffset", String(RING_LEN * (1 - pct)));
    const visible = y > Math.min(360, window.innerHeight * 0.4);
    btn.classList.toggle("is-visible", visible);
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; update(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}
