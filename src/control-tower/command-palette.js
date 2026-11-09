import { icon } from '@/control-tower/icons.js';
import { tr } from '@/control-tower/i18n';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// getEntries returns [{group, title, hint, iconHtml, keywords, run}] built fresh on every open,
// so the list always reflects panels and categories saved by other people.
export function createCommandPalette(getEntries) {
  const root = document.getElementById('palette');
  const input = document.getElementById('paletteInput');
  const list = document.getElementById('paletteList');
  let entries = [];
  let shown = [];
  let active = 0;
  let lastFocus = null;

  function draw() {
    const q = normalize(input.value.trim());
    shown = entries.filter((e) => !q || normalize(e.title + ' ' + e.hint + ' ' + (e.keywords || '')).includes(q)).slice(0, 40);
    if (active >= shown.length) active = 0;
    if (!shown.length) {
      list.innerHTML = '<div class="palette-empty">' + tr('Nada encontrado para "{0}".', esc(input.value.trim())) + '</div>';
      return;
    }
    let group = '';
    list.innerHTML = shown.map((e, i) => {
      const head = e.group !== group ? '<div class="palette-group">' + esc(tr(e.group)) + '</div>' : '';
      group = e.group;
      return head + '<button type="button" role="option" class="palette-item' + (i === active ? ' on' : '') + '" data-i="' + i + '" aria-selected="' + (i === active) + '">'
        + '<span class="palette-ico">' + e.iconHtml + '</span><span class="palette-text"><b>' + esc(e.title) + '</b><small>' + esc(e.hint) + '</small></span>'
        + icon('arrow', 'palette-go') + '</button>';
    }).join('');
    const on = list.querySelector('.palette-item.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement;
    entries = getEntries();
    input.value = '';
    active = 0;
    root.classList.add('on');
    draw();
    input.focus();
  }

  function close() {
    root.classList.remove('on');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function runAt(i) {
    const e = shown[i];
    if (!e) return;
    close();
    e.run();
  }

  input.addEventListener('input', () => { active = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, shown.length - 1); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); runAt(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.palette-item');
    if (b) runAt(Number(b.getAttribute('data-i')));
  });
  list.addEventListener('mousemove', (e) => {
    const b = e.target.closest('.palette-item');
    if (!b) return;
    const i = Number(b.getAttribute('data-i'));
    if (i === active) return;
    active = i;
    list.querySelectorAll('.palette-item').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
  });
  root.addEventListener('click', (e) => { if (e.target === root) close(); });

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (root.classList.contains('on')) close(); else open();
    } else if (e.key === '/' && !typing && !document.querySelector('.modal.on') && !root.classList.contains('on')) {
      e.preventDefault();
      open();
    }
  });

  return { open, close };
}
