import { tr, getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';
import { loadHolidays, todayIn, daysBetween } from '@/control-tower/holidays.js';

export const COMEX_CATEGORY = 'Comex';

// Business hours (08h-18h, Mon-Fri) tell whether a partner site is likely reachable right now.
const CLOCKS = [
  { city: 'Porto Real', country: 'Brasil', tz: 'America/Sao_Paulo', cc: 'BR', region: 'BR-RJ' },
  { city: 'Saginaw', country: 'EUA', tz: 'America/Detroit', cc: 'US', region: 'US-MI' },
  { city: 'Querétaro', country: 'México', tz: 'America/Mexico_City', cc: 'MX', region: 'MX-QUE' },
  { city: 'Tychy', country: 'Polônia', tz: 'Europe/Warsaw', cc: 'PL', region: 'PL-SL' },
  { city: 'Suzhou', country: 'China', tz: 'Asia/Shanghai', cc: 'CN', region: '' },
];

const SOON_DAYS = 14;
const AGENDA_DAYS = 45;
const AGENDA_MAX = 8;

const INCOTERMS = [
  ['EXW', 'Ex Works', 'Comprador assume transporte, riscos e desembaraço a partir do local do vendedor.', 'any'],
  ['FCA', 'Free Carrier', 'Vendedor entrega ao transportador indicado pelo comprador, já desembaraçado para exportação.', 'any'],
  ['CPT', 'Carriage Paid To', 'Vendedor paga o frete até o destino; o risco passa na entrega ao primeiro transportador.', 'any'],
  ['CIP', 'Carriage and Insurance Paid To', 'Igual ao CPT, com seguro da carga contratado pelo vendedor.', 'any'],
  ['DAP', 'Delivered at Place', 'Vendedor entrega no destino, pronto para descarga; comprador desembaraça a importação.', 'any'],
  ['DPU', 'Delivered at Place Unloaded', 'Vendedor entrega a carga já descarregada no local de destino.', 'any'],
  ['DDP', 'Delivered Duty Paid', 'Vendedor assume tudo até o destino, inclusive impostos de importação.', 'any'],
  ['FAS', 'Free Alongside Ship', 'Vendedor coloca a carga ao lado do navio no porto de embarque.', 'sea'],
  ['FOB', 'Free on Board', 'O risco passa ao comprador quando a carga está a bordo do navio.', 'sea'],
  ['CFR', 'Cost and Freight', 'Vendedor paga o frete marítimo; o risco passa com a carga a bordo.', 'sea'],
  ['CIF', 'Cost, Insurance and Freight', 'Igual ao CFR, com seguro marítimo contratado pelo vendedor.', 'sea'],
];

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function clockState(tz, now) {
  const loc = getLang() === 'en' ? 'en-US' : 'pt-BR';
  const time = new Intl.DateTimeFormat(loc, { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const day = new Intl.DateTimeFormat(loc, { timeZone: tz, weekday: 'short', day: '2-digit', month: '2-digit' }).format(now);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false, weekday: 'short' }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const weekday = parts.find((p) => p.type === 'weekday').value;
  const open = weekday !== 'Sat' && weekday !== 'Sun' && hour >= 8 && hour < 18;
  return { time, day, open };
}

const holName = (h) => (getLang() === 'en' ? h.en : h.pt);

function fmtDay(iso) {
  const loc = getLang() === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(loc, { timeZone: 'UTC', day: '2-digit', month: 'short' }).format(new Date(iso + 'T12:00:00Z'));
}

function fmtRange(h) {
  return h.start === h.end ? fmtDay(h.start) : fmtDay(h.start) + ' – ' + fmtDay(h.end);
}

function inDays(n) {
  if (n <= 0) return tr('hoje');
  return n === 1 ? tr('amanhã') : tr('em {0} dias', n);
}

// Today's holiday (if any) and the next one starting within SOON_DAYS, seen from the site's own calendar day.
function holidayState(c, now, hol) {
  const list = (hol && hol[c.cc]) || [];
  const today = todayIn(c.tz, now);
  const current = list.find((h) => h.start <= today && today <= h.end) || null;
  const next = list.find((h) => h.start > today && daysBetween(today, h.start) <= SOON_DAYS) || null;
  return { current, next, nextIn: next ? daysBetween(today, next.start) : 0 };
}

function clockHtml(c, now, hol) {
  const s = clockState(c.tz, now);
  const h = holidayState(c, now, hol);
  const open = s.open && !h.current;
  const status = h.current ? 'Feriado' : open ? 'Expediente' : 'Fora do horário';
  let note = '';
  if (h.current) note = '<div class="cx-clock-hol now" title="' + esc(holName(h.current) + ' · ' + fmtRange(h.current)) + '">' + icon('calendar') + '<span>' + esc(holName(h.current)) + '</span></div>';
  else if (h.next) note = '<div class="cx-clock-hol soon" title="' + esc(holName(h.next) + ' · ' + fmtRange(h.next)) + '">' + icon('bell') + '<span>' + esc(inDays(h.nextIn)) + ' · ' + esc(holName(h.next)) + '</span></div>';
  return '<div class="cx-clock' + (open ? ' open' : '') + (h.current ? ' holiday' : '') + '" data-tz="' + esc(c.tz) + '" role="listitem">'
    + '<div class="cx-clock-top"><span>' + esc(c.city) + '</span><small>' + esc(tr(c.country)) + '</small></div>'
    + '<b class="cx-clock-time">' + esc(s.time) + '</b>'
    + '<div class="cx-clock-foot"><span class="cx-clock-day">' + esc(s.day) + '</span><span class="cx-clock-status"><i></i>' + esc(tr(status)) + '</span></div>'
    + note + '</div>';
}

function agendaHtml(now, hol) {
  if (hol === null) return '<p class="cx-hol-msg">' + esc(tr('Carregando feriados...')) + '</p>';
  if (hol === false) return '<p class="cx-hol-msg">' + esc(tr('Calendário de feriados indisponível no momento.')) + '</p>';
  const items = [];
  CLOCKS.forEach((c) => {
    const today = todayIn(c.tz, now);
    (hol[c.cc] || []).forEach((h) => {
      if (h.end < today) return;
      const n = daysBetween(today, h.start);
      if (n <= AGENDA_DAYS) items.push({ c, h, n });
    });
  });
  items.sort((a, b) => a.n - b.n || a.c.city.localeCompare(b.c.city));
  if (!items.length) return '<p class="cx-hol-msg">' + esc(tr('Nenhum feriado nos próximos {0} dias.', AGENDA_DAYS)) + '</p>';
  return '<ul class="cx-hol-list">' + items.slice(0, AGENDA_MAX).map(({ c, h, n }) => '<li class="' + (n <= 0 ? 'now' : n <= SOON_DAYS ? 'soon' : '') + '">'
    + '<span class="cx-hol-cc">' + esc(c.cc) + '</span>'
    + '<div class="cx-hol-id"><b>' + esc(holName(h)) + '</b><small>' + esc(tr(c.country)) + ' · ' + esc(fmtRange(h)) + (h.estimated ? ' · ' + esc(tr('período estimado')) : '') + '</small></div>'
    + '<span class="cx-hol-when">' + esc(n <= 0 ? tr('em andamento') : inDays(n)) + '</span></li>').join('') + '</ul>';
}

function incotermHtml(t) {
  return '<div class="cx-inco-item"><div class="cx-inco-code"><b>' + t[0] + '</b><span class="cx-inco-mode ' + t[3] + '">' + esc(tr(t[3] === 'sea' ? 'Marítimo' : 'Qualquer modal')) + '</span></div>'
    + '<strong>' + esc(t[1]) + '</strong><p>' + esc(tr(t[2])) + '</p></div>';
}

export function comexHubHtml() {
  const now = new Date();
  return '<section class="cx-hub">'
    + '<div class="cx-block-head"><span>' + icon('clock') + esc(tr('Fusos das plantas e parceiros')) + '</span><small>' + esc(tr('Expediente considerado: 08h às 18h, segunda a sexta')) + '</small></div>'
    + '<div class="cx-clocks" role="list">' + CLOCKS.map((c) => clockHtml(c, now, null)).join('') + '</div>'
    + '<div class="cx-hol"><div class="cx-hol-head"><span>' + icon('calendar') + esc(tr('Próximos feriados')) + '</span><small>' + esc(tr('Plantas e parceiros · próximos {0} dias', AGENDA_DAYS)) + '</small></div><div data-hol-agenda aria-live="polite">' + agendaHtml(now, null) + '</div></div>'
    + '<details class="cx-inco"><summary><span>' + icon('book') + esc(tr('Incoterms 2020 · consulta rápida')) + '</span><small>' + esc(tr('Quem paga o frete e quando o risco muda de mãos')) + '</small></summary>'
    + '<div class="cx-inco-grid">' + INCOTERMS.map(incotermHtml).join('') + '</div></details>'
    + '</section>';
}

// The interval stops itself once the Comex view is replaced, so no timer outlives the screen.
export function startComexClocks(root) {
  const hub = root.querySelector('.cx-hub');
  if (!hub) return;
  let hol = null;
  const paint = () => {
    const now = new Date();
    hub.querySelectorAll('[data-tz]').forEach((el) => {
      const c = CLOCKS.find((x) => x.tz === el.getAttribute('data-tz'));
      if (c) el.outerHTML = clockHtml(c, now, hol || null);
    });
    hub.querySelector('[data-hol-agenda]').innerHTML = agendaHtml(now, hol);
  };
  const year = new Date().getFullYear();
  loadHolidays(CLOCKS, [year, year + 1])
    .then((h) => { hol = h; })
    .catch(() => { hol = false; })
    .then(() => { if (hub.isConnected) paint(); });
  const timer = setInterval(() => {
    if (!hub.isConnected) { clearInterval(timer); return; }
    paint();
  }, 30000);
}

const MAX_CONTACTS = 12;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

function cleanContact(c) {
  const pick = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const email = pick(c && c.email, 120);
  const phone = pick(c && c.phone, 30).replace(/[^\d+()\s.-]/g, '');
  return { name: pick(c && c.name, 80), role: pick(c && c.role, 80), email: EMAIL_RE.test(email) ? email : '', phone };
}

export function contactsOf(d) {
  return Array.isArray(d && d.contacts) ? d.contacts.map(cleanContact).filter((c) => c.name) : [];
}

export function contactsCardHtml(d) {
  if (d.category !== COMEX_CATEGORY) return '';
  const list = contactsOf(d);
  const manage = '<button type="button" class="cx-contacts-edit" data-edit="' + esc(d.id) + '">' + icon(list.length ? 'pencil' : 'plus') + esc(tr(list.length ? 'Editar contatos' : 'Adicionar contato')) + '</button>';
  if (!list.length) return '<div class="cx-contacts empty"><span>' + icon('users') + esc(tr('Nenhum contato cadastrado')) + '</span>' + manage + '</div>';
  const rows = list.map((c) => '<li><span class="cx-contact-av" aria-hidden="true">' + esc(c.name.charAt(0).toUpperCase()) + '</span><div class="cx-contact-id"><b>' + esc(c.name) + '</b>' + (c.role ? '<small>' + esc(c.role) + '</small>' : '') + '</div>'
    + '<div class="cx-contact-acts">'
    + (c.email ? '<a href="mailto:' + esc(c.email) + '" title="' + esc(c.email) + '" aria-label="' + esc(tr('E-mail para {0}', c.name)) + '">' + icon('mail') + '</a>' : '')
    + (c.phone ? '<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, '')) + '" title="' + esc(c.phone) + '" aria-label="' + esc(tr('Ligar para {0}', c.name)) + '">' + icon('phone') + '</a>' : '')
    + '</div></li>').join('');
  return '<details class="cx-contacts"><summary>' + icon('users') + '<span>' + esc(tr(list.length === 1 ? '{0} contato' : '{0} contatos', list.length)) + '</span>' + icon('chevronDown') + '</summary><ul>' + rows + '</ul>' + manage + '</details>';
}

function contactRowHtml(c) {
  const f = (key, label, type, max, ph) => '<label>' + esc(tr(label)) + '<input data-contact="' + key + '" type="' + type + '" maxlength="' + max + '" value="' + esc(c[key]) + '" placeholder="' + esc(tr(ph)) + '"></label>';
  return '<div class="contact-row">'
    + '<div class="form-row">' + f('name', 'Nome', 'text', 80, 'Ex.: Maria Souza') + f('role', 'Função / empresa', 'text', 80, 'Ex.: Atendimento DHL') + '</div>'
    + '<div class="form-row">' + f('email', 'E-mail', 'email', 120, 'nome@empresa.com') + f('phone', 'Telefone', 'tel', 30, '+55 24 99999-0000') + '</div>'
    + '<button type="button" class="contact-remove" data-contact-remove aria-label="' + esc(tr('Remover contato')) + '" title="' + esc(tr('Remover contato')) + '">' + icon('trash') + '</button></div>';
}

function syncContactsAdd() {
  document.getElementById('addContactBtn').disabled = document.querySelectorAll('#contactsList .contact-row').length >= MAX_CONTACTS;
}

export function syncContactsField() {
  document.getElementById('contactsField').hidden = document.getElementById('category').value !== COMEX_CATEGORY;
}

export function fillContactsField(d) {
  document.getElementById('contactsList').innerHTML = contactsOf(d).map(contactRowHtml).join('');
  syncContactsField();
  syncContactsAdd();
}

export function bindContactsField() {
  const list = document.getElementById('contactsList');
  document.getElementById('addContactBtn').onclick = () => {
    list.insertAdjacentHTML('beforeend', contactRowHtml(cleanContact({})));
    list.lastElementChild.querySelector('input').focus();
    syncContactsAdd();
  };
  list.onclick = (e) => {
    const b = e.target.closest('[data-contact-remove]');
    if (!b) return;
    b.closest('.contact-row').remove();
    syncContactsAdd();
  };
}

// Returns an error message for the first invalid row so the form can stay open, or the cleaned list.
export function readContactsField() {
  const rows = Array.from(document.querySelectorAll('#contactsList .contact-row')).map((row) => {
    const v = (k) => row.querySelector('[data-contact="' + k + '"]').value.trim();
    return { name: v('name'), role: v('role'), email: v('email'), phone: v('phone') };
  }).filter((c) => c.name || c.role || c.email || c.phone);
  for (const c of rows) {
    if (!c.name) return { error: tr('Informe o nome de cada contato.') };
    if (c.email && !EMAIL_RE.test(c.email)) return { error: tr('E-mail inválido para {0}.', c.name) };
  }
  return { contacts: rows.slice(0, MAX_CONTACTS).map(cleanContact) };
}
