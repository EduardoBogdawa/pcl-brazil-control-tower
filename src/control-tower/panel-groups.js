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
    field: 'pcpGroup', fallback: 'outros', label: 'Etapa do PCP', allowCustom: true,
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

const NEW_GROUP = '__new';
const CUSTOM_PREFIX = 'c-';
const MAX_TITLE = 40;

const titleField = (cfg) => cfg.field + 'Title';
const customTitle = (cfg, d) => String(d[titleField(cfg)] || '').trim().slice(0, MAX_TITLE);
const isCustom = (cfg, d) => !!cfg.allowCustom && typeof d[cfg.field] === 'string' && d[cfg.field].startsWith(CUSTOM_PREFIX) && !!customTitle(cfg, d);

function groupOf(cfg, d) {
  if (isCustom(cfg, d)) return d[cfg.field];
  return cfg.groups.some((g) => g.id === d[cfg.field]) ? d[cfg.field] : cfg.fallback;
}

function slug(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'secao';
}

// Sections created by the team live on the panels themselves, so they appear as soon as a panel uses them.
function customGroups(cfg, category, rows) {
  if (!cfg.allowCustom) return [];
  const seen = new Map();
  rows.forEach((d) => {
    if (d.category === category && isCustom(cfg, d) && !seen.has(d[cfg.field])) {
      seen.set(d[cfg.field], { id: d[cfg.field], title: customTitle(cfg, d), hint: 'Seção criada pela equipe', glyph: 'folder', custom: true });
    }
  });
  return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
}

// Built-in sections first, then team sections, with the catch-all fallback kept last.
function allGroups(category, rows) {
  const cfg = GROUPED[category];
  const fixed = cfg.groups.filter((g) => g.id !== cfg.fallback);
  const fallback = cfg.groups.filter((g) => g.id === cfg.fallback);
  return fixed.concat(customGroups(cfg, category, rows || []), fallback);
}

const groupLabel = (g) => (g.custom ? g.title : tr(g.title));

export function customGroupsOf(category, rows) {
  const cfg = GROUPED[category];
  return cfg ? customGroups(cfg, category, rows) : [];
}

export function isGrouped(category) {
  return !!GROUPED[category];
}

// Stable sort: cards keep the order the user picked, just bucketed by section.
export function sortGroupedRows(category, rows) {
  const cfg = GROUPED[category];
  if (!cfg) return rows;
  const ids = allGroups(category, rows).map((g) => g.id);
  const order = (d) => ids.indexOf(groupOf(cfg, d));
  return rows.slice().sort((a, b) => order(a) - order(b));
}

export function groupHead(category, d, prev) {
  const cfg = GROUPED[category];
  if (!cfg) return '';
  const id = groupOf(cfg, d);
  if (prev && groupOf(cfg, prev) === id) return '';
  const g = cfg.groups.find((x) => x.id === id) || { title: customTitle(cfg, d), hint: 'Seção criada pela equipe', glyph: 'folder', custom: true };
  return '<div class="panel-group-head" data-group="' + esc(id) + '" style="--gh:' + categoryTint(category) + '"><span class="panel-group-ico">' + icon(g.glyph) + '</span><div><h4>' + esc(groupLabel(g)) + '</h4><small>' + esc(tr(g.hint)) + '</small></div></div>';
}

function syncNewGroupInput() {
  const input = document.getElementById('panelGroupNew');
  const on = document.getElementById('panelGroup').value === NEW_GROUP && !document.getElementById('panelGroupField').hidden;
  input.closest('label').hidden = !on;
  input.required = on;
  if (!on) input.value = '';
}

export function bindGroupField() {
  document.getElementById('panelGroup').addEventListener('change', () => {
    syncNewGroupInput();
    const input = document.getElementById('panelGroupNew');
    if (input.required) input.focus();
  });
}

// The section picker in the panel form follows the chosen category; the current pick survives a category round-trip.
export function syncGroupField(selected, rows) {
  const category = document.getElementById('category').value;
  const cfg = GROUPED[category];
  const wrap = document.getElementById('panelGroupField');
  const select = document.getElementById('panelGroup');
  wrap.hidden = !cfg;
  if (cfg) {
    const keep = selected || select.value;
    const groups = allGroups(category, rows);
    document.getElementById('panelGroupLabel').textContent = tr(cfg.label);
    select.innerHTML = groups.map((g) => '<option value="' + esc(g.id) + '">' + esc(groupLabel(g)) + '</option>').join('')
      + (cfg.allowCustom ? '<option value="' + NEW_GROUP + '">' + esc(tr('+ Nova seção...')) + '</option>' : '');
    select.value = groups.some((g) => g.id === keep) ? keep : groups[0].id;
  }
  syncNewGroupInput();
}

export function fillGroupField(d, rows) {
  const cfg = d && GROUPED[d.category];
  syncGroupField(cfg ? groupOf(cfg, d) : '', rows);
}

// Returns an error message when a new section was picked but left unnamed; a name that already exists reuses that section.
export function applyGroupField(obj, rows) {
  const cfg = GROUPED[obj.category];
  if (!cfg) return '';
  const v = document.getElementById('panelGroup').value;
  const groups = allGroups(obj.category, rows);
  if (cfg.allowCustom) obj[titleField(cfg)] = '';
  if (v === NEW_GROUP && cfg.allowCustom) {
    const name = document.getElementById('panelGroupNew').value.trim().replace(/\s+/g, ' ').slice(0, MAX_TITLE);
    if (!name) return tr('Informe o nome da nova seção.');
    const same = groups.find((g) => groupLabel(g).toLowerCase() === name.toLowerCase() || g.title.toLowerCase() === name.toLowerCase());
    if (same && !same.custom) { obj[cfg.field] = same.id; return ''; }
    obj[cfg.field] = same ? same.id : CUSTOM_PREFIX + slug(name);
    obj[titleField(cfg)] = same ? same.title : name;
    return '';
  }
  const g = groups.find((x) => x.id === v);
  obj[cfg.field] = g ? g.id : cfg.fallback;
  if (g && g.custom) obj[titleField(cfg)] = g.title;
  return '';
}

// Panels of a grouped category bucketed by section id, e.g. for summary strips above the cards.
export function rowsByGroup(category, rows) {
  const cfg = GROUPED[category];
  const out = {};
  if (!cfg) return out;
  allGroups(category, rows).forEach((g) => { out[g.id] = []; });
  rows.forEach((d) => { if (d.category === category) out[groupOf(cfg, d)].push(d); });
  return out;
}
