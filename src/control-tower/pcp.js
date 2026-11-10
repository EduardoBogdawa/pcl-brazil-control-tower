import { tr } from '@/control-tower/i18n';
import { icon, portalIcon } from '@/control-tower/icons.js';
import { rowsByGroup } from '@/control-tower/panel-groups.js';

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

function linkRowHtml(d, safeUrl) {
  const url = safeUrl(d.url);
  const edit = '<button type="button" class="pcp-link-edit" data-edit="' + esc(d.id) + '" aria-label="' + esc(tr('Editar {0}', d.name)) + '" title="' + esc(tr('Editar')) + '">' + icon('pencil') + '</button>';
  const main = url
    ? '<a class="pcp-link" data-open="' + esc(d.id) + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + portalIcon(d) + '<span>' + esc(d.name) + '</span>' + icon('external') + '</a>'
    : '<button type="button" class="pcp-link pending" data-edit="' + esc(d.id) + '">' + portalIcon(d) + '<span>' + esc(d.name) + '<small>' + esc(tr('Configurar link')) + '</small></span>' + icon('link') + '</button>';
  return '<li>' + main + edit + '</li>';
}

function stageHtml(s, i, list, safeUrl) {
  const pending = list.filter((d) => !safeUrl(d.url)).length;
  const state = !list.length ? 'empty' : pending ? 'pending' : 'ready';
  const meta = !list.length ? tr('Nenhum painel ainda') : pending ? tr(pending === 1 ? '{0} link pendente' : '{0} links pendentes', pending) : tr(list.length === 1 ? '{0} painel pronto' : '{0} painéis prontos', list.length);
  const links = list.map((d) => linkRowHtml(d, safeUrl)).join('');
  return '<li class="pcp-step ' + state + '" style="--i:' + i + '"><div class="pcp-step-card">'
    + '<span class="pcp-step-top"><span class="pcp-step-n">' + String(i + 1).padStart(2, '0') + '</span><span class="pcp-step-ico">' + icon(s.glyph) + '</span></span>'
    + '<b>' + esc(s.title) + '</b><span class="pcp-step-tag">' + esc(tr(s.horizon)) + '</span><p>' + esc(tr(s.text)) + '</p>'
    + (links ? '<ul class="pcp-links">' + links + '</ul>' : '')
    + '<span class="pcp-step-foot"><i></i>' + esc(meta) + '<button type="button" class="pcp-step-add" data-pcp-add="' + s.id + '" aria-label="' + esc(tr('Adicionar painel em {0}', s.title)) + '" title="' + esc(tr('Adicionar painel')) + '">' + icon('plus') + '</button></span>'
    + '</div></li>';
}

export function pcpHubHtml(dashboards, safeUrl) {
  const groups = rowsByGroup(PCP_CATEGORY, dashboards);
  const others = groups.outros || [];
  return '<section class="pcp-hub">'
    + '<div class="pcp-block-head"><span>' + icon('repeat') + esc(tr('Fluxo de planejamento')) + '</span><small>' + esc(tr('Da demanda do cliente à decisão mensal')) + '</small></div>'
    + '<ol class="pcp-flow">' + STAGES.map((s, i) => stageHtml(s, i, groups[s.id] || [], safeUrl)).join('') + '</ol>'
    + (others.length ? '<div class="pcp-others"><span>' + esc(tr('Outros recursos')) + '</span><ul class="pcp-links">' + others.map((d) => linkRowHtml(d, safeUrl)).join('') + '</ul></div>' : '')
    + '</section>';
}

// One line per stage for the presentation mode.
export function pcpStageSummary(dashboards, safeUrl) {
  const groups = rowsByGroup(PCP_CATEGORY, dashboards);
  return STAGES.map((s) => {
    const list = groups[s.id] || [];
    const pending = list.filter((d) => !safeUrl(d.url)).length;
    return { title: s.title, horizon: tr(s.horizon), state: !list.length ? tr('Nenhum painel ainda') : pending ? tr(pending === 1 ? '{0} link pendente' : '{0} links pendentes', pending) : tr(list.length === 1 ? '{0} painel pronto' : '{0} painéis prontos', list.length) };
  });
}

export function bindPcpHub(root, onAdd) {
  root.querySelectorAll('[data-pcp-add]').forEach((b) => {
    b.addEventListener('click', () => onAdd(b.getAttribute('data-pcp-add')));
  });
}
