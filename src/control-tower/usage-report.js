import { icon, portalIcon, categoryTint } from '@/control-tower/icons.js';
import { tr, getLang } from '@/control-tower/i18n';
import { fetchUsageReport } from '@/control-tower/store';

const PERIODS = [1, 3, 6, 12];

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

function monthLabel(iso, withYear) {
  const opts = withYear ? { month: 'short', year: '2-digit', timeZone: 'UTC' } : { month: 'short', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale(), opts).format(parseDay(iso)).replace(/\./g, '');
}

function periodMonths(start, today) {
  const out = [], s = parseDay(start), e = parseDay(today);
  const d = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1));
  while (d <= e) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return out;
}

function periodLabel(months) {
  return months === 1 ? tr('Este mês') : tr('{0} meses', months);
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
  const counts = new Map(report.monthly.map((m) => [String(m.month).slice(0, 10), m.count]));
  const months = periodMonths(report.start, report.today);
  const multiYear = months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4);
  const peak = Math.max(0, ...months.map((m) => counts.get(m) || 0)), max = Math.max(1, peak);
  const cols = months.map((m, i) => {
    const c = counts.get(m) || 0, current = i === months.length - 1;
    return '<li style="--h:' + Math.max(c ? 6 : 2, Math.round((c / max) * 100)) + '%;--i:' + i + '"' + (c ? '' : ' class="zero"') + '>'
      + '<span class="us-mval">' + num(c) + '</span><span class="us-mcol"><i></i></span>'
      + '<span class="us-mlbl">' + esc(monthLabel(m, multiYear)) + (current ? '<small>' + tr('em andamento') + '</small>' : '') + '</span></li>';
  }).join('');
  return '<section class="us-block"><header><b>' + tr('Aberturas por mês') + '</b><small>' + tr('pico de {0}', num(peak)) + '</small></header>'
    + '<ol class="us-months" aria-label="' + esc(tr('Aberturas por mês')) + '">' + cols + '</ol></section>';
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
  const prevLabel = report.months === 1 ? tr('vs. mês anterior') : tr('vs. {0} meses anteriores', report.months);
  const prevNote = prev ? trendChip(cur, prev) + ' ' + esc(prevLabel) : esc(tr('sem período anterior para comparar'));
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
  let months = 3, seq = 0;

  function toolbar(since) {
    return '<div class="us-bar-top"><div class="us-periods" role="group" aria-label="' + esc(tr('Período')) + '">'
      + PERIODS.map((p) => '<button type="button" data-usage-months="' + p + '" aria-pressed="' + (p === months) + '"' + (p === months ? ' class="on"' : '') + '>' + periodLabel(p) + '</button>').join('')
      + '</div><p class="us-privacy">' + icon('lock') + '<span>' + tr('Contagem anônima por painel. Não registramos quem abriu.') + (since ? ' ' + tr('Contagem iniciada em {0}.', dayLabel(since)) : '') + '</span></p></div>';
  }

  function load() {
    const mine = ++seq;
    sheet.setBody(toolbar(null) + '<div class="sheet-loading"><span class="spin"></span>' + tr('Carregando...') + '</div>');
    fetchUsageReport(months).then((report) => {
      if (mine !== seq) return;
      sheet.setBody(toolbar(report.since) + '<div class="us-report">' + reportHtml(report, getDashboards(), categoryLabel) + '</div>');
    }).catch(() => {
      if (mine !== seq) return;
      sheet.setBody(toolbar(null) + '<p class="form-error">' + tr('Não foi possível carregar o relatório de uso. Verifique a conexão e tente novamente.') + '</p>');
    });
  }

  function onClick(e) {
    const period = e.target.closest('[data-usage-months]');
    if (period) { months = Number(period.getAttribute('data-usage-months')); load(); return; }
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
