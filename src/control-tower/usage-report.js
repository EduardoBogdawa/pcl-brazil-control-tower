import { icon, portalIcon, categoryTint } from '@/control-tower/icons.js';
import { tr, getLang } from '@/control-tower/i18n';
import { fetchUsageReport } from '@/control-tower/store';

const PERIODS = [7, 30, 90];

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function locale() { return getLang() === 'en' ? 'en-US' : 'pt-BR'; }
function num(n) { return n.toLocaleString(locale()); }

function parseDay(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dayLabel(iso) {
  return new Intl.DateTimeFormat(locale(), { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(parseDay(iso)).replace('.', '');
}

function periodDays(start, today) {
  const out = [];
  for (let t = parseDay(start).getTime(), end = parseDay(today).getTime(); t <= end; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

function trendChip(cur, prev) {
  if (!prev) return cur ? '<span class="us-trend up">' + tr('novo') + '</span>' : '';
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return '<span class="us-trend flat">0%</span>';
  return '<span class="us-trend ' + (pct > 0 ? 'up' : 'down') + '">' + (pct > 0 ? '+' : '') + pct + '%</span>';
}

function kpi(value, label, sub, extra) {
  return '<div class="us-kpi"><b>' + value + '</b><span>' + esc(label) + '</span><small>' + sub + '</small>' + (extra || '') + '</div>';
}

function chartHtml(report) {
  const counts = new Map(report.daily.map((d) => [d.day, d.count]));
  const days = periodDays(report.start, report.today);
  const peak = Math.max(0, ...days.map((d) => counts.get(d) || 0)), max = Math.max(1, peak);
  const bars = days.map((d, i) => {
    const c = counts.get(d) || 0;
    return '<i style="--h:' + Math.max(c ? 6 : 2, Math.round((c / max) * 100)) + '%;--i:' + i + '"' + (c ? '' : ' class="zero"') + ' title="' + esc(dayLabel(d) + ': ' + num(c) + ' ' + tr(c === 1 ? 'abertura' : 'aberturas')) + '"></i>';
  }).join('');
  return '<section class="us-block"><header><b>' + tr('Aberturas por dia') + '</b><small>' + tr('pico de {0}', num(peak)) + '</small></header>'
    + '<div class="us-chart' + (days.length > 40 ? ' dense' : '') + '" role="img" aria-label="' + esc(tr('Aberturas por dia')) + '">' + bars + '</div>'
    + '<div class="us-axis"><span>' + esc(dayLabel(report.start)) + '</span><span>' + esc(tr('Hoje')) + '</span></div></section>';
}

function rankingHtml(rows, max) {
  if (!rows.length) return '<div class="us-empty">' + icon('trend') + '<span>' + tr('Nenhum painel foi aberto neste período.') + '</span></div>';
  return '<ol class="us-rank">' + rows.map(({ d, cur, prev }, i) => '<li style="--accent:' + categoryTint(d.category) + ';--w:' + Math.max(6, Math.round((cur / max) * 100)) + '%;--i:' + i + '"><button type="button" data-usage-open="' + esc(d.id) + '">'
    + '<span class="us-pos">' + String(i + 1).padStart(2, '0') + '</span>' + portalIcon(d)
    + '<span class="us-txt"><b>' + esc(d.name) + '</b><span class="us-bar" aria-hidden="true"><i></i></span></span>'
    + '<span class="us-num">' + num(cur) + trendChip(cur, prev) + '</span></button></li>').join('') + '</ol>';
}

function categoriesHtml(rows, categoryLabel) {
  const byCat = new Map();
  rows.forEach(({ d, cur }) => byCat.set(d.category, (byCat.get(d.category) || 0) + cur));
  const list = [...byCat.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  if (!list.length) return '';
  const total = list.reduce((t, [, n]) => t + n, 0);
  return '<section class="us-block"><header><b>' + tr('Por categoria') + '</b><small>' + tr('participação nas aberturas') + '</small></header><div class="us-mix" aria-hidden="true">'
    + list.map(([c, n]) => '<i style="--accent:' + categoryTint(c) + ';flex:' + n + '"></i>').join('') + '</div><ul class="us-cats">'
    + list.map(([c, n]) => '<li style="--accent:' + categoryTint(c) + '"><span>' + esc(categoryLabel(c)) + '</span><b>' + Math.round((n / total) * 100) + '%</b><small>' + num(n) + '</small></li>').join('') + '</ul></section>';
}

function unusedHtml(list, categoryLabel) {
  if (!list.length) return '';
  return '<details class="us-block us-unused"><summary><b>' + tr('Sem uso no período') + '</b><span class="us-count">' + list.length + '</span></summary><ul>'
    + list.map((d) => '<li><button type="button" data-usage-open="' + esc(d.id) + '">' + portalIcon(d) + '<span><b>' + esc(d.name) + '</b><small>' + esc(categoryLabel(d.category)) + '</small></span></button></li>').join('')
    + '</ul><p class="us-hint">' + tr('Avalie se esses painéis ainda são necessários ou se a equipe precisa conhecê-los.') + '</p></details>';
}

function reportHtml(report, dashboards, categoryLabel) {
  const byId = new Map(report.panels.map((p) => [p.panel_id, p]));
  const rows = dashboards.map((d) => { const p = byId.get(d.id); return { d, cur: (p && p.cur) || 0, prev: (p && p.prev) || 0 }; });
  const used = rows.filter((r) => r.cur > 0).sort((a, b) => b.cur - a.cur || a.d.name.localeCompare(b.d.name, 'pt-BR'));
  const unused = rows.filter((r) => !r.cur).map((r) => r.d).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const cur = rows.reduce((t, r) => t + r.cur, 0), prev = rows.reduce((t, r) => t + r.prev, 0);
  const adoption = dashboards.length ? Math.round((used.length / dashboards.length) * 100) : 0;
  const prevNote = prev ? trendChip(cur, prev) + ' ' + esc(tr('vs. {0} dias anteriores', report.days)) : esc(tr('sem período anterior para comparar'));
  return '<div class="us-kpis">'
    + kpi(num(cur), tr('Aberturas'), prevNote)
    + kpi(adoption + '%', tr('Painéis em uso'), esc(tr('{0} de {1} painéis', used.length, dashboards.length)), '<span class="us-meter" aria-hidden="true"><i style="--w:' + adoption + '%"></i></span>')
    + kpi(num(unused.length), tr('Sem uso'), esc(tr('nenhuma abertura no período')))
    + '</div>'
    + chartHtml(report)
    + '<section class="us-block"><header><b>' + tr('Mais utilizados') + '</b><small>' + tr('tendência vs. período anterior') + '</small></header>' + rankingHtml(used.slice(0, 10), used.length ? used[0].cur : 1) + '</section>'
    + categoriesHtml(rows, categoryLabel)
    + unusedHtml(unused, categoryLabel);
}

export function createUsageReport({ sheet, getDashboards, categoryLabel, openPanel, findPanel }) {
  let days = 30, seq = 0;

  function toolbar(since) {
    return '<div class="us-bar-top"><div class="us-periods" role="group" aria-label="' + esc(tr('Período')) + '">'
      + PERIODS.map((p) => '<button type="button" data-usage-days="' + p + '" aria-pressed="' + (p === days) + '"' + (p === days ? ' class="on"' : '') + '>' + tr('{0} dias', p) + '</button>').join('')
      + '</div><p class="us-privacy">' + icon('lock') + '<span>' + tr('Contagem anônima por painel. Não registramos quem abriu.') + (since ? ' ' + tr('Histórico diário desde {0}.', dayLabel(since)) : '') + '</span></p></div>';
  }

  function load() {
    const mine = ++seq;
    sheet.setBody(toolbar(null) + '<div class="sheet-loading"><span class="spin"></span>' + tr('Carregando...') + '</div>');
    fetchUsageReport(days).then((report) => {
      if (mine !== seq) return;
      sheet.setBody(toolbar(report.since) + '<div class="us-report">' + reportHtml(report, getDashboards(), categoryLabel) + '</div>');
    }).catch(() => {
      if (mine !== seq) return;
      sheet.setBody(toolbar(null) + '<p class="form-error">' + tr('Não foi possível carregar o relatório de uso. Verifique a conexão e tente novamente.') + '</p>');
    });
  }

  function onClick(e) {
    const period = e.target.closest('[data-usage-days]');
    if (period) { days = Number(period.getAttribute('data-usage-days')); load(); return; }
    const open = e.target.closest('[data-usage-open]');
    if (open) { const d = findPanel(open.getAttribute('data-usage-open')); if (d) { sheet.close(); openPanel(d); } }
  }

  return {
    open() {
      sheet.open({ ico: 'activity', title: tr('Uso dos painéis'), sub: tr('Quanto as ferramentas estão sendo usadas pela equipe.'), body: '', onClick });
      load();
    },
  };
}
