/**
 * KYE Protocol™ — clipboard helper.
 *
 * Activates every <button data-copy-target="#some-pre"> on the page.
 * On click: reads the textContent of the target element and writes
 * it to the clipboard, with a brief "Copied" affordance on the
 * triggering button. Falls back to document.execCommand on browsers
 * without the async clipboard API.
 *
 * Pattern in HTML:
 *   <pre id="snippet-foo" class="codeblock"><code>...</code></pre>
 *   <button class="copy-btn" data-copy-target="#snippet-foo">
 *     <span class="ms">content_copy</span> Copy
 *   </button>
 */

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { /* fall through */ }
  }
  // Fallback: temporary textarea + execCommand
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* ignore */ }
  document.body.removeChild(ta);
  return ok;
}

function flash(btn, text, ms = 1400) {
  const original = btn.dataset.copyOriginal || btn.innerHTML;
  if (!btn.dataset.copyOriginal) btn.dataset.copyOriginal = original;
  btn.innerHTML = `<span class="ms" aria-hidden="true">check</span> ${text}`;
  btn.classList.add('is-copied');
  clearTimeout(btn._copyTimer);
  btn._copyTimer = setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove('is-copied');
  }, ms);
}

export function initClipboard() {
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy-target]');
    if (!btn) return;
    e.preventDefault();
    const sel = btn.dataset.copyTarget;
    const target = document.querySelector(sel);
    if (!target) return;
    const text = target.textContent || '';
    const ok = await copyText(text.trim());
    flash(btn, ok ? 'Copied' : 'Press ⌘C', ok ? 1400 : 2000);
  }, false);
}
