import { getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';

export const text = (pt, en) => getLang() === 'en' ? en : pt;
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function topic(title, lines) {
  return '<details class="support-topic"><summary>' + escapeHtml(title) + '</summary><ul>' + lines.map((line) => '<li>' + escapeHtml(line) + '</li>').join('') + '</ul></details>';
}

export function mountCategorySupport(root, category) {
  let title, description, topics;
  if (category === 'Packaging/SPI') {
    title = text('SPI · Instrução de Embalagem do Fornecedor', 'SPI · Supplier Packaging Instruction');
    description = text('Documento do fornecedor que descreve a embalagem e registra a aprovação Nexteer.', 'Supplier document describing packaging and recording Nexteer approval.');
    topics = [
      topic(text('O que conferir no SPI', 'What to check in the SPI'), [
        text('Identificação: part number, nome da peça, fornecedor, contatos e data de envio.', 'Identification: part number, part name, supplier, contacts and submission date.'),
        text('Requisitos Nexteer: tipo de embalagem, proteção ESD, prevenção de corrosão, restrição de movimento e demais requisitos marcados no formulário.', 'Nexteer requirements: packaging type, ESD protection, corrosion prevention, movement restraint and other requirements selected in the form.'),
        text('Pack: materiais e dimensões da embalagem, dunnage, caixa secundária e pallet; quantidades, camadas e pesos, com unidades consistentes.', 'Pack: materials and dimensions of packaging, dunnage, secondary container and pallet; quantities, layers and weights with consistent units.'),
        text('Evidências: fotos da peça, peça com dunnage e caixa primária, e carga unitizada; feedback e aprovações Nexteer.', 'Evidence: photos of the part, part with dunnage and primary box, and unit load; feedback and Nexteer approvals.'),
        text('Referência: formulário da imagem enviada. Confirme a revisão vigente antes de usar; os valores do exemplo não são um padrão universal.', 'Reference: the supplied form image. Confirm the current revision before use; example values are not a universal standard.'),
      ]),
      topic(text('Pallet e embalagem', 'Pallet and packaging'), [
        text('Use dimensões e material definidos no SPI aprovado, não uma medida genérica de pallet.', 'Use dimensions and material specified in the approved SPI, not a generic pallet size.'),
        text('Confira quantidade por caixa, caixas por camada, camadas por pallet e peso bruto da carga.', 'Check quantity per box, boxes per layer, layers per pallet and gross load weight.'),
        text('Valide estabilidade, limite de empilhamento, proteção da peça e etiqueta. Para madeira em exportação, verifique a aplicabilidade da ISPM 15.', 'Validate stability, stacking limit, part protection and label. For export wood, check ISPM 15 applicability.'),
      ]),
      topic(text('Saco VCI: quando usar', 'VCI bag: when to use'), [
        text('Use quando a proteção anticorrosiva for requerida e a solução estiver aprovada para o metal e a rota logística.', 'Use when corrosion protection is required and the solution is approved for the metal and logistics route.'),
        text('Embale peças limpas e secas; mantenha o saco íntegro e fechado conforme orientação do fornecedor.', 'Pack clean, dry parts; keep the bag intact and closed per supplier instructions.'),
        text('Registre material e aplicação no SPI. Prazo de proteção, espessura e compatibilidade dependem do fornecedor; VCI não substitui automaticamente dessecante.', 'Record material and application in the SPI. Protection duration, thickness and compatibility depend on the supplier; VCI does not automatically replace desiccant.'),
      ]),
    ];
  } else if (category === 'Agentes') {
    title = text('Agentes & IA · Assistentes para a operação', 'Agents & AI · Operational assistants');
    description = text('Escolha o assistente pela tarefa. Abra os painéis abaixo para acessar as ferramentas disponíveis.', 'Choose an assistant by task. Open the panels below to access available tools.');
    topics = [topic(text('Como escolher', 'How to choose'), [text('Análise SPI: apoio à análise da instrução de embalagem. Consulte os requisitos aplicáveis antes de validar recomendações.', 'SPI Analysis: support for analyzing packaging instructions. Check applicable requirements before validating recommendations.'), text('Conversor BOM para Excel: acesso ao assistente dedicado à conversão de BOM. Confira part numbers, quantidades e estrutura na saída.', 'BOM to Excel Converter: access the assistant dedicated to BOM conversion. Check part numbers, quantities and structure in the output.'), text('Invoice/Packing List: reúna a PO do QAD em PDF, a invoice e o packing list para identificar itens corretos e pontos a revisar.', 'Invoice/Packing List: gather the QAD PO as a PDF, invoice and packing list to identify correct items and points to review.')]), topic(text('Antes de usar a resposta', 'Before using the answer'), [text('Abra o painel do assistente para acessar a ferramenta. Este guia não executa IA nem confirma acesso aos sistemas.', 'Open the assistant panel to access the tool. This guide does not execute AI or confirm system access.'), text('Envie somente dados permitidos na ferramenta aprovada. Confira números, fontes e recomendações com o responsável antes de aplicar.', 'Send only permitted data to the approved tool. Check numbers, sources and recommendations with the owner before applying them.')])];
  } else if (category === 'IA') {
    title = text('IA: apoio ao trabalho, não decisão final', 'AI: work support, not the final decision');
    description = text('Use para resumir, comparar e elaborar rascunhos; valide o resultado antes de aplicar.', 'Use it to summarize, compare and draft; validate the result before applying it.');
    topics = [topic(text('Exemplo prático', 'Practical example'), [text('Para analisar um desvio de estoque, informe período, valores anonimizados e meta. Peça possíveis causas e quais dados faltam para confirmá-las.', 'To analyze an inventory deviation, provide the period, anonymized values and target. Ask for possible causes and the data needed to confirm them.'), text('Trate as causas como hipóteses, não como fatos. Refaça os cálculos e confira os dados de origem.', 'Treat causes as hypotheses, not facts. Recalculate and check source data.')]), topic(text('O que não enviar', 'What not to send'), [text('Não envie senhas, dados pessoais ou informações restritas a ferramentas não aprovadas. Anonimize o conteúdo quando necessário.', 'Do not send passwords, personal data or restricted information to unapproved tools. Anonymize content when necessary.')])];
  } else if (category === 'Prompt') {
    title = text('Prompt: diga o que precisa e com quais dados', 'Prompt: say what you need and which data to use');
    description = text('Um bom pedido informa objetivo, contexto e formato de resposta. Use a biblioteca abaixo ou adapte um modelo.', 'A good request provides the objective, context and response format. Use the library below or adapt a template.');
    topics = [topic(text('Como escrever um pedido claro', 'How to write a clear request'), [text('Objetivo: o que resolver. Contexto: processo e período. Dados: somente o que pode compartilhar. Saída: resumo, tabela ou plano de ação.', 'Objective: what to solve. Context: process and period. Data: only what you may share. Output: summary, table or action plan.'), text('Peça para indicar premissas, não inventar números e perguntar quando faltarem informações.', 'Ask it to state assumptions, not invent numbers and ask when information is missing.')])];
  } else return;

  const section = document.createElement('section');
  section.className = 'category-support support-compact';
  section.innerHTML = '<div class="support-compact-heading">' + icon(category === 'Packaging/SPI' ? 'cube' : 'book') + '<div><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(description) + '</p></div></div><div class="support-topic-row">' + topics.join('') + '</div>';
  if (['Packaging/SPI', 'Agentes', 'IA', 'Prompt'].includes(category)) {
    section.classList.add('support-hub');
    section.dataset.kind = category === 'Packaging/SPI' ? 'spi' : 'agents';
    const previews = category === 'Packaging/SPI' ? [
      ['checkSquare', text('Conferir SPI', 'Check SPI'), text('Peça · fornecedor · aprovação', 'Part · supplier · approval')],
      ['cube', text('Validar pack', 'Validate pack'), text('Dimensões · quantidade · peso', 'Dimensions · quantity · weight')],
      ['shield', text('Proteger peças', 'Protect parts'), text('VCI conforme solução aprovada', 'VCI per approved solution')],
    ] : category === 'IA' ? [
      ['book', text('Analisar com contexto', 'Analyze with context'), text('Desvios de estoque · causas possíveis', 'Inventory deviations · possible causes')],
      ['shield', text('Compartilhar com segurança', 'Share safely'), text('Dados anonimizados · ferramentas aprovadas', 'Anonymized data · approved tools')],
    ] : category === 'Prompt' ? [
      ['book', text('Estruturar o pedido', 'Structure the request'), text('Objetivo · contexto · dados · saída', 'Objective · context · data · output')],
    ] : [
      ['users', text('Escolher assistente', 'Choose assistant'), text('Defina a tarefa e confira a finalidade', 'Define the task and check its purpose')],
      ['checkSquare', text('Validar resposta', 'Validate answer'), text('Confira dados, cálculos e recomendações', 'Check data, calculations and recommendations')],
    ];
    section.querySelectorAll('.support-topic summary').forEach((summary, index) => {
      const [glyph, label, preview] = previews[index];
      summary.innerHTML = '<span class="support-tile-top"><span class="support-tile-icon">' + icon(glyph) + '</span><small>' + text('REFERÊNCIA', 'REFERENCE') + '</small>' + icon('chevronDown') + '</span><b>' + escapeHtml(label) + '</b><span class="support-tile-description">' + escapeHtml(preview) + '</span>';
    });
  }
  if (category === 'Prompt') {
    const template = text('Analise o desvio de estoque no período [período].\nContexto: [processo]. Dados anonimizados: [estoque, meta e demanda].\nApresente um resumo e uma tabela de possíveis causas, evidências necessárias e ações sugeridas.\nNão invente números. Indique premissas e pergunte se faltarem dados.', 'Analyze the inventory deviation during [period].\nContext: [process]. Anonymized data: [stock, target and demand].\nProvide a summary and a table of possible causes, required evidence and suggested actions.\nDo not invent numbers. State assumptions and ask if data is missing.');
    section.querySelector('.support-topic-row').insertAdjacentHTML('beforeend', '<details class="support-topic"><summary><span class="support-tile-top"><span class="support-tile-icon">' + icon('book') + '</span><small>' + text('MODELO EDITÁVEL', 'EDITABLE TEMPLATE') + '</small>' + icon('chevronDown') + '</span><b>' + text('Adaptar um exemplo de estoque', 'Adapt an inventory example') + '</b><span class="support-tile-description">' + text('Preencha o contexto e copie seu pedido', 'Provide context and copy your request') + '</span>' + '</summary><div class="support-editor-body"><label>' + text('Substitua os campos entre colchetes', 'Replace the bracketed fields') + '<textarea rows="5">' + escapeHtml(template) + '</textarea></label><button type="button" class="btn support-copy">' + text('Copiar', 'Copy') + '</button><p role="status" class="support-status"></p></div></details>');
    section.querySelector('.support-copy').onclick = async () => {
      const status = section.querySelector('.support-status');
      try { await navigator.clipboard.writeText(section.querySelector('textarea').value); status.textContent = text('Exemplo copiado.', 'Example copied.'); }
      catch { status.textContent = text('Selecione o texto e copie manualmente.', 'Select the text and copy manually.'); }
    };
  }
  section.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open) section.querySelectorAll('details').forEach((other) => { if (other !== detail) other.open = false; });
    });
  });
  const tabs = root.querySelector('.adv-hub');
  if (tabs) tabs.after(section); else root.prepend(section);
}
