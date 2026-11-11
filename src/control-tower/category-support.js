import { getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';

export const text = (pt, en) => getLang() === 'en' ? en : pt;
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function guide(title, entries) {
  return '<details class="support-guide"><summary>' + escapeHtml(title) + '</summary><ul>' + entries.map((entry) => '<li>' + escapeHtml(entry) + '</li>').join('') + '</ul></details>';
}

function quickOverview(category) {
  const packaging = category === 'Packaging/SPI';
  const prompt = category === 'Prompt';
  const cards = packaging ? [
    ['layers', 'EUR / EPAL 1', '1.200 × 800', text('mm · base de referência', 'mm · reference footprint'), text('Confirme o padrão do cliente', 'Confirm customer standard')],
    ['cube', 'PBR', '1.200 × 1.000', text('mm · base de referência', 'mm · reference footprint'), text('Carga depende da aplicação', 'Load depends on application')],
    ['checkSquare', text('Liberação', 'Release'), text('PN + lote', 'PN + batch'), text('Quantidade e revisão corretas', 'Correct quantity and revision'), text('Rastreabilidade antes do envio', 'Traceability before shipment')],
    ['shield', 'VCI', text('Seco + selado', 'Dry + sealed'), text('Metal compatível · sem rasgos', 'Compatible metal · no tears'), text('Prazo definido pelo fornecedor', 'Duration defined by supplier')],
  ] : prompt ? [
    ['users', text('Papel', 'Role'), text('Quem analisa?', 'Who analyzes?'), text('Especialidade e objetivo claros', 'Clear expertise and objective'), '01'],
    ['layers', text('Contexto', 'Context'), text('Qual cenário?', 'Which scenario?'), text('Processo, período e restrições', 'Process, period and constraints'), '02'],
    ['checkSquare', text('Dados', 'Data'), text('Qual evidência?', 'Which evidence?'), text('Anonimizados · sem inventar números', 'Anonymized · no invented numbers'), '03'],
    ['book', text('Saída', 'Output'), text('Qual entrega?', 'Which deliverable?'), text('Formato, premissas e ações', 'Format, assumptions and actions'), '04'],
  ] : [
    ['trend', text('Analisar', 'Analyze'), text('Desvios', 'Deviations'), text('Inventário · demanda · causas', 'Inventory · demand · causes'), text('Peça hipóteses e evidências', 'Request hypotheses and evidence')],
    ['book', text('Redigir', 'Write'), text('Comunicação', 'Communication'), text('Instruções · resumo · e-mail', 'Instructions · summary · email'), text('Defina público e tom', 'Define audience and tone')],
    ['calendar', text('Planejar', 'Plan'), text('Plano de ação', 'Action plan'), text('Prioridades · responsáveis · prazos', 'Priorities · owners · deadlines'), text('Valide com o responsável', 'Validate with the owner')],
    ['shield', text('Proteger', 'Protect'), text('Dados seguros', 'Safe data'), text('Somente ferramentas aprovadas', 'Approved tools only'), text('Nunca envie senhas ou dados restritos', 'Never send passwords or restricted data')],
  ];
  const steps = packaging ? [text('Inspecionar pallet', 'Inspect pallet'), text('Proteger peças', 'Protect parts'), text('Conferir etiqueta', 'Check label'), text('Validar aprovação', 'Validate approval')] : prompt ? [text('Preencher contexto', 'Provide context'), text('Informar evidências', 'Provide evidence'), text('Definir formato', 'Define format'), text('Revisar resposta', 'Review response')] : [text('Escolher assistente', 'Choose assistant'), text('Anonimizar dados', 'Anonymize data'), text('Enviar contexto', 'Send context'), text('Revisar resultado', 'Review result')];
  const note = packaging ? text('Referências gerais: dimensões não definem capacidade. Especificações do cliente e do fornecedor prevalecem.', 'General references: dimensions do not determine capacity. Customer and supplier specifications take precedence.') : text('Apoio à decisão, não execução automática. Confira fontes, cálculos e conclusões antes de agir.', 'Decision support, not automatic execution. Check sources, calculations and conclusions before acting.');
  return '<div class="support-quick-grid">' + cards.map(([glyph, label, value, sub, foot]) => '<article class="support-quick-card"><div class="support-quick-label"><span>' + icon(glyph) + '</span>' + escapeHtml(label) + '</div><strong>' + escapeHtml(value) + '</strong><p>' + escapeHtml(sub) + '</p><small>' + escapeHtml(foot) + '</small></article>').join('') + '</div><div class="support-process"><span class="support-process-label">' + text('FLUXO ESSENCIAL', 'ESSENTIAL FLOW') + '</span><ol>' + steps.map((step, i) => '<li><b>' + (i + 1) + '</b>' + escapeHtml(step) + '</li>').join('') + '</ol></div><p class="support-notice">' + icon('info') + escapeHtml(note) + '</p>';
}

export function mountCategorySupport(root, category) {
  let title, guides;
  if (category === 'Packaging/SPI') {
    title = text('Referências de embalagem', 'Packaging references');
    guides = [
      guide(text('Pallets · seleção e inspeção', 'Pallets · selection and inspection'), [
        text('Referências dimensionais: EUR/EPAL 1: 1.200 × 800 mm; PBR: 1.200 × 1.000 mm. Confirme o padrão exigido pelo cliente antes de usar.', 'Dimensional references: EUR/EPAL 1: 1,200 × 800 mm; PBR: 1,200 × 1,000 mm. Confirm customer requirements before use.'),
        text('Capacidade estática, dinâmica e em rack são diferentes: consulte o fabricante e a aplicação aprovada.', 'Static, dynamic and racking capacities differ: consult the manufacturer and approved application.'),
        text('Inspecione tábuas, blocos, pregos, umidade e contaminação. Não use pallets danificados.', 'Inspect boards, blocks, nails, moisture and contamination. Do not use damaged pallets.'),
        text('Evite carga fora da base; valide altura, peso bruto, estabilidade, cintas e compatibilidade com racks e empilhadeiras.', 'Avoid overhang; validate height, gross weight, stability, straps and rack/forklift compatibility.'),
        text('Para madeira em comércio internacional, verifique aplicabilidade da ISPM 15 e marcação válida.', 'For wood in international trade, check ISPM 15 applicability and valid marking.'),
      ]),
      guide(text('Embalagem · checklist de liberação', 'Packaging · release checklist'), [
        text('Confirme código e revisão da embalagem, quantidade por caixa e por pallet e orientação das peças.', 'Confirm packaging code and revision, quantities per box and pallet and part orientation.'),
        text('Valide separadores, proteção de superfícies, contenção, ergonomia e limites de empilhamento.', 'Validate separators, surface protection, restraint, ergonomics and stacking limits.'),
        text('Confira etiqueta: part number, lote, quantidade e rastreabilidade conforme requisito do cliente.', 'Check labels: part number, batch, quantity and traceability per customer requirements.'),
        text('Registre aprovação e ensaios requeridos. Este guia não substitui especificações aprovadas.', 'Record approval and required tests. This guide does not replace approved specifications.'),
      ]),
      guide(text('Saco VCI · proteção anticorrosiva', 'VCI bag · corrosion protection'), [
        text('VCI libera inibidores de corrosão em um ambiente fechado. Selecione produto compatível com os metais e o processo.', 'VCI releases corrosion inhibitors in an enclosed environment. Select a product compatible with the metals and process.'),
        text('Embale peças limpas e secas, sem condensação; evite rasgos e feche conforme instrução do fabricante.', 'Pack clean, dry parts without condensation; avoid tears and close per manufacturer instructions.'),
        text('Valide distância de proteção, espessura, prazo de proteção, armazenamento e reutilização com o fornecedor. Não existe prazo universal.', 'Validate protection distance, thickness, protection period, storage and reuse with the supplier. There is no universal duration.'),
        text('Consulte a ficha de segurança; dessecante e VCI não são substitutos automáticos entre si.', 'Consult the safety data sheet; desiccants and VCI are not automatic substitutes for one another.'),
      ]),
    ];
  } else if (category === 'IA' || category === 'Agentes') {
    title = text('Como escolher e usar um assistente', 'Choosing and using an assistant');
    guides = [
      guide(text('Escolha pela tarefa', 'Choose by task'), [text('Análise: resumir desvios e hipóteses. Redação: preparar comunicação e instruções. Planejamento: organizar ações e checklists.', 'Analysis: summarize deviations and hypotheses. Writing: prepare communications and instructions. Planning: organize actions and checklists.'), text('Confira a descrição de cada agente e o acesso aprovado antes de enviar dados. Os recursos abaixo são guias, não executam IA.', 'Check each agent description and approved access before sending data. These resources are guides, not AI execution.')]),
      guide(text('Uso seguro e revisão humana', 'Safe use and human review'), [text('Não envie senhas, dados pessoais, desenhos, preços ou informações restritas a ferramentas não aprovadas.', 'Do not send passwords, personal data, drawings, prices or restricted information to unapproved tools.'), text('Use dados anonimizados. Confira cálculos, fontes e conclusões; a IA pode inventar informações.', 'Use anonymized data. Check calculations, sources and conclusions; AI can invent information.'), text('Não autorize alterações de pedidos, estoques ou comunicação externa sem revisão do responsável.', 'Do not authorize order, stock or external communication changes without owner review.')]),
    ];
  } else if (category === 'Prompt') {
    title = text('Prepare um prompt melhor', 'Build a better prompt');
    guides = [guide(text('Checklist antes de enviar', 'Pre-send checklist'), [text('Defina papel, objetivo, contexto, dados disponíveis e período analisado.', 'Define role, objective, context, available data and time period.'), text('Peça formato de saída, premissas explícitas e perguntas para dados faltantes. Não permita números inventados.', 'Request output format, explicit assumptions and questions for missing data. Do not allow invented numbers.'), text('Anonimize informações e revise a resposta antes de usar na operação.', 'Anonymize information and review the response before operational use.')])];
  } else return;
  const section = document.createElement('section');
  section.className = 'category-support support-dashboard';
  section.dataset.supportType = category === 'Packaging/SPI' ? 'packaging' : 'ai';
  section.innerHTML = '<header class="support-dashboard-head"><div><span class="support-eyebrow">' + text('CONSULTA RÁPIDA · PC&L', 'QUICK REFERENCE · PC&L') + '</span><h3>' + escapeHtml(title) + '</h3></div><span class="support-head-icon">' + icon(category === 'Packaging/SPI' ? 'cube' : 'ai') + '</span></header>' + quickOverview(category) + '<div class="support-guides-heading">' + text('APROFUNDE QUANDO PRECISAR', 'EXPLORE WHEN NEEDED') + '</div><div class="support-guides-grid">' + guides.join('') + '</div>';
  if (category === 'Prompt') {
    const template = text('Atue como especialista em PC&L.\nObjetivo: [tarefa].\nContexto: [processo e período].\nDados anonimizados: [dados].\nRestrições: não invente números; indique premissas e solicite dados faltantes.\nSaída: resumo, riscos e tabela de ações com responsável e prazo sugeridos.\nDiferencie fatos de hipóteses.', 'Act as a PC&L specialist.\nObjective: [task].\nContext: [process and period].\nAnonymized data: [data].\nConstraints: do not invent numbers; state assumptions and request missing data.\nOutput: summary, risks and action table with suggested owners and deadlines.\nDistinguish facts from hypotheses.');
    section.insertAdjacentHTML('beforeend', '<details class="support-guide support-editor"><summary>' + text('Personalizar e copiar um modelo', 'Customize and copy a template') + '</summary><div class="support-editor-body"><label>' + text('Modelo editável', 'Editable template') + '<textarea rows="7" class="support-template">' + escapeHtml(template) + '</textarea></label><button type="button" class="btn support-copy">' + text('Copiar modelo', 'Copy template') + '</button><p role="status" class="support-status"></p></div></details>');
    section.querySelector('.support-copy').onclick = async () => {
      const status = section.querySelector('.support-status');
      try { await navigator.clipboard.writeText(section.querySelector('textarea').value); status.textContent = text('Modelo copiado.', 'Template copied.'); }
      catch { status.textContent = text('Não foi possível copiar. Selecione o texto e copie manualmente.', 'Unable to copy. Select the text and copy manually.'); }
    };
  }
  const tabs = root.querySelector('.adv-hub');
  if (tabs) tabs.after(section); else root.prepend(section);
}
