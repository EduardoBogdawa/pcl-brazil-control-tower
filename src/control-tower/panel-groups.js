import { tr } from '@/control-tower/i18n';
import { icon, categoryTint } from '@/control-tower/icons.js';

// Categories whose cards are split into titled sections; each panel stores its section id in `field`.
const GROUPED = {
  Comex: {
    field: 'comexGroup', fallback: 'outros', label: 'Grupo no Comex',
    groups: [
      { id: 'agentes', title: 'Agentes de carga e courier', hint: 'Cotações, coletas e rastreio de remessas aéreas e expressas', glyph: 'layers' },
      { id: 'processos', title: 'Processos e desembaraço', hint: 'Acompanhamento de importação, exportação e documentos', glyph: 'folder' },
      { id: 'rastreio', title: 'Rastreamento marítimo e de cargas', hint: 'Navios, contêineres e status de embarque', glyph: 'globe' },
      { id: 'outros', title: 'Outros portais', hint: 'Demais acessos do time de comércio exterior', glyph: 'link' },
    ],
  },
  PCP: {
    field: 'pcpGroup', fallback: 'outros', label: 'Etapa do PCP',
    groups: [
      { id: 'edi', title: 'EDI', hint: 'Programações recebidas dos clientes: firmes e previsões', glyph: 'repeat' },
      { id: 'po', title: 'PO Clientes', hint: 'Carteira de pedidos, confirmações e atendimento', glyph: 'checkSquare' },
      { id: 'mps', title: 'MPS', hint: 'Plano mestre de produção semanal e capacidade', glyph: 'calendar' },
      { id: 'sop', title: 'S&OP', hint: 'Demanda x capacidade no médio prazo e ciclo mensal', glyph: 'trend' },
      { id: 'outros', title: 'Outros recursos', hint: 'Demais relatórios e ferramentas do PCP', glyph: 'link' },
    ],
  },
  'Acessos e Links': {
    field: 'accessGroup', fallback: 'operacional', label: 'Classificação',
    groups: [
      { id: 'gerencial', title: 'Gerenciais', hint: 'Indicadores, desvios e alertas para acompanhamento da gestão', glyph: 'trend' },
      { id: 'operacional', title: 'Operacionais', hint: 'Sistemas e ferramentas usados no dia a dia', glyph: 'settings' },
      { id: 'apoio', title: 'Contatos e serviços', hint: 'Listas de contatos, serviços e páginas de apoio', glyph: 'users' },
    ],
  },
};

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function groupOf(cfg, d) {
  return cfg.groups.some((g) => g.id === d[cfg.field]) ? d[cfg.field] : cfg.fallback;
}

export function isGrouped(category) {
  return !!GROUPED[category];
}

// Stable sort: cards keep the order the user picked, just bucketed by section.
export function sortGroupedRows(category, rows) {
  const cfg = GROUPED[category];
  if (!cfg) return rows;
  const order = (d) => cfg.groups.findIndex((g) => g.id === groupOf(cfg, d));
  return rows.slice().sort((a, b) => order(a) - order(b));
}

export function groupHead(category, d, prev) {
  const cfg = GROUPED[category];
  if (!cfg) return '';
  const id = groupOf(cfg, d);
  if (prev && groupOf(cfg, prev) === id) return '';
  const g = cfg.groups.find((x) => x.id === id);
  return '<div class="panel-group-head" data-group="' + id + '" style="--gh:' + categoryTint(category) + '"><span class="panel-group-ico">' + icon(g.glyph) + '</span><div><h4>' + esc(tr(g.title)) + '</h4><small>' + esc(tr(g.hint)) + '</small></div></div>';
}

// The section picker in the panel form follows the chosen category; the current pick survives a category round-trip.
export function syncGroupField(selected) {
  const cfg = GROUPED[document.getElementById('category').value];
  const wrap = document.getElementById('panelGroupField');
  const select = document.getElementById('panelGroup');
  wrap.hidden = !cfg;
  if (!cfg) return;
  const keep = selected || select.value;
  document.getElementById('panelGroupLabel').textContent = tr(cfg.label);
  select.innerHTML = cfg.groups.map((g) => '<option value="' + g.id + '">' + esc(tr(g.title)) + '</option>').join('');
  select.value = cfg.groups.some((g) => g.id === keep) ? keep : cfg.groups[0].id;
}

export function fillGroupField(d) {
  const cfg = d && GROUPED[d.category];
  syncGroupField(cfg ? groupOf(cfg, d) : '');
}

export function applyGroupField(obj) {
  const cfg = GROUPED[obj.category];
  if (!cfg) return;
  const v = document.getElementById('panelGroup').value;
  obj[cfg.field] = cfg.groups.some((g) => g.id === v) ? v : cfg.fallback;
}

// Panels of a grouped category bucketed by section id, e.g. for summary strips above the cards.
export function rowsByGroup(category, rows) {
  const cfg = GROUPED[category];
  const out = {};
  if (!cfg) return out;
  cfg.groups.forEach((g) => { out[g.id] = []; });
  rows.forEach((d) => { if (d.category === category) out[groupOf(cfg, d)].push(d); });
  return out;
}
