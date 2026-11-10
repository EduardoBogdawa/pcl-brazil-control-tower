import { icon } from '@/control-tower/icons.js';
import { tr, getLang } from '@/control-tower/i18n';
import { todayIso } from '@/control-tower/insights.js';

// Read marks are personal, so they stay in this browser; ids embed the date so daily alerts come back each day.
const READ_KEY = 'ct-alerts-read';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadRead() {
  try { const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

function minutesOf(t) {
  const [h, m] = String(t || '').split(':').map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
}

// Builds alert entries from what the overview already knows: no extra requests are made here.
export function buildAlerts(s, { timeLabel, calendarCategory, taskCategory }) {
  const today = todayIso();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const out = [];
  s.eventsWeek.filter((x) => x.offset <= 1).forEach(({ ev, day, offset }) => {
    const start = minutesOf(ev.start_time);
    if (offset === 0 && start !== null && start + 60 < nowMin) return;
    const soon = offset === 0 && start !== null && start - nowMin <= 60 && start >= nowMin;
    out.push({
      id: 'ev:' + ev.id + ':' + day, tone: soon ? 'hot' : 'info', ico: 'calendar',
      title: ev.title,
      detail: (offset === 0 ? tr('Hoje') : tr('Amanhã')) + ' · ' + timeLabel(ev) + (soon ? ' · ' + tr('começa em breve') : ''),
      event: { id: ev.id, day },
    });
  });
  if (s.todayTasks.length) {
    out.push({ id: 'tasks:' + today, tone: 'info', ico: 'check', title: tr(s.todayTasks.length === 1 ? '{0} atividade na rotina de hoje' : '{0} atividades na rotina de hoje', s.todayTasks.length), detail: s.todayTasks.slice(0, 3).map((t) => t.name).join(' · '), go: taskCategory });
  }
  s.workshops.filter((w) => w.in <= 14).forEach(({ d, in: n }) => {
    out.push({ id: 'ws:' + d.id + ':' + d.workshopDate, tone: n <= 2 ? 'hot' : 'info', ico: 'users', title: d.name, detail: n === 0 ? tr('Workshop hoje') : tr('Workshop em {0} dias', n), go: 'Workshops' });
  });
  s.fresh.forEach((d) => out.push({ id: 'new:' + d.id, tone: 'ok', ico: 'plus', title: tr('Novo painel: {0}', d.name), detail: tr('Adicionado em {0}', new Date(d.createdAt).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'pt-BR')), panel: d.id }));
  if (s.pending.length) {
    out.push({ id: 'pending:' + s.pending.length + ':' + today, tone: 'warn', ico: 'link', title: tr(s.pending.length === 1 ? '{0} painel sem link' : '{0} painéis sem link', s.pending.length), detail: tr('Configure os links para que todos consigam abrir'), pending: true });
  }
  return out;
}

// handlers: { openEvent(id, day), goTo(name), openPanel(id), openPending() }
export function createNotifications(button, getAlerts, handlers) {
  let read = loadRead();
  let alerts = [];
  const pop = document.createElement('div');
  pop.className = 'alerts-pop';
  pop.id = 'alertsPop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', tr('Avisos'));
  document.body.appendChild(pop);
  button.setAttribute('aria-controls', 'alertsPop');
  button.setAttribute('aria-expanded', 'false');

  function saveRead() {
    const ids = new Set(alerts.map((a) => a.id));
    read = read.filter((id) => ids.has(id));
    try { localStorage.setItem(READ_KEY, JSON.stringify(read.slice(-200))); } catch { /* optional */ }
  }

  function unread() { return alerts.filter((a) => read.indexOf(a.id) === -1); }

  function badge() {
    const n = unread().length;
    let b = button.querySelector('.bell-badge');
    if (!b) { b = document.createElement('span'); b.className = 'bell-badge'; button.appendChild(b); }
    b.textContent = n > 9 ? '9+' : String(n);
    b.hidden = !n;
    button.classList.toggle('has-alerts', !!n);
    const label = tr(n === 1 ? '{0} aviso novo' : '{0} avisos novos', n);
    button.setAttribute('aria-label', n ? label : tr('Avisos'));
    button.title = n ? label : tr('Avisos');
    document.querySelectorAll('[data-dock-badge]').forEach((el) => { el.textContent = n > 9 ? '9+' : String(n); el.hidden = !n; });
  }

  function draw() {
    const list = alerts.length
      ? '<ul>' + alerts.map((a, i) => '<li class="alert-item tone-' + a.tone + (read.indexOf(a.id) === -1 ? ' unread' : '') + '" style="--i:' + i + '"><button type="button" data-alert="' + i + '"><span class="alert-ico">' + icon(a.ico) + '</span><span class="alert-txt"><b>' + esc(a.title) + '</b><small>' + esc(a.detail) + '</small></span></button></li>').join('') + '</ul>'
      : '<div class="alerts-empty">' + icon('check') + '<b>' + tr('Tudo em dia') + '</b><small>' + tr('Nenhum aviso no momento.') + '</small></div>';
    pop.innerHTML = '<header><div><b>' + tr('Avisos') + '</b><small>' + tr(unread().length === 1 ? '{0} não lido' : '{0} não lidos', unread().length) + '</small></div>' + (unread().length ? '<button type="button" class="link-btn" data-alert-all>' + tr('Marcar todos como lidos') + '</button>' : '') + '</header>' + list;
  }

  function place() {
    const r = button.getBoundingClientRect();
    const w = Math.min(380, window.innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.top = Math.round(r.bottom + 10) + 'px';
    pop.style.left = Math.round(Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12))) + 'px';
  }

  function close() { pop.classList.remove('on'); button.setAttribute('aria-expanded', 'false'); }

  function open() { refresh(); draw(); place(); pop.classList.add('on'); button.setAttribute('aria-expanded', 'true'); }

  function markRead(id) { if (read.indexOf(id) === -1) read.push(id); saveRead(); badge(); }

  function refresh() { alerts = getAlerts(); badge(); }

  button.addEventListener('click', (e) => { e.stopPropagation(); if (pop.classList.contains('on')) close(); else open(); });
  pop.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('[data-alert-all]')) { alerts.forEach((a) => { if (read.indexOf(a.id) === -1) read.push(a.id); }); saveRead(); badge(); draw(); return; }
    const b = e.target.closest('[data-alert]');
    if (!b) return;
    const a = alerts[+b.getAttribute('data-alert')];
    if (!a) return;
    markRead(a.id);
    close();
    if (a.event) handlers.openEvent(a.event.id, a.event.day);
    else if (a.go) handlers.goTo(a.go);
    else if (a.panel) handlers.openPanel(a.panel);
    else if (a.pending) handlers.openPending();
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (pop.classList.contains('on')) place(); });

  return { refresh, open, unreadCount: () => unread().length };
}
