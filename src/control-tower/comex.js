import { tr, getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';

export const COMEX_CATEGORY = 'Comex';

const GROUPS = [
  { id: 'agentes', title: 'Agentes de carga e courier', hint: 'Cotações, coletas e rastreio de remessas aéreas e expressas', glyph: 'layers' },
  { id: 'processos', title: 'Processos e desembaraço', hint: 'Acompanhamento de importação, exportação e documentos', glyph: 'folder' },
  { id: 'rastreio', title: 'Rastreamento marítimo e de cargas', hint: 'Navios, contêineres e status de embarque', glyph: 'globe' },
  { id: 'outros', title: 'Outros portais', hint: 'Demais acessos do time de comércio exterior', glyph: 'link' },
];

// Business hours (08h-18h, Mon-Fri) tell whether a partner site is likely reachable right now.
const CLOCKS = [
  { city: 'Porto Real', country: 'Brasil', tz: 'America/Sao_Paulo' },
  { city: 'Saginaw', country: 'EUA', tz: 'America/Detroit' },
  { city: 'Querétaro', country: 'México', tz: 'America/Mexico_City' },
  { city: 'Tychy', country: 'Polônia', tz: 'Europe/Warsaw' },
  { city: 'Suzhou', country: 'China', tz: 'Asia/Shanghai' },
];

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

function groupOf(d) {
  return GROUPS.some((g) => g.id === d.comexGroup) ? d.comexGroup : 'outros';
}

export function sortComexRows(rows, byName) {
  const order = (d) => GROUPS.findIndex((g) => g.id === groupOf(d));
  return rows.slice().sort((a, b) => order(a) - order(b) || byName(a, b));
}

export function comexGroupHead(d, prev) {
  const id = groupOf(d);
  if (prev && groupOf(prev) === id) return '';
  const g = GROUPS.find((x) => x.id === id);
  return '<div class="cx-group-head"><span class="cx-group-ico">' + icon(g.glyph) + '</span><div><h4>' + esc(tr(g.title)) + '</h4><small>' + esc(tr(g.hint)) + '</small></div></div>';
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

function clockHtml(c, now) {
  const s = clockState(c.tz, now);
  return '<div class="cx-clock' + (s.open ? ' open' : '') + '" data-tz="' + esc(c.tz) + '" role="listitem">'
    + '<div class="cx-clock-top"><span>' + esc(c.city) + '</span><small>' + esc(tr(c.country)) + '</small></div>'
    + '<b class="cx-clock-time">' + esc(s.time) + '</b>'
    + '<div class="cx-clock-foot"><span class="cx-clock-day">' + esc(s.day) + '</span><span class="cx-clock-status"><i></i>' + esc(tr(s.open ? 'Expediente' : 'Fora do horário')) + '</span></div></div>';
}

function incotermHtml(t) {
  return '<div class="cx-inco-item"><div class="cx-inco-code"><b>' + t[0] + '</b><span class="cx-inco-mode ' + t[3] + '">' + esc(tr(t[3] === 'sea' ? 'Marítimo' : 'Qualquer modal')) + '</span></div>'
    + '<strong>' + esc(t[1]) + '</strong><p>' + esc(tr(t[2])) + '</p></div>';
}

export function comexHubHtml(stats) {
  const now = new Date();
  const stat = (value, label, mod) => '<div class="cx-stat' + (mod ? ' ' + mod : '') + '"><b>' + value + '</b><span>' + esc(tr(label)) + '</span></div>';
  return '<section class="cx-hub">'
    + '<div class="cx-hero"><div class="cx-hero-copy"><span class="cx-eyebrow">' + esc(tr('COMÉRCIO EXTERIOR · PC&L BRASIL')) + '</span>'
    + '<h3>' + esc(tr('Central Comex')) + '</h3><p>' + esc(tr('Agentes de carga, processos de importação e rastreamento de embarques em um só lugar.')) + '</p></div>'
    + '<div class="cx-stats">' + stat(stats.total, stats.total === 1 ? 'portal' : 'portais') + stat(stats.pending, stats.pending === 1 ? 'link pendente' : 'links pendentes', stats.pending ? 'warn' : '') + '</div></div>'
    + '<div class="cx-block-head"><span>' + icon('clock') + esc(tr('Fusos das plantas e parceiros')) + '</span><small>' + esc(tr('Expediente considerado: 08h às 18h, segunda a sexta')) + '</small></div>'
    + '<div class="cx-clocks" role="list">' + CLOCKS.map((c) => clockHtml(c, now)).join('') + '</div>'
    + '<details class="cx-inco"><summary><span>' + icon('book') + esc(tr('Incoterms 2020 · consulta rápida')) + '</span><small>' + esc(tr('Quem paga o frete e quando o risco muda de mãos')) + '</small></summary>'
    + '<div class="cx-inco-grid">' + INCOTERMS.map(incotermHtml).join('') + '</div></details>'
    + '</section>';
}

// The interval stops itself once the Comex view is replaced, so no timer outlives the screen.
export function startComexClocks(root) {
  const hub = root.querySelector('.cx-hub');
  if (!hub) return;
  const timer = setInterval(() => {
    if (!hub.isConnected) { clearInterval(timer); return; }
    const now = new Date();
    hub.querySelectorAll('[data-tz]').forEach((el) => {
      const c = CLOCKS.find((x) => x.tz === el.getAttribute('data-tz'));
      if (c) el.outerHTML = clockHtml(c, now);
    });
  }, 30000);
}

export function syncComexFields() {
  document.getElementById('comexGroupField').hidden = document.getElementById('category').value !== COMEX_CATEGORY;
}

export function fillComexFields(d) {
  document.getElementById('comexGroup').value = d && d.comexGroup ? groupOf(d) : 'agentes';
  syncComexFields();
}

export function readComexGroup() {
  const v = document.getElementById('comexGroup').value;
  return GROUPS.some((g) => g.id === v) ? v : 'outros';
}
