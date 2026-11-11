import { getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';

export const text = (pt, en) => getLang() === 'en' ? en : pt;
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function guide(title, entries) {
  return '<details class="support-guide"><summary>' + escapeHtml(title) + '</summary><ul>' + entries.map((entry) => '<li>' + escapeHtml(entry) + '</li>').join('') + '</ul></details>';
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
  section.className = 'category-support';
  section.innerHTML = '<h3>' + icon('book') + escapeHtml(title) + '</h3>' + guides.join('');
  if (category === 'Prompt') {
    const template = text('Atue como especialista em PC&L.\nObjetivo: [tarefa].\nContexto: [processo e período].\nDados anonimizados: [dados].\nRestrições: não invente números; indique premissas e solicite dados faltantes.\nSaída: resumo, riscos e tabela de ações com responsável e prazo sugeridos.\nDiferencie fatos de hipóteses.', 'Act as a PC&L specialist.\nObjective: [task].\nContext: [process and period].\nAnonymized data: [data].\nConstraints: do not invent numbers; state assumptions and request missing data.\nOutput: summary, risks and action table with suggested owners and deadlines.\nDistinguish facts from hypotheses.');
    section.insertAdjacentHTML('beforeend', '<label>' + text('Modelo editável', 'Editable template') + '<textarea rows="7" class="support-template">' + escapeHtml(template) + '</textarea></label><button type="button" class="btn support-copy">' + text('Copiar modelo', 'Copy template') + '</button><p role="status" class="support-status"></p>');
    section.querySelector('.support-copy').onclick = async () => {
      const status = section.querySelector('.support-status');
      try { await navigator.clipboard.writeText(section.querySelector('textarea').value); status.textContent = text('Modelo copiado.', 'Template copied.'); }
      catch { status.textContent = text('Não foi possível copiar. Selecione o texto e copie manualmente.', 'Unable to copy. Select the text and copy manually.'); }
    };
  }
  const tabs = root.querySelector('.adv-hub');
  if (tabs) tabs.after(section); else root.prepend(section);
}
