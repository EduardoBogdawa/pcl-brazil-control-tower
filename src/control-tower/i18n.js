// Portuguese text is the key; English is looked up only when the visitor picks EN.
const EN = {
  // Navigation, header and static texts
  'Descrição em inglês (opcional)': 'English description (optional)', 'Exibida quando a página estiver em inglês': 'Shown when the page is in English',
  'relatório': 'report', 'Nome': 'Name', 'Salvar': 'Save', 'Adicionar {0}': 'Add {0}', '{0} item cadastrado': '{0} item', '{0} itens cadastrados': '{0} items', 'Ex.: Portal do fornecedor': 'E.g.: Supplier portal', 'Ex.: Inventory LATAM': 'E.g.: Inventory LATAM', 'Link (https://...)': 'Link (https://...)', 'Informe o nome.': 'Enter a name.', 'Informe um link válido começando com https://': 'Enter a valid link starting with https://', 'Já existe um item com esse nome.': 'An item with this name already exists.', 'Excluir item': 'Delete item', '"{0}" será removido de {1} para todos.': '"{0}" will be removed from {1} for everyone.',
  'FRENTES DO PC&L ADVANCED': 'PC&L ADVANCED WORKSTREAMS', 'Escolha uma frente para ver a rotina ou os painéis dela': 'Pick a workstream to see its routine or panels', 'Rotina operacional': 'Operational routine', 'Atividades semanais e mensais': 'Weekly and monthly activities', '{0} atividade': '{0} activity', '{0} atividades': '{0} activities', 'Rotina': 'Routine', 'Compartilhada': 'Shared',
  'atividade': 'activity',
  'recurso': 'resource', 'PC&L BRASIL · CENTRAL DE FERRAMENTAS': 'PC&L BRAZIL · TOOLS HUB', 'Control Tower': 'Control Tower',
  'Claro': 'Light', 'Escuro': 'Dark', 'Tema': 'Theme', 'Fundo claro': 'Light background', 'Fundo escuro': 'Dark background', 'Padrão': 'Standard', 'Paleta padrão Nexteer': 'Nexteer standard palette',
  'Buscar': 'Search', 'CONTROL TOWER': 'CONTROL TOWER', 'Alternar tema': 'Toggle theme', 'Abrir área': 'Open area', 'PC&L BRASIL · CENTRAL OPERACIONAL': 'PC&L BRAZIL · OPERATIONS HUB', 'painéis': 'panels', 'categorias': 'categories', 'atividades': 'activities', 'Buscar painéis, categorias e ações...': 'Search panels, categories and actions...', 'Busca rápida': 'Quick search', 'navegar': 'navigate', 'abrir': 'open', 'fechar': 'close', 'Nada encontrado para "{0}".': 'Nothing found for "{0}".', 'Meus favoritos': 'My favorites', 'salvos neste navegador': 'saved in this browser', 'Marque a estrela nos cards para fixar seus painéis mais usados aqui.': 'Star a card to pin your most used panels here.', 'Adicionado aos favoritos.': 'Added to favorites.', 'Removido dos favoritos.': 'Removed from favorites.', 'Adicionar aos favoritos': 'Add to favorites', 'Remover dos favoritos': 'Remove from favorites', 'Navegação': 'Navigation', 'Página inicial': 'Home page', '{0} painel': '{0} panel', '{0} painéis': '{0} panels', 'Painéis': 'Panels', 'Ações': 'Actions', 'Cadastrar um novo painel ou link': 'Register a new panel or link', 'Criar uma área no menu': 'Create a menu area', 'Alternar tema (claro, escuro, padrão)': 'Switch theme (light, dark, standard)', 'Muda a aparência do painel': 'Changes the dashboard appearance', 'Mudar para português': 'Switch to Portuguese', 'Mudar para inglês': 'Switch to English', 'Baixar um arquivo com todos os painéis': 'Download a file with all panels', 'CENTRAL OPERACIONAL': 'OPERATIONS HUB',
  'NAVEGAÇÃO': 'NAVIGATION', 'CATEGORIAS': 'CATEGORIES', 'Recursos e painéis da equipe PC&L Advanced': 'PC&L Advanced team resources and panels', 'Links e painéis em um único cockpit': 'Links and panels in a single cockpit', 'Visão geral': 'Overview', '+ Nova categoria': '+ New category', 'Categorias': 'Categories',
  'Centralize, organize e acesse seus painéis operacionais.': 'Centralize, organize and access your operational dashboards.',
  'Exportar configuração': 'Export configuration', '+ Adicionar painel': '+ Add panel', 'Adicionar painel': 'Add panel',
  'Painéis configurados': 'Configured panels', 'neste cockpit': 'in this cockpit', 'Links disponíveis': 'Available links',
  'prontos para abrir': 'ready to open', 'Instruções': 'Instructions', 'orientações cadastradas': 'registered guidelines',
  'áreas monitoradas': 'monitored areas', 'recursos': 'resources', 'Painéis de controle': 'Control panels',
  'Excluir categoria': 'Delete category', 'Use': 'Use',
  'para cadastrar URLs de Power BI, SharePoint, Lists, Excel ou páginas HTML. As alterações ficam salvas e aparecem para todos que acessam o painel.':
    'to register Power BI, SharePoint, Lists, Excel or HTML page URLs. Changes are saved and shown to everyone who opens the panel.',
  'Buscar painel...': 'Search panels...', 'Buscar painel': 'Search panels', 'Idioma': 'Language',
  // Panel form
  'Editar painel': 'Edit panel', 'Nome do painel ou link': 'Panel or link name', 'Descrição': 'Description', 'Categoria': 'Category',
  'Status': 'Status', 'URL': 'URL', 'Data do workshop': 'Workshop date', 'Instrução': 'Instruction', 'Excluir painel': 'Delete panel',
  'Cancelar': 'Cancel', 'Salvar painel': 'Save panel', 'Salvar instrução': 'Save instruction', 'Fechar': 'Close',
  'Ex.: Portal de consultas': 'E.g.: Lookup portal', 'Objetivo ou escopo do painel': 'Purpose or scope of the panel',
  'Digite a orientação específica para este painel': 'Type the specific guidance for this panel',
  'Digite a instrução deste painel': 'Type the instruction for this panel', 'Outros': 'Other',
  'Disponível': 'Available', 'Em construção': 'Under construction', 'Em revisão': 'Under review', 'Pendente': 'Pending',
  // Category form
  'Nova categoria': 'New category', 'Nome da categoria': 'Category name', 'Grupo no menu': 'Menu group', 'Cor de destaque': 'Accent color',
  'Criar categoria': 'Create category', 'Ex.: Logística': 'E.g.: Logistics',
  'Ex.: FERRAMENTAS (deixe em branco para nenhum)': 'E.g.: TOOLS (leave blank for none)',
  'Aparece no cartão da visão geral': 'Shown on the overview card',
  // Activity form
  'Nova atividade': 'New activity', 'Nova atividade mensal': 'New monthly activity', 'Nova atividade semanal': 'New weekly activity',
  'Atividade': 'Activity', 'Frequência / dia': 'Frequency / day', 'Responsável': 'Owner', 'Adicionar atividade': 'Add activity',
  'Ex.: Reunião de prioridades': 'E.g.: Priorities meeting', 'Ex.: Amanda e Eduardo': 'E.g.: Amanda and Eduardo',
  'Ex.: Primeira semana do mês': 'E.g.: First week of the month', 'Ex.: Toda segunda-feira': 'E.g.: Every Monday',
  'Confirmar exclusão': 'Confirm deletion', 'Excluir': 'Delete', 'Excluir atividade': 'Delete activity', 'Excluir prompt': 'Delete prompt',
  // Overview
  'Abrir área →': 'Open area →', 'acesso': 'item', 'acessos': 'items', 'Painéis e links desta área': 'Panels and links for this area',
  'Nenhuma atividade.': 'No activities.', 'ROTINA OPERACIONAL': 'OPERATING ROUTINE', 'Atividades da equipe': 'Team activities',
  'Atividades semanais': 'Weekly activities', 'Atividades mensais': 'Monthly activities', '+ Adicionar': '+ Add',
  'ADVANCED PC&L · CENTRAL OPERACIONAL': 'ADVANCED PC&L · OPERATIONS HUB', 'Escolha uma área para começar': 'Choose an area to get started',
  'Uma navegação direta para os painéis, ferramentas e orientações que apoiam a operação.':
    'Direct access to the panels, tools and guidelines that support the operation.',
  'Buscar uma área': 'Search an area', 'Acesso rápido': 'Quick access', 'Power BIs e ferramentas': 'Power BIs and tools',
  'Ver instruções': 'View instructions', 'Consultar ECR': 'Browse ECR', 'Navegação objetiva': 'Focused navigation',
  'Os cards levam diretamente à categoria e mantêm o menu lateral sincronizado.':
    'Cards take you straight to the category and keep the side menu in sync.',
  // Category pages and cards
  'Sistemas, relatórios e recursos corporativos em um único lugar.': 'Corporate systems, reports and resources in one place.',
  'Assistentes inteligentes para análise e suporte à operação.': 'Smart assistants for analysis and operational support.',
  'Recursos para acompanhar e validar mudanças na estrutura do produto.': 'Resources to track and validate product structure changes.',
  'Painéis e recursos para a rotina de Packaging e SPI.': 'Panels and resources for the Packaging and SPI routine.',
  'PC&L BRAZIL · CENTRAL DE FERRAMENTAS': 'PC&L BRAZIL · TOOLS HUB',
  'Sistemas, recursos e soluções para apoiar a operação.': 'Systems, resources and solutions that support the operation.',
  'Abrir painel': 'Open panel', 'Configurar link': 'Set up link', 'Editar': 'Edit', 'Sem descrição.': 'No description.',
  'Data realizada': 'Date held', 'Não informada': 'Not provided', 'Novo painel ou link': 'New panel or link',
  'Cadastre um painel, portal ou site de consulta': 'Register a panel, portal or reference site',
  'Ver {0} acessos': 'View {0} tools', 'Ver {0} relatórios': 'View {0} reports',
  // Prompt library
  'Biblioteca de Prompts': 'Prompt Library', '{0} prompts disponíveis': '{0} prompts available', '+ Adicionar prompt': '+ Add prompt',
  'Título do prompt': 'Prompt title', 'Para que serve / resultado esperado': 'Purpose / expected result',
  'Escreva o prompt completo aqui...': 'Write the full prompt here...', 'Salvar prompt': 'Save prompt', 'Ler prompt': 'Read prompt',
  'Ocultar prompt': 'Hide prompt', 'Copiar': 'Copy', 'Copiado': 'Copied', 'Boa prática:': 'Good practice:',
  ' descreva o contexto, dados disponíveis, resultado esperado e formato da resposta.': ' describe the context, available data, expected result and answer format.',
  // Messages
  'Alterações salvas para todos.': 'Changes saved for everyone.',
  'Não foi possível salvar. Verifique a conexão e tente novamente.': 'Could not save. Check your connection and try again.',
  'Informe o nome do painel.': 'Enter the panel name.', 'Informe o nome da categoria.': 'Enter the category name.',
  'Já existe uma categoria com esse nome.': 'A category with this name already exists.',
  'Não foi possível criar a categoria. Tente novamente.': 'Could not create the category. Please try again.',
  'Categoria "{0}" criada para todos.': 'Category "{0}" created for everyone.',
  'O prompt "{0}" será removido para todos.': 'The prompt "{0}" will be removed for everyone.',
  'O painel "{0}" será removido para todos que acessam o Control Tower.': 'The panel "{0}" will be removed for everyone using the Control Tower.',
  'Painel excluído.': 'Panel deleted.', 'Não foi possível excluir o painel. Tente novamente.': 'Could not delete the panel. Please try again.',
  'Esta categoria ainda tem {0} painel. Mova ou exclua os painéis antes de excluir a categoria.': 'This category still has {0} panel. Move or delete its panels before deleting the category.',
  'Esta categoria ainda tem {0} painéis. Mova ou exclua os painéis antes de excluir a categoria.': 'This category still has {0} panels. Move or delete its panels before deleting the category.',
  'A categoria "{0}" será removida do menu para todos.': 'The category "{0}" will be removed from the menu for everyone.',
  'Categoria excluída.': 'Category deleted.', 'Não foi possível excluir a categoria. Tente novamente.': 'Could not delete the category. Please try again.',
  'Informe a atividade e o responsável.': 'Enter the activity and the owner.', 'Atividade adicionada para todos.': 'Activity added for everyone.',
  'Não foi possível salvar a atividade. Tente novamente.': 'Could not save the activity. Please try again.',
  'A atividade "{0}" será removida para todos.': 'The activity "{0}" will be removed for everyone.',
  'Atividade excluída.': 'Activity deleted.', 'Não foi possível excluir a atividade. Tente novamente.': 'Could not delete the activity. Please try again.',
  'Carregando painéis...': 'Loading panels...',
  'Não foi possível carregar os painéis. Recarregue a página para tentar novamente.': 'Could not load the panels. Reload the page to try again.',
  // Default categories, menu groups and common activity days
  'CONHECIMENTO': 'KNOWLEDGE', 'FERRAMENTAS': 'TOOLS', 'PROJETOS': 'PROJECTS',
  'Prompts': 'Prompts', 'Acessos e Links': 'Access & Links', 'Agentes': 'Agents', 'Agentes & IA': 'Agents & AI', 'IA': 'AI', 'Adicionar': 'Add', 'Mostrar todas': 'Show all', 'Configuração incompleta': 'Configuration incomplete', 'O servidor não forneceu as configurações abaixo. Defina-as no ambiente do aplicativo e reinicie.': 'The server did not provide the settings below. Set them in the app environment and restart.', 'Entre com sua conta corporativa Nexteer para acessar os painéis operacionais.': 'Sign in with your Nexteer work account to access the operational dashboards.', 'Não foi possível entrar': 'Could not sign in', 'Tente novamente. Se o problema continuar, fale com o suporte de TI.': 'Please try again. If the problem continues, contact IT support.', 'Conectando...': 'Connecting...', 'Entrar com Microsoft': 'Sign in with Microsoft', 'Acesso restrito a colaboradores autorizados.': 'Access restricted to authorized employees.', 'Sair': 'Sign out', 'Conclua o login na janela da Microsoft. Esta janela fecha sozinha ao terminar.': 'Finish signing in in the Microsoft window. This window closes by itself when done.', 'Clique em continuar para abrir o login da Microsoft.': 'Click continue to open the Microsoft sign-in.', 'Feche esta janela e tente novamente.': 'Close this window and try again.', 'Aguardando login...': 'Waiting for sign-in...', 'Continuar': 'Continue', 'Concluindo login...': 'Finishing sign-in...', 'Modo de desenvolvimento': 'Development mode', 'Calendário de férias': 'Vacation calendar', 'Abrir planilha': 'Open spreadsheet', 'Link pendente': 'Link pending', 'Todas': 'All', 'Sem dia': 'No day', 'Segunda a sexta': 'Monday to Friday', 'Abertos recentemente': 'Recently opened', 'Recolher menu': 'Collapse menu', 'Expandir menu': 'Expand menu', 'Visualizar em grade': 'Grid view', 'Visualizar em lista': 'List view', 'Modo de visualização': 'View mode', 'Sem conexão. Mostrando a última versão salva neste navegador.': 'Offline. Showing the last version saved in this browser.', 'Bom dia, equipe PC&L': 'Good morning, PC&L team', 'Boa tarde, equipe PC&L': 'Good afternoon, PC&L team', 'Boa noite, equipe PC&L': 'Good evening, PC&L team', 'Áreas': 'Areas', 'Resumo do dia': 'Today at a glance', 'O que está acontecendo hoje': 'What is happening today', 'Eventos de hoje': "Today's events", 'Rotina de hoje': "Today's routine", 'Adicionados recentemente': 'Recently added', 'Últimos painéis': 'Latest panels', 'Nenhum evento hoje': 'No events today', 'Nenhuma atividade para hoje': 'No activities for today', 'Sem rotina no fim de semana': 'No routine on weekends', 'Nenhum painel ainda': 'No panels yet', 'Carregando...': 'Loading...', 'Não foi possível carregar os eventos.': 'Could not load the events.', 'Abrir': 'Open', 'prompt': 'prompt', 'prompts': 'prompts', 'Prompt copiado.': 'Prompt copied.', 'Preencha título, objetivo e o prompt.': 'Fill in the title, purpose and prompt.', 'Nenhum prompt encontrado para esta busca.': 'No prompts match this search.', 'Nenhum prompt cadastrado ainda.': 'No prompts added yet.', 'Mês': 'Month', 'Ano': 'Year', 'Visualização': 'View', 'Ano anterior': 'Previous year', 'Próximo ano': 'Next year', 'Abrir mês': 'Open month', '{0} evento no ano': '{0} event this year', '{0} eventos no ano': '{0} events this year', '{0} evento': '{0} event', '{0} eventos': '{0} events', 'Calendário': 'Calendar', 'Agenda da equipe com eventos, responsáveis e recorrências.': 'Team calendar with events, owners and recurrences.', 'evento': 'event', 'eventos': 'events', 'Novo evento': 'New event', 'Editar evento': 'Edit event', 'Título': 'Title', 'Data': 'Date', 'Início': 'Start', 'Fim': 'End', 'Dia inteiro': 'All day', 'Recorrência': 'Recurrence', 'Repetir até': 'Repeat until', 'Não se repete': 'Does not repeat', 'Diariamente': 'Daily', 'Semanalmente': 'Weekly', 'Mensalmente': 'Monthly', 'Anualmente': 'Yearly', 'Owners': 'Owners', 'Participantes': 'Participants', 'Cor': 'Color', 'Cor {0}': 'Color {0}', 'Salvar evento': 'Save event', 'Ex.: Reunião de fechamento': 'E.g.: Closing meeting', 'Pauta, links ou observações': 'Agenda, links or notes', 'Digite um nome e pressione Enter': 'Type a name and press Enter', 'Remover {0}': 'Remove {0}', '+{0} mais': '+{0} more', '{0} evento no mês': '{0} event this month', '{0} eventos no mês': '{0} events this month', 'Mês anterior': 'Previous month', 'Próximo mês': 'Next month', 'até {0}': 'until {0}', 'Ninguém adicionado': 'No one added', 'Excluir evento': 'Delete event', 'Excluir "{0}" e todas as suas repetições?': 'Delete "{0}" and all of its repetitions?', 'Excluir o evento "{0}"?': 'Delete the event "{0}"?', 'Evento criado.': 'Event created.', 'Evento atualizado.': 'Event updated.', 'Evento excluído.': 'Event deleted.', 'Não foi possível excluir o evento.': 'Could not delete the event.', 'Não foi possível salvar o evento. Tente novamente.': 'Could not save the event. Please try again.', 'Não foi possível carregar o calendário. Recarregue a página para tentar novamente.': 'Could not load the calendar. Reload the page to try again.', 'Carregando calendário...': 'Loading calendar...', 'Informe o título do evento.': 'Enter the event title.', 'Informe a data do evento.': 'Enter the event date.', 'Adicione pelo menos um owner.': 'Add at least one owner.', 'Informe o horário de início ou marque dia inteiro.': 'Enter a start time or select all day.', 'O horário de fim deve ser depois do início.': 'The end time must be after the start time.', 'A data final da recorrência deve ser depois da data do evento.': 'The recurrence end date must be after the event date.', 'Hoje': 'Today', 'Semanal': 'Weekly', 'Mensal': 'Monthly', 'Sem dia definido': 'No day set', 'Ciclo do mês': 'Monthly cycle', 'Adicionar cartão': 'Add a card', 'Sem atividades': 'No activities', 'Quadro da equipe': 'Team board', 'Segunda': 'Monday', 'Terça': 'Tuesday', 'Quarta': 'Wednesday', 'Quinta': 'Thursday', 'Sexta': 'Friday', 'Filtrar por responsável': 'Filter by owner', 'Compartilhadas': 'Shared', 'Ambos': 'Both', '{0} link': '{0} link', '{0} links': '{0} links', 'Link pendente': 'Link pending', 'Plataformas corporativas de inteligência artificial': 'Corporate artificial intelligence platforms', 'FRENTES DE AGENTES & IA': 'AGENTS & AI WORKSTREAMS', 'Escolha uma frente para ver os painéis dela': 'Pick a workstream to see its panels',
  'Métodos e referências operacionais': 'Operational methods and references',
  'Orientações cadastradas para os painéis': 'Guidelines registered for the panels',
  'Biblioteca de prompts operacionais': 'Operational prompt library',
  'Histórico, documentos e ações dos workshops': 'Workshop history, documents and actions',
  'Power BI, BSC e ferramentas corporativas': 'Power BI, BSC and corporate tools',
  'Assistentes inteligentes e automações': 'Smart assistants and automations',
  'Mudanças de estrutura do produto': 'Product structure changes',
  'Registros, embalagens e rotina de SPI': 'SPI records, packaging and routine',
  'Processos, atividades e acompanhamento': 'Processes, activities and tracking',
  'Fretes, comparativos e conhecimento histórico': 'Freight, comparisons and historical knowledge',
  'Acompanhamento e recursos de CPI': 'CPI tracking and resources',
  'Toda segunda-feira': 'Every Monday', 'Toda terça-feira': 'Every Tuesday', 'Toda quarta-feira': 'Every Wednesday',
  'Toda quinta-feira': 'Every Thursday', 'Toda sexta-feira': 'Every Friday',
};

const LANG_KEY = 'pcl-lang';
let lang = (() => {
  try { return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pt'; } catch { return 'pt'; }
})();

export function getLang() {
  return lang;
}

export function setLang(next) {
  lang = next === 'en' ? 'en' : 'pt';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* preference is optional */ }
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
}

export function tr(text, ...args) {
  const base = lang === 'en' && Object.prototype.hasOwnProperty.call(EN, text) ? EN[text] : text;
  return args.reduce((out, arg, i) => out.split(`{${i}}`).join(String(arg)), base);
}

const originals = new WeakMap();
const ATTRS = ['placeholder', 'aria-label', 'title'];

// Translates fixed page text in place, remembering the Portuguese original so it can switch back.
export function translateStatic(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const raw = originals.get(node);
    const key = raw.trim();
    if (key) node.nodeValue = raw.replace(key, tr(key));
  }
  root.querySelectorAll('*').forEach((el) => {
    ATTRS.forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const store = `data-pt-${attr}`;
      if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr));
      el.setAttribute(attr, tr(el.getAttribute(store)));
    });
  });
}
