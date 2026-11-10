import { tr, getLang } from '@/control-tower/i18n';
import { icon, portalIcon } from '@/control-tower/icons.js';
import { fetchEvents, saveEvent, deleteEvent } from '@/control-tower/store';

export const CALENDAR_CATEGORY = 'Calendário';

const VACATION_FILE = {
  name: 'Férias_PC&L.xlsx',
  url: 'https://nexteerautomotive.sharepoint.com/:x:/r/sites/PCLBrazil/_layouts/15/Doc.aspx?sourcedoc=%7BCC231491-D902-4DEB-96E8-99E9231F3350%7D&file=F%C3%A9rias_PC%26L.xlsx&action=default&mobileredirect=true&wdwpf=doclib-c',
};

const COLORS = ['#E4002B', '#8F0B22', '#F5A524', '#0F9D8A', '#0078D4', '#34383D'];
const RECURRENCE = { none: 'Não se repete', daily: 'Diariamente', weekly: 'Semanalmente', monthly: 'Mensalmente', yearly: 'Anualmente' };
const DEFAULT_PEOPLE = ['Eduardo', 'Amanda'];
const MAX_PER_CELL = 3;

function pad(n) { return (n < 10 ? '0' : '') + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parse(s) { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function hhmm(t) { return t ? t.slice(0, 5) : ''; }
function locale() { return getLang() === 'en' ? 'en-US' : 'pt-BR'; }

// Recurring events are stored once and expanded per visible day.
function occursOn(ev, day) {
  const start = parse(ev.start_date);
  if (day < start) return false;
  if (ev.recurrence_until && day > parse(ev.recurrence_until)) return false;
  switch (ev.recurrence) {
    case 'daily': return true;
    case 'weekly': return day.getDay() === start.getDay();
    case 'monthly': return day.getDate() === start.getDate();
    case 'yearly': return day.getDate() === start.getDate() && day.getMonth() === start.getMonth();
    default: return iso(day) === ev.start_date;
  }
}

function byTime(a, b) {
  return (a.start_time || '').localeCompare(b.start_time || '') || a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' });
}

export function createCalendar({ esc, showToast, confirmAction, onChange }) {
  let events = null;
  let loadFailed = false;
  let loading = false;
  let cursor = new Date();
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  let host = null;
  let mode = 'month';
  let viewing = null;
  let dayOpen = null;

  const $ = (id) => document.getElementById(id);
  const formModal = $('eventModal');
  const form = $('eventForm');
  const viewModal = $('eventView');
  const dayModal = $('dayModal');
  const owners = createTagInput($('evOwners'));
  const participants = createTagInput($('evParticipants'));

  function eventsOn(day) { return (events || []).filter((ev) => occursOn(ev, day)).sort(byTime); }

  function knownPeople() {
    const set = new Set(DEFAULT_PEOPLE);
    (events || []).forEach((ev) => ev.owners.concat(ev.participants).forEach((p) => set.add(p)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  function chip(ev, day) {
    const time = ev.start_time ? '<time>' + hhmm(ev.start_time) + '</time>' : '';
    return '<button type="button" class="cal-event" style="--ev:' + esc(ev.color) + '" data-ev="' + esc(ev.id) + '" data-day="' + iso(day) + '" title="' + esc(ev.title) + '">' + time + '<span>' + esc(ev.title) + '</span>' + (ev.recurrence !== 'none' ? icon('repeat') : '') + '</button>';
  }

  function monthHtml() {
    const first = new Date(cursor);
    const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    const today = iso(new Date());
    const fmtMonth = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(first);
    const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale(), { weekday: 'long' }).format(new Date(2024, 8, 1 + i)));
    let monthCount = 0;
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const day = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const inMonth = day.getMonth() === first.getMonth();
      const list = eventsOn(day);
      if (inMonth) monthCount += list.length;
      const more = list.length - MAX_PER_CELL;
      cells += '<div class="cal-cell' + (inMonth ? '' : ' out') + (iso(day) === today ? ' today' : '') + (day.getDay() === 0 || day.getDay() === 6 ? ' weekend' : '') + '" data-new="' + iso(day) + '" role="gridcell" aria-label="' + esc(day.toLocaleDateString(locale(), { day: 'numeric', month: 'long' })) + '">'
        + '<div class="cal-events">' + list.slice(0, MAX_PER_CELL).map((ev) => chip(ev, day)).join('')
        + (more > 0 ? '<button type="button" class="cal-more" data-more="' + iso(day) + '">' + tr('+{0} mais', more) + '</button>' : '') + '</div>'
        + '<span class="cal-num">' + day.getDate() + '</span></div>';
    }
    return linksHtml() + '<section class="calendar">'
      + headHtml(cap(fmtMonth), tr(monthCount === 1 ? '{0} evento no mês' : '{0} eventos no mês', monthCount))
      + '<div class="cal-grid" role="grid"><div class="cal-week" role="row">' + weekdays.map((w, i) => '<span class="' + (i === 0 || i === 6 ? 'weekend' : '') + '">' + esc(w.charAt(0).toUpperCase() + w.slice(1)) + '</span>').join('') + '</div>'
      + '<div class="cal-days">' + cells + '</div></div></section>';
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function linksHtml() {
    const f = VACATION_FILE;
    const body = portalIcon({ name: f.name, url: f.name }) + '<span class="cal-file-txt"><b>' + tr('Calendário de férias') + '</b><small>' + esc(f.name) + ' · SharePoint</small></span>';
    if (!f.url) return '<div class="cal-links"><span class="cal-file off" aria-disabled="true">' + body + '<em>' + tr('Link pendente') + '</em></span></div>';
    return '<div class="cal-links"><a class="cal-file" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' + body + '<span class="cal-file-go">' + tr('Abrir planilha') + icon('external') + '</span></a></div>';
  }

  function headHtml(title, sub) {
    const year = mode === 'year';
    const seg = (m, label) => '<button type="button" data-mode="' + m + '" class="' + (mode === m ? 'on' : '') + '" aria-pressed="' + (mode === m) + '">' + tr(label) + '</button>';
    return '<header class="cal-head"><div class="cal-title"><h3>' + esc(title) + '</h3><small>' + esc(sub) + '</small></div>'
      + '<div class="cal-mode" role="group" aria-label="' + tr('Visualização') + '">' + seg('month', 'Mês') + seg('year', 'Ano') + '</div>'
      + '<div class="cal-nav"><button type="button" class="cal-icon" data-cal="prev" aria-label="' + tr(year ? 'Ano anterior' : 'Mês anterior') + '">' + icon('chevronLeft') + '</button><button type="button" class="cal-today" data-cal="today">' + tr('Hoje') + '</button><button type="button" class="cal-icon" data-cal="next" aria-label="' + tr(year ? 'Próximo ano' : 'Próximo mês') + '">' + icon('chevronRight') + '</button></div>'
      + '<button type="button" class="btn primary cal-add" data-cal="add">' + icon('plus') + tr('Novo evento') + '</button></header>';
  }

  function yearHtml() {
    const y = cursor.getFullYear();
    const today = iso(new Date());
    const initials = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale(), { weekday: 'narrow' }).format(new Date(2024, 8, 1 + i)));
    let yearCount = 0;
    let months = '';
    for (let m = 0; m < 12; m++) {
      const first = new Date(y, m, 1);
      const days = new Date(y, m + 1, 0).getDate();
      let monthCount = 0;
      let cells = '<span class="yr-blank"></span>'.repeat(first.getDay());
      for (let d = 1; d <= days; d++) {
        const day = new Date(y, m, d);
        const list = eventsOn(day);
        monthCount += list.length;
        const label = day.toLocaleDateString(locale(), { day: 'numeric', month: 'long' }) + (list.length ? ' · ' + tr(list.length === 1 ? '{0} evento' : '{0} eventos', list.length) : '');
        const dots = list.slice(0, 3).map((ev) => '<i style="--ev:' + esc(ev.color) + '"></i>').join('');
        cells += '<button type="button" class="yr-day' + (list.length ? ' has' : '') + (iso(day) === today ? ' today' : '') + '"' + (list.length ? ' style="--ev:' + esc(list[0].color) + '"' : '') + ' data-yday="' + iso(day) + '" aria-label="' + esc(label) + '" title="' + esc(list.map((ev) => ev.title).join(' · ') || label) + '"><b>' + d + '</b>' + (dots ? '<span class="yr-dots">' + dots + '</span>' : '') + '</button>';
      }
      yearCount += monthCount;
      const name = new Intl.DateTimeFormat(locale(), { month: 'long' }).format(first);
      months += '<article class="yr-month' + (y === new Date().getFullYear() && m === new Date().getMonth() ? ' current' : '') + '" style="--i:' + m + '"><button type="button" class="yr-head" data-month="' + m + '" title="' + tr('Abrir mês') + '"><b>' + esc(cap(name)) + '</b>' + (monthCount ? '<em>' + monthCount + '</em>' : '') + '</button>'
        + '<div class="yr-week">' + initials.map((w) => '<span>' + esc(w.toUpperCase()) + '</span>').join('') + '</div><div class="yr-days">' + cells + '</div></article>';
    }
    return linksHtml() + '<section class="calendar">' + headHtml(String(y), tr(yearCount === 1 ? '{0} evento no ano' : '{0} eventos no ano', yearCount)) + '<div class="yr-grid">' + months + '</div></section>';
  }

  function render(target) {
    if (target) host = target;
    if (!host) return;
    if (loadFailed) { host.innerHTML = '<div class="load-state error">' + tr('Não foi possível carregar o calendário. Recarregue a página para tentar novamente.') + '</div>'; return; }
    if (!events) { host.innerHTML = '<div class="load-state">' + tr('Carregando calendário...') + '</div>'; load(); return; }
    host.innerHTML = mode === 'year' ? yearHtml() : monthHtml();
    bind();
  }

  function load() {
    if (loading) return;
    loading = true;
    fetchEvents().then((rows) => { events = rows; onChange(); }).catch(() => { loadFailed = true; render(); }).finally(() => { loading = false; });
  }

  function bind() {
    host.querySelectorAll('[data-cal]').forEach((b) => {
      b.onclick = () => {
        const a = b.getAttribute('data-cal');
        if (a === 'add') return openForm(null, iso(new Date()));
        const step = (a === 'next' ? 1 : -1) * (mode === 'year' ? 12 : 1);
        cursor = a === 'today' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : new Date(cursor.getFullYear(), cursor.getMonth() + step, 1);
        render();
      };
    });
    host.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => { mode = b.getAttribute('data-mode'); render(); }; });
    host.querySelectorAll('[data-month]').forEach((b) => { b.onclick = () => { cursor = new Date(cursor.getFullYear(), +b.getAttribute('data-month'), 1); mode = 'month'; render(); }; });
    host.querySelectorAll('[data-yday]').forEach((b) => {
      b.onclick = () => { const s = b.getAttribute('data-yday'); if (eventsOn(parse(s)).length) openDay(s); else openForm(null, s); };
    });
    host.querySelectorAll('[data-ev]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); openView(b.getAttribute('data-ev'), b.getAttribute('data-day')); }; });
    host.querySelectorAll('[data-more]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); openDay(b.getAttribute('data-more')); }; });
    host.querySelectorAll('[data-new]').forEach((c) => { c.onclick = () => openForm(null, c.getAttribute('data-new')); });
  }

  function longDate(s) { return parse(s).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function timeRange(ev) { return ev.start_time ? hhmm(ev.start_time) + (ev.end_time ? ' – ' + hhmm(ev.end_time) : '') : tr('Dia inteiro'); }
  function people(list, cls) { return list.length ? list.map((p) => '<span class="person ' + cls + '"><i>' + esc(p.charAt(0).toUpperCase()) + '</i>' + esc(p) + '</span>').join('') : '<span class="muted">' + tr('Ninguém adicionado') + '</span>'; }

  function openView(id, day) {
    const ev = (events || []).find((x) => x.id === id);
    if (!ev) return;
    viewing = ev;
    const rec = ev.recurrence !== 'none' ? '<li>' + icon('repeat') + '<span>' + tr(RECURRENCE[ev.recurrence]) + (ev.recurrence_until ? ' · ' + tr('até {0}', parse(ev.recurrence_until).toLocaleDateString(locale())) : '') + '</span></li>' : '';
    $('evViewBody').innerHTML = '<div class="ev-view-head" style="--ev:' + esc(ev.color) + '"><span class="ev-dot"></span><h2 id="evViewTitle">' + esc(ev.title) + '</h2></div>'
      + '<ul class="ev-meta"><li>' + icon('calendar') + '<span>' + esc(longDate(day || ev.start_date)) + '</span></li><li>' + icon('clock') + '<span>' + esc(timeRange(ev)) + '</span></li>' + rec + '</ul>'
      + '<div class="ev-people"><h4>' + tr('Owners') + '</h4><div>' + people(ev.owners, 'owner') + '</div></div>'
      + '<div class="ev-people"><h4>' + tr('Participantes') + '</h4><div>' + people(ev.participants, 'part') + '</div></div>'
      + (ev.description ? '<div class="ev-desc"><h4>' + tr('Descrição') + '</h4><p>' + esc(ev.description) + '</p></div>' : '');
    dayModal.classList.remove('on');
    viewModal.classList.add('on');
    $('evViewEdit').focus();
  }

  function openDay(s) {
    dayOpen = s;
    $('dayModalTitle').textContent = longDate(s);
    $('dayModalList').innerHTML = eventsOn(parse(s)).map((ev) => '<button type="button" class="day-item" style="--ev:' + esc(ev.color) + '" data-ev="' + esc(ev.id) + '"><span class="ev-dot"></span><b>' + esc(ev.title) + '</b><small>' + esc(timeRange(ev)) + '</small></button>').join('');
    $('dayModalList').querySelectorAll('[data-ev]').forEach((b) => { b.onclick = () => openView(b.getAttribute('data-ev'), s); });
    dayModal.classList.add('on');
  }

  function renderColors(selected) {
    $('evColors').innerHTML = COLORS.map((c) => '<label class="swatch" style="--ev:' + c + '"><input type="radio" name="evColor" value="' + c + '" aria-label="' + tr('Cor {0}', c) + '"' + (c === selected ? ' checked' : '') + '><span aria-hidden="true"></span></label>').join('');
  }

  function syncTimeFields() {
    const allDay = $('evAllDay').checked;
    $('evStart').disabled = allDay;
    $('evEnd').disabled = allDay;
    $('evUntilWrap').hidden = $('evRecurrence').value === 'none';
  }

  function openForm(ev, date) {
    form.reset();
    $('eventError').textContent = '';
    $('evId').value = ev ? ev.id : '';
    $('eventFormTitle').textContent = tr(ev ? 'Editar evento' : 'Novo evento');
    $('evTitle').value = ev ? ev.title : '';
    $('evDesc').value = ev ? ev.description : '';
    $('evDate').value = ev ? ev.start_date : date;
    $('evAllDay').checked = !ev || !ev.start_time;
    $('evStart').value = ev && ev.start_time ? hhmm(ev.start_time) : '09:00';
    $('evEnd').value = ev && ev.end_time ? hhmm(ev.end_time) : '10:00';
    $('evRecurrence').value = ev ? ev.recurrence : 'none';
    $('evUntil').value = ev && ev.recurrence_until ? ev.recurrence_until : '';
    $('peopleList').innerHTML = knownPeople().map((p) => '<option value="' + esc(p) + '"></option>').join('');
    owners.set(ev ? ev.owners : []);
    participants.set(ev ? ev.participants : []);
    renderColors(ev ? ev.color.toUpperCase() : COLORS[0]);
    syncTimeFields();
    viewModal.classList.remove('on');
    dayModal.classList.remove('on');
    formModal.classList.add('on');
    $('evTitle').focus();
  }

  function readForm() {
    const allDay = $('evAllDay').checked;
    const pick = form.querySelector('input[name=evColor]:checked');
    const recurrence = Object.prototype.hasOwnProperty.call(RECURRENCE, $('evRecurrence').value) ? $('evRecurrence').value : 'none';
    return {
      title: $('evTitle').value.trim(),
      description: $('evDesc').value.trim(),
      start_date: $('evDate').value,
      start_time: allDay ? null : $('evStart').value || null,
      end_time: allDay ? null : $('evEnd').value || null,
      owners: owners.get(),
      participants: participants.get(),
      recurrence,
      recurrence_until: recurrence === 'none' ? null : $('evUntil').value || null,
      color: pick && COLORS.indexOf(pick.value) > -1 ? pick.value : COLORS[0],
    };
  }

  function validate(e) {
    if (!e.title) return 'Informe o título do evento.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.start_date)) return 'Informe a data do evento.';
    if (!e.owners.length) return 'Adicione pelo menos um owner.';
    if (!$('evAllDay').checked && !e.start_time) return 'Informe o horário de início ou marque dia inteiro.';
    if (e.start_time && e.end_time && e.end_time < e.start_time) return 'O horário de fim deve ser depois do início.';
    if (e.recurrence_until && e.recurrence_until < e.start_date) return 'A data final da recorrência deve ser depois da data do evento.';
    return '';
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    owners.commit();
    participants.commit();
    const data = readForm();
    const problem = validate(data);
    if (problem) { $('eventError').textContent = tr(problem); return; }
    const id = $('evId').value;
    const submit = $('eventSubmit');
    submit.disabled = true;
    $('eventError').textContent = '';
    saveEvent(data, id || undefined).then((saved) => {
      events = id ? events.map((x) => (x.id === id ? saved : x)) : events.concat(saved);
      formModal.classList.remove('on');
      const d = parse(saved.start_date);
      if (!id) cursor = new Date(d.getFullYear(), d.getMonth(), 1);
      onChange();
      showToast(tr(id ? 'Evento atualizado.' : 'Evento criado.'));
    }).catch(() => { $('eventError').textContent = tr('Não foi possível salvar o evento. Tente novamente.'); }).finally(() => { submit.disabled = false; });
  };

  $('evAllDay').onchange = syncTimeFields;
  $('evRecurrence').onchange = syncTimeFields;
  $('eventCancel').onclick = () => formModal.classList.remove('on');
  $('evViewClose').onclick = () => viewModal.classList.remove('on');
  $('evViewEdit').onclick = () => { if (viewing) openForm(viewing); };
  $('evViewDelete').onclick = () => {
    const ev = viewing;
    if (!ev) return;
    viewModal.classList.remove('on');
    confirmAction(tr('Excluir evento'), tr(ev.recurrence !== 'none' ? 'Excluir "{0}" e todas as suas repetições?' : 'Excluir o evento "{0}"?', ev.title), () => {
      deleteEvent(ev.id).then(() => { events = events.filter((x) => x.id !== ev.id); onChange(); showToast(tr('Evento excluído.')); }).catch(() => showToast(tr('Não foi possível excluir o evento.'), true));
    });
  };
  $('dayModalClose').onclick = () => dayModal.classList.remove('on');
  $('dayModalAdd').onclick = () => openForm(null, dayOpen);
  [formModal, viewModal, dayModal].forEach((m) => { m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('on'); }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') [formModal, viewModal, dayModal].forEach((m) => m.classList.remove('on')); });

  return {
    render,
    count: () => (events || []).length,
    // null while events are still loading (a fetch is started on first call), false if loading failed.
    today: () => {
      if (loadFailed) return false;
      if (!events) { load(); return null; }
      return eventsOn(new Date());
    },
    timeLabel: (ev) => timeRange(ev),
    // Occurrences from today onward, one entry per day an event happens; empty until events have loaded.
    upcoming: (days) => {
      if (!events) { if (!loadFailed) load(); return []; }
      const out = [];
      const base = new Date();
      for (let i = 0; i < days; i++) {
        const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
        eventsOn(day).forEach((ev) => out.push({ ev, day: iso(day), offset: i }));
      }
      return out;
    },
    all: () => (events || []).slice(),
    openEvent: (id, day) => openView(id, day),
    reload: () => { events = null; loadFailed = false; load(); },
  };
}

// Chips-style name input: Enter, comma or leaving the field turns the typed text into a chip.
function createTagInput(root) {
  let values = [];
  root.innerHTML = '<div class="tag-chips"></div><input type="text" list="peopleList" maxlength="60" autocomplete="off">';
  const chips = root.querySelector('.tag-chips');
  const input = root.querySelector('input');
  input.setAttribute('aria-labelledby', root.getAttribute('aria-labelledby'));

  function draw() {
    chips.innerHTML = '';
    values.forEach((v, i) => {
      const c = document.createElement('span');
      c.className = 'tag-chip';
      c.textContent = v;
      const x = document.createElement('button');
      x.type = 'button';
      x.innerHTML = icon('x');
      x.setAttribute('aria-label', tr('Remover {0}', v));
      x.onclick = () => { values.splice(i, 1); draw(); input.focus(); };
      c.appendChild(x);
      chips.appendChild(c);
    });
    input.placeholder = values.length ? '' : tr(root.getAttribute('data-placeholder'));
  }

  function commit() {
    input.value.split(',').map((s) => s.trim()).filter(Boolean).forEach((v) => {
      if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) values.push(v.slice(0, 60));
    });
    input.value = '';
    draw();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && !input.value && values.length) { values.pop(); draw(); }
  });
  input.addEventListener('input', (e) => { if (!e.inputType || e.inputType === 'insertReplacementText') commit(); });
  input.addEventListener('blur', commit);
  root.addEventListener('click', (e) => { if (e.target === root || e.target === chips) input.focus(); });

  return {
    get: () => values.slice(),
    set: (list) => { values = (list || []).slice(); input.value = ''; draw(); },
    commit,
  };
}
