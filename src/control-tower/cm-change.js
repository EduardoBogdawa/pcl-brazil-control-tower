import { tr } from '@/control-tower/i18n';

export const CM_CATEGORY = 'CM';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const pair = (fromLabel, from, fromDesc, toLabel, to, toDesc) => ({ fromLabel, from, fromDesc, toLabel, to, toDesc });
const info = (label, value) => ({ label, value });

// Change cards of the panels that existed before CM data became editable.
const CM_DEFAULTS = {
  'cm-ring-retaining-38297611-38356680': {
    head: 'RESOURCING DE RING RETAININGS · ECR 3054264',
    pairs: [pair('PN ATUAL', '38014398', 'RING RETAINING', 'NOVO PN', '38297611', 'RING RETAINING'), pair('PN ATUAL', '38222410', 'RING RETAINING', 'NOVO PN', '38356680', 'RING RETAINING')],
    meta: [info('FORNECEDOR', 'Rotor Clip → Shanghai Nate'), info('PLANTA', '89 — Brazil')],
    reason: 'Por quê? Estratégia global já aprovada na Polônia (ECR 3053048), redução de custo e padronização com China e Polônia.',
    note: 'Programas: CEPS 358, 359, 363, 376, F1H, F2U, F2X e XBP.\nBenefícios: menor custo de matéria-prima, cadeia simplificada e mais competitividade.',
  },
  'cm-bearing-38025507-38235940': {
    head: 'ALTERAÇÃO DE PART NUMBER',
    pairs: [pair('PN atual', '38025507', 'BEARING ASM, BALL', 'Novo PN', '38235940', 'BEARING ASM, BALL')],
    meta: [info('PROGRAMAS', '281 · 341 · 265'), info('PLANTA', '89 — Brazil')],
    reason: 'Por quê? Padronizar o rolamento de 47 mm e evitar mistura de peças na linha compartilhada.',
    note: '',
  },
  'cm-itr-38239109-38211878': {
    head: 'ALTERAÇÃO DE PART NUMBER',
    pairs: [pair('PN atual', '38239109', 'ROD ASM, INNER TIE (ITR)', 'Novo PN', '38211878', 'ROD ASM, INNER TIE (ITR)')],
    meta: [info('FONTE', 'CTR México → CTR China'), info('PLANTA', 'Porto Real — Plant 88')],
    reason: 'Por quê? Redução de custo (MCIP).\nImplementação: Running Change.',
    note: '',
  },
  'cm-harness-38363140-wzr152001': {
    head: 'ACOMPANHAMENTO DE LOTE BP',
    pairs: [pair('PART NUMBER', '38363140', 'CHICOTE', 'LOTE BP', 'WZR152001', 'PACKING LIST / INVOICE')],
    meta: [info('STATUS EM 29/09/2026', 'Em andamento'), info('LOCAL', 'Entreposto (PSN)')],
    reason: 'Cenário: havia fila de 3 mil peças antes da entrada do novo lote. O material já recebido em Porto Real era o lote WZR151172, diferente do lote BP.',
    note: '⚠ Ponto importante: não há descrição técnica da alteração no chicote. Os registros só indicam que o lote BP deve corrigir o problema.',
  },
  'cm-upper-bearing-26141865-38280788': {
    head: 'ALTERAÇÃO DE FORNECEDOR',
    pairs: [pair('PN atual', '26141865', 'UPPER BEARING · REV. 07', 'Novo PN validado', '38280788', 'UPPER BEARING · REV. 02')],
    meta: [info('FORNECEDOR', 'Schaeffler → C&U'), info('PLANTAS', '77 · 89')],
    reason: 'Por quê? Redução de custo / commercial saving.\nCost Study: 3027472005.',
    note: 'Programas: 332, 1397, 358, 359, 363, 376 e 327. Validação adicional para aplicações Stellantis, incluindo 281.',
  },
  'cm-spi-form-38297611-38356680': {
    head: 'AÇÃO DE CHANGE MANAGEMENT',
    joiner: '+',
    pairs: [pair('PN 1', '38297611', 'FORMULÁRIO SPI PENDENTE', 'PN 2', '38356680', 'FORMULÁRIO SPI PENDENTE')],
    meta: [info('RESPONSÁVEL', 'Amanda Tassoni'), info('FOLLOW-UP', 'Equipe PC&L')],
    reason: 'Prazo: abertura em 20/10/2026 · conclusão até 30/10/2026.\nStatus: Pendente.',
    note: '⚠ Pendência para avanço: assinatura de Diego Macedo.',
  },
  'cm-worm-gear-26111047-nylacast-china': {
    head: 'TRANSFERÊNCIA DE PLANTA FORNECEDORA',
    pairs: [pair('PART NUMBER', '26111047', 'BLANK ASM, WORM GEAR', 'NOVO FORNECIMENTO', 'Nylacast China', 'PN MANTIDO')],
    meta: [info('FORNECEDOR ANTERIOR', 'Nylacast — UK'), info('ECR GLOBAL', '3039432')],
    reason: 'Mudança: transferência da planta fornecedora Nylacast UK para Nylacast China, mantendo o PN 26111047.',
    note: 'CN: P428963-001.\nPlataformas afetadas: 327-X1, 363 B-UV, 376 e 358/359.',
  },
};

export function cmOf(d) {
  if (d.category !== CM_CATEGORY) return null;
  return d.cm || CM_DEFAULTS[d.id] || null;
}

function daysUntil(isoDate) {
  const [y, m, d] = String(isoDate || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

function dateLabel(iso) {
  const p = String(iso).split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function countdownOf(d) {
  const cm = cmOf(d);
  const days = cm ? daysUntil(cm.changeDate) : null;
  if (days === null) return null;
  const tone = days < 0 ? 'done' : days === 0 ? 'today' : days <= 7 ? 'soon' : days <= 30 ? 'near' : 'far';
  const text = days < 0 ? tr(days === -1 ? 'Troca realizada há {0} dia' : 'Troca realizada há {0} dias', -days)
    : days === 0 ? tr('A troca é hoje')
      : tr(days === 1 ? 'resta {0} dia' : 'restam {0} dias', days);
  return { days, tone, text, date: dateLabel(cm.changeDate) };
}

export function cmCountdownHtml(d) {
  const c = countdownOf(d);
  if (!c) return '';
  return '<div class="cm-countdown ' + c.tone + '" role="status"><span class="cm-cd-num">' + (c.days > 0 ? c.days : c.days === 0 ? '0' : '✓') + '</span>'
    + '<span class="cm-cd-txt"><small>' + esc(tr('Alteração de estrutura')) + '</small><b>' + esc(c.text) + '</b></span><span class="cm-cd-date">' + esc(c.date) + '</span></div>';
}

// Home-page list: upcoming changes first, plus the ones done in the last 7 days so the team sees them go live.
export function cmUpcomingHtml(dashboards) {
  const rows = dashboards.map((d) => ({ d, c: countdownOf(d) })).filter((x) => x.c && x.c.days >= -7).sort((a, b) => {
    if ((a.c.days < 0) !== (b.c.days < 0)) return a.c.days < 0 ? 1 : -1;
    return Math.abs(a.c.days) - Math.abs(b.c.days);
  }).slice(0, 6);
  if (!rows.length) return '';
  return '<section class="cm-upcoming" aria-label="' + esc(tr('Próximas alterações de estrutura')) + '"><div class="ov-title"><h3>' + esc(tr('Próximas alterações de estrutura')) + '</h3><small>' + esc(tr('Contagem regressiva das trocas em CM')) + '</small></div><div class="cm-upcoming-list">'
    + rows.map(({ d, c }, i) => '<button type="button" class="cm-up ' + c.tone + '" data-area="' + esc(CM_CATEGORY) + '" style="--i:' + i + '"><span class="cm-cd-num">' + (c.days > 0 ? c.days : c.days === 0 ? '0' : '✓') + '<small>' + esc(tr(c.days > 0 ? (c.days === 1 ? 'dia' : 'dias') : c.days === 0 ? 'hoje' : 'feito')) + '</small></span><span class="cm-up-txt"><b>' + esc(d.name) + '</b><small>' + esc(c.text) + ' · ' + esc(c.date) + '</small></span></button>').join('')
    + '</div></section>';
}

// A leading "Label:" or "Pergunta?" on each line is shown in bold, matching the original hand-made cards.
function richLines(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.{1,40}?[?:])\s+(.+)$/);
    return m ? '<b>' + esc(m[1]) + '</b> ' + esc(m[2]) : esc(l);
  }).join('<br>');
}

function pnBox(label, pn, desc) {
  return '<div class="cm-pn"><small>' + esc(label) + '</small><b>' + esc(pn || '—') + '</b>' + (desc ? '<small>' + esc(desc) + '</small>' : '') + '</div>';
}

export function cmCardHtml(d) {
  const cm = cmOf(d);
  if (!cm) return '';
  const pairs = (cm.pairs || []).filter((p) => p.from || p.to);
  const meta = (cm.meta || []).filter((m) => m.value);
  if (!cm.head && !pairs.length && !meta.length && !cm.reason && !cm.note) return '';
  const joiner = cm.joiner || '→';
  return '<div class="cm-change-card">'
    + (cm.head ? '<div class="cm-change-head">' + esc(cm.head) + '</div>' : '')
    + pairs.map((p, i) => '<div class="cm-pn-flow"' + (i ? ' style="padding-top:0"' : '') + '>' + pnBox(p.fromLabel, p.from, p.fromDesc) + '<div class="cm-arrow">' + esc(joiner) + '</div>' + pnBox(p.toLabel, p.to, p.toDesc) + '</div>').join('')
    + (meta.length ? '<div class="cm-meta">' + meta.map((m) => '<div><small>' + esc(m.label) + '</small><b>' + esc(m.value) + '</b></div>').join('') + '</div>' : '')
    + (cm.reason ? '<div class="cm-reason">' + richLines(cm.reason) + '</div>' : '')
    + (cm.note ? '<div class="cm-warning">' + richLines(cm.note) + '</div>' : '')
    + '</div>';
}

const $ = (id) => document.getElementById(id);
const PAIR_FIELDS = ['from', 'fromDesc', 'to', 'toDesc'];

export function syncCmFields() {
  const on = $('category').value === CM_CATEGORY;
  $('cmFields').hidden = !on;
  $('instructionLabel').textContent = tr(on ? 'Conhecimento' : 'Instrução');
}

export function fillCmFields(d) {
  const cm = (d && cmOf(d)) || {};
  const pairs = cm.pairs || [];
  const meta = cm.meta || [];
  $('cmHead').value = cm.head || '';
  $('cmChangeDate').value = cm.changeDate || '';
  [0, 1].forEach((i) => PAIR_FIELDS.forEach((f) => { $('cmPair' + i + '_' + f).value = (pairs[i] && pairs[i][f]) || ''; }));
  [0, 1].forEach((i) => {
    $('cmMeta' + i + '_label').value = (meta[i] && meta[i].label) || '';
    $('cmMeta' + i + '_value').value = (meta[i] && meta[i].value) || '';
  });
  $('cmReason').value = cm.reason || '';
  $('cmNote').value = cm.note || '';
  syncCmFields();
}

// Existing custom box titles (e.g. "LOTE BP") are kept, since the form only edits the values.
export function readCmFields(prev) {
  const old = prev || {};
  const oldPairs = old.pairs || [];
  const pairs = [0, 1].map((i) => {
    const p = {};
    PAIR_FIELDS.forEach((f) => { p[f] = $('cmPair' + i + '_' + f).value.trim(); });
    p.fromLabel = (oldPairs[i] && oldPairs[i].fromLabel) || 'PN ATUAL';
    p.toLabel = (oldPairs[i] && oldPairs[i].toLabel) || 'NOVO PN';
    return p;
  }).filter((p) => p.from || p.to);
  const meta = [0, 1].map((i) => ({ label: $('cmMeta' + i + '_label').value.trim().toUpperCase(), value: $('cmMeta' + i + '_value').value.trim() })).filter((m) => m.value);
  const cm = { head: $('cmHead').value.trim().toUpperCase(), pairs, meta, reason: $('cmReason').value.trim(), note: $('cmNote').value.trim() };
  const changeDate = $('cmChangeDate').value;
  if (changeDate) cm.changeDate = changeDate;
  if (old.joiner) cm.joiner = old.joiner;
  return cm;
}
