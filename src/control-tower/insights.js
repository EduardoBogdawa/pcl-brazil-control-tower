import { icon, portalIcon, categoryTint } from '@/control-tower/icons.js';
import { tr, getLang } from '@/control-tower/i18n';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function todayIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysUntil(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - a) / 86400000);
}

// One pass over the data that both the overview indicators and the presentation mode read from.
export function computeInsights({ dashboards, tasks, todayTasks, upcoming, safeUrl }) {
  const pending = dashboards.filter((d) => !safeUrl(d.url) && !(d.links && d.links.length) && !d.changeType);
  const broken = dashboards.filter((d) => d.linkHealth === 'broken');
  const weekAgo = Date.now() - 7 * 86400000;
  const fresh = dashboards.filter((d) => d.createdAt && Date.parse(d.createdAt) > weekAgo);
  const workshops = dashboards
    .filter((d) => d.workshopDate)
    .map((d) => ({ d, in: daysUntil(d.workshopDate) }))
    .filter((x) => x.in !== null && x.in >= 0 && x.in <= 30)
    .sort((a, b) => a.in - b.in);
  const reports = dashboards.reduce((t, d) => t + (d.links && d.links.length ? d.links.length : 0), 0);
  const eventsToday = upcoming.filter((x) => x.offset === 0);
  const eventsWeek = upcoming.filter((x) => x.offset < 7);
  return {
    panels: dashboards.length, reports, tasks: tasks.length, todayTasks, pending, broken, fresh, workshops,
    eventsToday, eventsWeek, ready: dashboards.filter((d) => !pending.includes(d) && !broken.includes(d)).length,
  };
}

function kpi(cls, ico, value, label, sub, go, ratio) {
  const ring = typeof ratio === 'number'
    ? '<svg class="kpi-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5"/><circle class="kpi-ring-on" cx="18" cy="18" r="15.5" style="--p:' + Math.round(ratio * 100) + '"/></svg>'
    : '';
  return '<button type="button" class="kpi ' + cls + '"' + (go ? ' data-kpi-go="' + esc(go) + '"' : '') + '><span class="kpi-ico">' + icon(ico) + '</span>' + ring
    + '<span class="kpi-body"><b data-count="' + value + '">' + value + '</b><span class="kpi-label">' + esc(label) + '</span><small>' + esc(sub) + '</small></span></button>';
}

export function kpiHtml(s) {
  const ready = s.panels ? s.ready / s.panels : 0;
  return '<section class="kpi-strip" aria-label="' + esc(tr('Indicadores')) + '">'
    + kpi('k-ready', 'activity', s.ready, tr('Painéis prontos'), tr('{0}% com link configurado', Math.round(ready * 100)), '', ready)
    + kpi('k-pending', 'alert', s.pending.length, tr('Links pendentes'), s.pending.length ? tr('Toque para revisar') : tr('Tudo configurado'), s.pending.length ? '#pending' : '')
    + kpi('k-broken', 'alert', s.broken.length, tr('Links com falha'), tr('Falhas informadas pela equipe'), '#broken')
    + '</section>';
}

export function topUsedHtml(stats, dashboards, categoryLabel) {
  const byId = new Map(dashboards.map((d) => [d.id, d]));
  const rows = stats.map((s) => ({ s, d: byId.get(s.panel_id) })).filter((x) => x.d).slice(0, 6);
  const max = rows.length ? rows[0].s.open_count : 1;
  const body = rows.length
    ? '<ol class="top-list">' + rows.map(({ s, d }, i) => '<li style="--accent:' + categoryTint(d.category) + ';--w:' + Math.max(8, Math.round((s.open_count / max) * 100)) + '%;--i:' + i + '"><button type="button" data-top-open="' + esc(d.id) + '"><span class="top-rank">' + String(i + 1).padStart(2, '0') + '</span>' + portalIcon(d)
      + '<span class="top-txt"><b>' + esc(d.name) + '</b><small>' + esc(categoryLabel(d.category)) + '</small></span><span class="top-bar" aria-hidden="true"><i></i></span><span class="top-count">' + s.open_count.toLocaleString(getLang() === 'en' ? 'en-US' : 'pt-BR') + '<small>' + tr(s.open_count === 1 ? 'acesso' : 'acessos') + '</small></span></button></li>').join('') + '</ol>'
    : '<div class="top-empty">' + icon('trend') + '<span>' + tr('O ranking aparece assim que a equipe começar a abrir os painéis.') + '</span></div>';
  return '<section class="top-used"><div class="ov-title"><h3>' + tr('Mais acessados pela equipe') + '</h3><small>' + tr('Ranking compartilhado de aberturas') + '</small></div>' + body + '</section>';
}

export function pendingListHtml(pending, categoryLabel) {
  return '<ul class="pending-list">' + pending.map((d) => '<li><button type="button" data-pending-edit="' + esc(d.id) + '">' + portalIcon(d) + '<span><b>' + esc(d.name) + '</b><small>' + esc(categoryLabel(d.category)) + '</small></span>' + icon('pencil') + '</button></li>').join('') + '</ul>';
}
