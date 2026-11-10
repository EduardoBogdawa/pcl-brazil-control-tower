import { icon, portalIcon } from '@/control-tower/icons.js';
import { tr, getLang } from '@/control-tower/i18n';
import { fetchTrash, restoreItem, TRASH_DAYS } from '@/control-tower/store';
import { todayIso } from '@/control-tower/insights.js';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function locale() { return getLang() === 'en' ? 'en-US' : 'pt-BR'; }

// Generic side sheet reused by the pending-links list and the trash.
export function createSheet() {
  const root = document.createElement('div');
  root.className = 'modal sheet-modal';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'sheetTitle');
  document.body.appendChild(root);
  let onBind = null;
  function close() { root.classList.remove('on'); }
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-sheet-close]')) close();
    else if (onBind) onBind(e);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('on')) close(); });
  return {
    open({ ico, title, sub, body, onClick }) {
      onBind = onClick || null;
      root.innerHTML = '<div class="dialog sheet"><div class="prefs-head"><span class="prefs-ico">' + icon(ico) + '</span><div><h2 id="sheetTitle">' + esc(title) + '</h2><p>' + esc(sub) + '</p></div><button type="button" class="icon-btn" data-sheet-close aria-label="' + esc(tr('Fechar')) + '">' + icon('x') + '</button></div><div class="sheet-body">' + body + '</div></div>';
      root.classList.add('on');
    },
    setBody(html) { const b = root.querySelector('.sheet-body'); if (b) b.innerHTML = html; },
    close,
  };
}

// --- CSV export: ";" separator and a BOM so Excel (pt-BR) opens accents and columns correctly.
function csvCell(v) {
  const s = Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v);
  return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadCsv(name, header, rows) {
  const text = '\uFEFF' + [header].concat(rows).map((r) => r.map(csvCell).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  a.download = name + '-' + todayIso() + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ctx: { getDashboards, getTasks, getEvents, categoryLabel, safeUrl, exportJson, showToast }
export function bindExportMenu(button, ctx) {
  const menu = document.createElement('div');
  menu.className = 'menu-pop';
  menu.setAttribute('role', 'menu');
  document.body.appendChild(menu);
  const items = [
    ['json', 'download', 'Configuração completa (JSON)', 'Backup para restaurar ou compartilhar'],
    ['panels', 'sheet', 'Painéis e links (Excel)', 'Lista de todos os painéis com URLs'],
    ['tasks', 'check', 'Atividades da rotina (Excel)', 'Rotina semanal e mensal da equipe'],
    ['events', 'calendar', 'Eventos do calendário (Excel)', 'Agenda com datas, horários e participantes'],
  ];
  function draw() {
    menu.innerHTML = items.map(([k, ico, t, s]) => '<button type="button" role="menuitem" data-export="' + k + '"><span class="menu-ico">' + icon(ico) + '</span><span><b>' + esc(tr(t)) + '</b><small>' + esc(tr(s)) + '</small></span></button>').join('');
  }
  function close() { menu.classList.remove('on'); button.setAttribute('aria-expanded', 'false'); }
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.onclick = (e) => {
    e.stopPropagation();
    if (menu.classList.contains('on')) { close(); return; }
    draw();
    const r = button.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 24);
    menu.style.width = w + 'px';
    menu.style.top = Math.round(r.bottom + 10) + 'px';
    menu.style.left = Math.round(Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12))) + 'px';
    menu.classList.add('on');
    button.setAttribute('aria-expanded', 'true');
  };
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('[data-export]');
    if (!b) return;
    close();
    run(b.getAttribute('data-export'));
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  function run(kind) {
    if (kind === 'json') { ctx.exportJson(); return; }
    if (kind === 'panels') {
      const rows = [];
      ctx.getDashboards().forEach((d) => {
        if (d.links && d.links.length) d.links.forEach((l) => rows.push([d.name, ctx.categoryLabel(d.category), l.name, ctx.safeUrl(l.url) || '', d.desc]));
        else rows.push([d.name, ctx.categoryLabel(d.category), '', ctx.safeUrl(d.url) || '', d.desc]);
      });
      downloadCsv('paineis', [tr('Painel'), tr('Categoria'), tr('Link'), 'URL', tr('Descrição')], rows);
    } else if (kind === 'tasks') {
      downloadCsv('atividades', [tr('Atividade'), tr('Responsável'), tr('Frequência'), tr('Dia')], ctx.getTasks().map((t) => [t.name, t.owner, tr(t.period), t.day]));
    } else {
      const evs = ctx.getEvents();
      if (!evs.length) { ctx.showToast(tr('Abra o calendário uma vez para carregar os eventos antes de exportar.'), true); return; }
      downloadCsv('eventos', [tr('Título'), tr('Data'), tr('Início'), tr('Fim'), tr('Recorrência'), 'Owners', tr('Participantes'), tr('Descrição')],
        evs.map((e) => [e.title, e.start_date, e.start_time || tr('Dia inteiro'), e.end_time || '', e.recurrence, e.owners, e.participants, e.description]));
    }
    ctx.showToast(tr('Arquivo exportado.'));
  }
  return { run };
}

// --- Trash: everything deleted in the last 30 days, restorable by anyone.
const KIND_META = { panel: ['layers', 'Painel'], task: ['check', 'Atividade'], event: ['calendar', 'Evento'], category: ['grid', 'Categoria'] };

export function openTrash(sheet, { onRestored, showToast }) {
  let items = [];
  function draw() {
    if (!items.length) { sheet.setBody('<div class="alerts-empty">' + icon('check') + '<b>' + tr('Lixeira vazia') + '</b><small>' + tr('Nada foi excluído nos últimos {0} dias.', TRASH_DAYS) + '</small></div>'); return; }
    sheet.setBody('<ul class="trash-list">' + items.map((it, i) => {
      const left = Math.max(0, TRASH_DAYS - Math.floor((Date.now() - Date.parse(it.deleted_at)) / 86400000));
      const [ico, kind] = KIND_META[it.kind];
      return '<li style="--i:' + Math.min(i, 12) + '"><span class="alert-ico">' + icon(ico) + '</span><span class="alert-txt"><b>' + esc(it.title) + '</b><small>' + esc(tr(kind)) + (it.detail ? ' · ' + esc(it.detail) : '') + ' · ' + tr(left === 1 ? 'resta {0} dia' : 'restam {0} dias', left) + '</small></span><button type="button" class="btn" data-restore="' + i + '">' + icon('restore') + '<span>' + tr('Restaurar') + '</span></button></li>';
    }).join('') + '</ul>');
  }
  function onClick(e) {
    const b = e.target.closest('[data-restore]');
    if (!b) return;
    const it = items[+b.getAttribute('data-restore')];
    if (!it) return;
    b.disabled = true;
    restoreItem(it.kind, it.id).then(() => {
      items = items.filter((x) => x !== it);
      draw();
      showToast(tr('"{0}" foi restaurado.', it.title));
      onRestored(it.kind);
    }).catch(() => { b.disabled = false; showToast(tr('Não foi possível restaurar. Tente novamente.'), true); });
  }
  sheet.open({ ico: 'trash', title: tr('Lixeira'), sub: tr('Itens excluídos ficam aqui por {0} dias e podem ser restaurados.', TRASH_DAYS), body: '<div class="sheet-loading"><span class="spin"></span>' + tr('Carregando...') + '</div>', onClick });
  fetchTrash().then((list) => { items = list; draw(); }).catch(() => sheet.setBody('<p class="form-error">' + tr('Não foi possível carregar a lixeira. Verifique a conexão e tente novamente.') + '</p>'));
}

// --- Presentation mode: full screen slides for a meeting room TV.
const IDLE_MS = 3000;

export function createPresentation({ getSlides, getSeconds, onStart }) {
  const root = document.createElement('div');
  root.className = 'present';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', tr('Modo apresentação'));
  document.body.appendChild(root);
  let idx = 0, timer = null, clock = null, idleTimer = null, slides = [], paused = false, wakeLock = null;

  // Keeps the TV from dimming while slides rotate; silently skipped where the browser lacks support.
  async function holdScreen() {
    try { if (navigator.wakeLock && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch { wakeLock = null; }
  }

  function syncControls() {
    const btn = root.querySelector('[data-present-toggle]');
    btn.innerHTML = icon(paused ? 'resume' : 'pause');
    btn.setAttribute('aria-label', tr(paused ? 'Retomar' : 'Pausar'));
    btn.setAttribute('title', tr(paused ? 'Retomar' : 'Pausar'));
    root.classList.toggle('paused', paused);
  }

  function show() {
    slides = getSlides();
    if (!slides.length) return;
    idx = (idx + slides.length) % slides.length;
    const s = slides[idx];
    root.querySelector('.present-stage').innerHTML = '<div class="present-slide"><div class="present-kicker">' + esc(s.kicker) + '</div><h2>' + esc(s.title) + '</h2>' + s.body + '</div>';
    root.querySelector('.present-count').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    root.querySelector('.present-dots').innerHTML = slides.map((x, i) => '<button type="button" data-present-go="' + i + '" class="' + (i === idx ? 'on' : '') + '" aria-label="' + esc(x.title) + '"' + (i === idx ? ' aria-current="step"' : '') + '></button>').join('');
    const bar = root.querySelector('.present-progress i');
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = paused ? 'none' : 'present-fill ' + getSeconds() + 's linear forwards';
    clearTimeout(timer);
    if (!paused) timer = setTimeout(() => { idx++; show(); }, getSeconds() * 1000);
  }
  function go(n) { idx = n; show(); }
  function toggle() { paused = !paused; syncControls(); show(); }
  function tick() {
    const t = root.querySelector('.present-clock');
    const d = root.querySelector('.present-date');
    const now = new Date();
    if (t) t.textContent = now.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
    if (d) d.textContent = now.toLocaleDateString(locale(), { weekday: 'short', day: '2-digit', month: 'short' });
  }
  function wake() {
    root.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => root.classList.add('idle'), IDLE_MS);
  }
  function stop() {
    clearTimeout(timer); clearInterval(clock); clearTimeout(idleTimer);
    root.classList.remove('on', 'idle', 'paused');
    document.body.classList.remove('presenting');
    if (wakeLock) wakeLock.release().catch(() => {});
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  function start() {
    idx = 0; paused = false;
    root.innerHTML = '<div class="present-top"><img src="/nexteer-logo.png" alt="Nexteer Automotive"><span>PC&amp;L BRAZIL · CONTROL TOWER</span><span class="present-count"></span><span class="present-time"><small class="present-date"></small><b class="present-clock"></b></span></div>'
      + '<div class="present-stage" aria-live="polite"></div>'
      + '<div class="present-foot"><div class="present-ctrl">'
      + '<button type="button" class="present-btn" data-present-prev aria-label="' + esc(tr('Anterior')) + '" title="' + esc(tr('Anterior')) + '">' + icon('chevronLeft') + '</button>'
      + '<button type="button" class="present-btn main" data-present-toggle></button>'
      + '<button type="button" class="present-btn" data-present-next aria-label="' + esc(tr('Próxima')) + '" title="' + esc(tr('Próxima')) + '">' + icon('chevronRight') + '</button></div>'
      + '<div class="present-dots"></div><span class="present-paused">' + esc(tr('Pausado')) + '</span><span class="present-hint">' + esc(tr('Setas para navegar · Espaço pausa · Esc para sair')) + '</span>'
      + '<button type="button" class="btn" data-present-exit>' + icon('x') + esc(tr('Sair')) + '</button></div><div class="present-progress"><i></i></div>';
    root.classList.add('on');
    document.body.classList.add('presenting');
    if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    holdScreen();
    if (onStart) onStart();
    syncControls();
    tick(); clock = setInterval(tick, 15000);
    wake();
    show();
  }
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-present-exit]')) stop();
    else if (e.target.closest('[data-present-toggle]')) toggle();
    else if (e.target.closest('[data-present-prev]')) go(idx - 1);
    else if (e.target.closest('[data-present-next]')) go(idx + 1);
    else if (e.target.closest('[data-present-go]')) go(Number(e.target.closest('[data-present-go]').getAttribute('data-present-go')));
  });
  root.addEventListener('mousemove', wake);
  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('on')) return;
    wake();
    if (e.key === 'Escape') stop();
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
    else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      if (e.key === ' ' && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      toggle();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && root.classList.contains('on')) holdScreen(); });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && root.classList.contains('on')) stop(); });
  return { start, stop };
}

// `holidays` is null while loading or when the calendar is unreachable; that slide is then left out.
export function presentSlides(s, { stats, dashboards, categoryLabel, timeLabel, holidays }) {
  const big = (cls, ico, v, l, sub) => '<div class="present-big ' + cls + '"><span class="present-big-ico">' + icon(ico) + '</span><b>' + v + '</b><span>' + esc(l) + '</span>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
  const list = (rows, empty) => rows.length ? '<ul class="present-list">' + rows.map((r, i) => r.replace('<li', '<li style="--i:' + i + '"')).join('') + '</ul>' : '<p class="present-empty">' + esc(empty) + '</p>';
  const byId = new Map(dashboards.map((d) => [d.id, d]));
  const date = new Date().toLocaleDateString(locale(), { weekday: 'long', day: '2-digit', month: 'long' });
  const readyPct = s.panels ? Math.round((s.ready / s.panels) * 100) : 0;
  const n = (v) => Number(v).toLocaleString(locale());
  const top = stats.map((x) => ({ x, d: byId.get(x.panel_id) })).filter((r) => r.d).slice(0, 6);
  const slides = [
    { kicker: date, title: tr('Indicadores da central'), body: '<div class="present-grid">'
      + big('b-ready', 'activity', n(s.ready), tr('painéis prontos'), tr('{0}% com link configurado', readyPct))
      + big('b-tasks', 'checkSquare', n(s.todayTasks.length), tr('atividades hoje'), tr('Rotina da equipe'))
      + big('b-today', 'calendar', n(s.eventsToday.length), tr('eventos hoje'), tr('Agenda compartilhada'))
      + big('b-week', 'clock', n(s.eventsWeek.length), tr('eventos em 7 dias'), tr('Próxima semana'))
      + '</div>' },
    { kicker: tr('Agenda'), title: tr('Próximos eventos'), body: list(s.eventsWeek.slice(0, 6).map(({ ev, offset }) => '<li><span class="present-when">' + esc(offset === 0 ? tr('Hoje') : offset === 1 ? tr('Amanhã') : tr('Em {0} dias', offset)) + '</span><b>' + esc(ev.title) + '</b><small>' + esc(timeLabel(ev)) + '</small></li>'), tr('Nenhum evento nos próximos 7 dias.')) },
    { kicker: tr('Rotina'), title: tr('Atividades de hoje'), body: list(s.todayTasks.slice(0, 6).map((t) => '<li><span class="present-when">' + esc(t.owner) + '</span><b>' + esc(t.name) + '</b><small>' + esc(tr(t.period)) + '</small></li>'), tr('Nenhuma atividade programada para hoje.')) },
  ];
  if (Array.isArray(holidays)) {
    slides.push({ kicker: tr('Plantas e parceiros'), title: tr('Feriados nos próximos 30 dias'), body: list(holidays.slice(0, 6).map((h) => '<li class="' + h.state + '"><span class="present-cc">' + esc(h.cc) + '</span><b>' + esc(h.name) + '</b><small>' + esc(h.country) + ' · ' + esc(h.range) + (h.estimated ? ' · ' + esc(tr('período estimado')) : '') + '</small><span class="present-tag">' + esc(h.when) + '</span></li>'), tr('Nenhum feriado nas plantas nos próximos 30 dias.')) });
  }
  if (s.fresh.length) {
    slides.push({ kicker: tr('Novidades'), title: tr('Adicionados nesta semana'), body: list(s.fresh.slice(0, 6).map((d) => '<li>' + portalIcon(d) + '<b>' + esc(d.name) + '</b><small>' + esc(categoryLabel(d.category)) + '</small></li>'), '') });
  }
  slides.push({ kicker: tr('Equipe'), title: tr('Mais acessados'), body: list(top.map(({ x, d }, i) => '<li><span class="present-when">' + String(i + 1).padStart(2, '0') + '</span>' + portalIcon(d) + '<b>' + esc(d.name) + '</b><small>' + esc(categoryLabel(d.category)) + '</small><span class="present-tag">' + esc(n(x.open_count)) + ' ' + esc(tr(x.open_count === 1 ? 'acesso' : 'acessos')) + '</span></li>'), tr('O ranking aparece assim que a equipe começar a abrir os painéis.')) });
  return slides;
}

// --- Daily splash: once per day per browser, skippable, never blocks work.
const SPLASH_KEY = 'ct-splash-day';
export function maybeSplash(enabled, greeting) {
  if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (localStorage.getItem(SPLASH_KEY) === todayIso()) return; localStorage.setItem(SPLASH_KEY, todayIso()); } catch { return; }
  const el = document.createElement('div');
  el.className = 'splash';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="splash-core"><span class="splash-ring"></span><img src="/nexteer-logo.png" alt=""><b>' + esc(greeting) + '</b><small>PC&amp;L BRAZIL · CONTROL TOWER</small><i class="splash-line"></i></div>';
  document.body.appendChild(el);
  const done = () => { el.classList.add('out'); setTimeout(() => el.remove(), 600); };
  el.addEventListener('click', done);
  setTimeout(done, 1900);
}

// --- Mobile bottom navigation.
export function mountDock({ onHome, onSearch, onCalendar, onAlerts, isActive }) {
  const dock = document.createElement('nav');
  dock.className = 'dock';
  dock.setAttribute('aria-label', tr('Navegação rápida'));
  const items = [['home', 'home', 'Início', onHome], ['search', 'search', 'Busca', onSearch], ['calendar', 'calendar', 'Agenda', onCalendar], ['alerts', 'bell', 'Avisos', onAlerts]];
  function draw() {
    dock.innerHTML = items.map(([k, ico, label]) => '<button type="button" data-dock="' + k + '"' + (isActive(k) ? ' class="on" aria-current="page"' : '') + '>' + icon(ico) + '<span>' + esc(tr(label)) + '</span>' + (k === 'alerts' ? '<em data-dock-badge hidden></em>' : '') + '</button>').join('');
  }
  dock.addEventListener('click', (e) => {
    const b = e.target.closest('[data-dock]');
    if (!b) return;
    e.stopPropagation();
    const it = items.find((x) => x[0] === b.getAttribute('data-dock'));
    if (it) it[3](b);
  });
  draw();
  document.body.appendChild(dock);
  return { sync: draw };
}
