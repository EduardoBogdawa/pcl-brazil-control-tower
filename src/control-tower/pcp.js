import { tr, getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';
import { rowsByGroup, customGroupsOf } from '@/control-tower/panel-groups.js';

export const PCP_CATEGORY = 'PCP';

const STAGES = [
  { id: 'edi', title: 'EDI', glyph: 'repeat', horizon: 'Curto prazo · diário', text: 'Demanda que o cliente envia: programações firmes e previsões.' },
  { id: 'po', title: 'PO Clientes', glyph: 'checkSquare', horizon: 'Firme · pedido a pedido', text: 'Pedidos confirmados, carteira em aberto e atendimento.' },
  { id: 'mps', title: 'MPS', glyph: 'calendar', horizon: 'Médio prazo · semanal', text: 'Quanto produzir de cada item, semana a semana, dentro da capacidade.' },
  { id: 'sop', title: 'S&OP', glyph: 'trend', horizon: 'Longo prazo · mensal', text: 'Equilíbrio entre demanda e capacidade e decisões do ciclo mensal.' },
];

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isBusinessDay(d) {
  const w = d.getDay();
  return w !== 0 && w !== 6;
}

function businessDays(from, to) {
  let n = 0;
  for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) if (isBusinessDay(d)) n++;
  return n;
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Weekends only; plant holidays are not known here, so the hub says so next to the numbers.
function planningCalendar(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const total = businessDays(monthStart, monthEnd);
  const elapsed = businessDays(monthStart, today);
  const current = isBusinessDay(today) ? elapsed : null;
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const q = Math.floor(today.getMonth() / 3);
  const qStart = new Date(today.getFullYear(), q * 3, 1);
  const qEnd = new Date(today.getFullYear(), q * 3 + 3, 0);
  const qWeeks = Math.round((qEnd - qStart) / (7 * 86400000));
  const qWeek = Math.min(qWeeks, Math.floor((today - qStart) / (7 * 86400000)) + 1);
  return {
    week: isoWeek(today), monday, sunday, total, current, remaining: total - elapsed,
    toClose: Math.round((monthEnd - today) / 86400000), monthEnd, quarter: q + 1, qWeek, qWeeks,
  };
}

function fmt(d, opts) {
  return new Intl.DateTimeFormat(getLang() === 'en' ? 'en-US' : 'pt-BR', opts).format(d);
}

function statHtml(cls, ico, label, value, sub, ratio) {
  return '<div class="pcp-stat ' + cls + '"><span class="pcp-stat-ico">' + icon(ico) + '</span><div class="pcp-stat-body"><small>' + esc(label) + '</small><b>' + value + '</b><span>' + esc(sub) + '</span>'
    + (ratio == null ? '' : '<i class="pcp-bar" style="--p:' + Math.round(Math.min(1, Math.max(0, ratio)) * 100) + '%"></i>') + '</div></div>';
}

function calendarHtml(now) {
  const c = planningCalendar(now);
  const range = fmt(c.monday, { day: '2-digit', month: 'short' }) + ' – ' + fmt(c.sunday, { day: '2-digit', month: 'short' });
  const dayValue = c.current ? esc(String(c.current)) + '<em>/' + c.total + '</em>' : '<em>' + esc(tr('Fim de semana')) + '</em>';
  return '<div class="pcp-cal" role="list">'
    + statHtml('s-week', 'calendar', tr('Semana'), 'W' + String(c.week).padStart(2, '0'), range)
    + statHtml('s-day', 'activity', tr('Dia útil do mês'), dayValue, fmt(now, { month: 'long', year: 'numeric' }), (c.total - c.remaining) / c.total)
    + statHtml('s-left', 'clock', tr('Dias úteis restantes'), esc(String(c.remaining)), c.toClose === 0 ? tr('Fechamento do mês hoje') : tr(c.toClose === 1 ? 'Fechamento em {0} dia · {1}' : 'Fechamento em {0} dias · {1}', c.toClose, fmt(c.monthEnd, { day: '2-digit', month: '2-digit' })))
    + statHtml('s-q', 'target', tr('Trimestre'), 'Q' + c.quarter, tr('Semana {0} de {1}', c.qWeek, c.qWeeks), c.qWeek / c.qWeeks)
    + '</div>';
}

function stageHtml(s, i, list, safeUrl) {
  const pending = list.filter((d) => !safeUrl(d.url) && !(d.links && d.links.length)).length;
  const meta = !list.length ? tr('Nenhum painel ainda') : pending ? tr(pending === 1 ? '{0} link pendente' : '{0} links pendentes', pending) : tr(list.length === 1 ? '{0} painel pronto' : '{0} painéis prontos', list.length);
  const state = !list.length ? 'empty' : pending ? 'pending' : 'ready';
  return '<li class="pcp-step ' + state + '" style="--i:' + i + '"><button type="button" data-pcp-step="' + esc(s.id) + '" aria-label="' + esc(tr(list.length ? 'Ver painéis de {0}' : 'Adicionar painel em {0}', s.title)) + '">'
    + '<span class="pcp-step-top"><span class="pcp-step-n">' + String(i + 1).padStart(2, '0') + '</span><span class="pcp-step-ico">' + icon(s.glyph) + '</span></span>'
    + '<b>' + esc(s.title) + '</b><span class="pcp-step-tag">' + esc(tr(s.horizon)) + '</span><p>' + esc(tr(s.text)) + '</p>'
    + '<span class="pcp-step-foot"><i></i>' + esc(meta) + '<span class="pcp-step-go">' + icon(list.length ? 'arrow' : 'plus') + '</span></span>'
    + '</button></li>';
}

export function pcpHubHtml(dashboards, safeUrl) {
  const groups = rowsByGroup(PCP_CATEGORY, dashboards);
  const stages = STAGES.concat(customGroupsOf(PCP_CATEGORY, dashboards).map((g) => ({
    id: g.id, title: g.title, glyph: 'folder', horizon: 'Seção da equipe', text: 'Seção criada pela equipe para outros painéis do PCP.',
  })));
  return '<section class="pcp-hub">'
    + '<div class="pcp-block-head"><span>' + icon('calendar') + esc(tr('Calendário de planejamento')) + '</span><small>' + esc(tr('Dias úteis de segunda a sexta, sem considerar feriados')) + '</small></div>'
    + calendarHtml(new Date())
    + '<div class="pcp-block-head"><span>' + icon('repeat') + esc(tr('Fluxo de planejamento')) + '</span><small>' + esc(tr('Da demanda do cliente à decisão mensal · clique em uma etapa')) + '</small></div>'
    + '<ol class="pcp-flow">' + stages.map((s, i) => stageHtml(s, i, groups[s.id] || [], safeUrl)).join('') + '</ol>'
    + '</section>';
}

// Steps with panels jump to their section; empty steps open the form already pointed at that stage.
export function bindPcpHub(root, onAdd) {
  root.querySelectorAll('[data-pcp-step]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-pcp-step');
      const head = root.querySelector('.panel-group-head[data-group="' + id + '"]');
      if (!head) { onAdd(id); return; }
      head.scrollIntoView({ behavior: 'smooth', block: 'start' });
      head.classList.remove('flash');
      void head.offsetWidth;
      head.classList.add('flash');
    });
  });
}
