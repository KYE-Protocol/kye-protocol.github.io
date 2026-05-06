/* Quickstart tabs + clipboard helpers + sticky Star CTA visibility. */

export function initQuickstart() {
  const tabs = document.querySelectorAll(".qs-tab");
  if (!tabs.length) return;
  const panes = ["ts", "py", "go", "curl"].map((k) => document.getElementById("qs-pane-" + k));
  function show(key) {
    tabs.forEach((b) => {
      const on = b.dataset.qs === key;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    panes.forEach((p) => {
      if (!p) return;
      const on = p.id === "qs-pane-" + key;
      p.hidden = !on;
    });
  }
  tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.qs)));

  document.querySelectorAll(".qs-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const wrap = btn.closest(".qs-pane-wrap");
      const pre = wrap?.querySelector("pre");
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.innerText);
        const orig = btn.textContent;
        btn.textContent = "✓ copied";
        setTimeout(() => (btn.textContent = orig), 1400);
      } catch {
        btn.textContent = "× failed";
      }
    });
  });
}

export function initStarCta() {
  const cta = document.getElementById("star-cta");
  if (!cta) return;
  // Hide the CTA whenever the footer is intersecting the viewport,
  // otherwise the fixed pill covers the footer link grid.
  const footer = document.querySelector("footer.footer, [data-kye-footer]");
  let footerVisible = false;
  if (footer && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      footerVisible = entries.some((e) => e.isIntersecting);
      apply();
    }, { rootMargin: "0px 0px -40px 0px" }).observe(footer);
  }
  let raf = 0;
  function apply() {
    cta.classList.toggle("is-visible", window.scrollY > 400 && !footerVisible);
  }
  function on() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; apply(); });
  }
  window.addEventListener("scroll", on, { passive: true });
  on();
}
