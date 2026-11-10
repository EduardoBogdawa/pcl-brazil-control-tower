import { icon } from '@/control-tower/icons.js';
import { tr } from '@/control-tower/i18n';

// Preferences are personal (there is no sign-in), so they stay in this browser.
const KEY = 'ct-prefs';
const DEFAULTS = {
  autoTheme: false,
  density: 'comfortable',
  start: 'overview',
  motion: 'full',
  welcome: false,
  presentSeconds: 12,
  blocks: { kpi: true, today: true, top: true, pins: true },
};

export function loadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw || typeof raw !== 'object') return structuredClone(DEFAULTS);
    // Older saves stored the welcome screen as on; it is now opt-in for everyone.
    delete raw.splash;
    return { ...structuredClone(DEFAULTS), ...raw, blocks: { ...DEFAULTS.blocks, ...(raw.blocks || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function savePrefs(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* optional */ }
}

export function autoThemeNow() {
  const h = new Date().getHours();
  return h >= 7 && h < 18 ? 'light' : 'dark';
}

export function applyPrefs(p) {
  const b = document.body;
  b.classList.toggle('density-compact', p.density === 'compact');
  b.classList.toggle('motion-reduced', p.motion === 'reduced');
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// getCategories returns [{name,label}]; onChange receives the saved preferences after every edit.
export function createPreferences({ getCategories, onChange }) {
  let prefs = loadPrefs();
  const root = document.createElement('div');
  root.className = 'modal';
  root.id = 'prefsModal';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'prefsTitle');
  document.body.appendChild(root);

  function seg(name, value, options) {
    return '<div class="seg" role="radiogroup">' + options.map(([v, label]) =>
      '<label class="seg-opt"><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (String(value) === String(v) ? ' checked' : '') + '><span>' + esc(tr(label)) + '</span></label>').join('') + '</div>';
  }

  function toggle(name, on, label, hint) {
    return '<label class="pref-toggle"><span><b>' + esc(tr(label)) + '</b>' + (hint ? '<small>' + esc(tr(hint)) + '</small>' : '') + '</span><input type="checkbox" name="' + name + '"' + (on ? ' checked' : '') + '><i class="switch" aria-hidden="true"></i></label>';
  }

  function draw() {
    const cats = getCategories();
    const startOpts = '<option value="overview">' + esc(tr('Visão geral')) + '</option><option value="last">' + esc(tr('Última área aberta')) + '</option>'
      + cats.map((c) => '<option value="cat:' + esc(c.name) + '">' + esc(tr(c.label)) + '</option>').join('');
    root.innerHTML = '<div class="dialog prefs-dialog"><div class="prefs-head"><span class="prefs-ico">' + icon('settings') + '</span><div><h2 id="prefsTitle">' + tr('Preferências') + '</h2><p>' + tr('Ajustes pessoais, salvos neste navegador.') + '</p></div><button type="button" class="icon-btn" data-prefs-close aria-label="' + esc(tr('Fechar')) + '">' + icon('x') + '</button></div>'
      + '<form class="prefs-body" novalidate>'
      + '<section><h3>' + tr('Aparência') + '</h3>'
      + toggle('autoTheme', prefs.autoTheme, 'Tema automático', 'Claro das 7h às 18h, escuro no restante do dia')
      + '<div class="pref-row"><span><b>' + tr('Densidade dos cartões') + '</b><small>' + tr('O modo compacto mostra mais itens por tela') + '</small></span>' + seg('density', prefs.density, [['comfortable', 'Confortável'], ['compact', 'Compacto']]) + '</div>'
      + '<div class="pref-row"><span><b>' + tr('Animações') + '</b><small>' + tr('Reduza para uma navegação mais leve') + '</small></span>' + seg('motion', prefs.motion, [['full', 'Completas'], ['reduced', 'Reduzidas']]) + '</div>'
      + toggle('welcome', prefs.welcome, 'Tela de abertura', 'Saudação rápida no primeiro acesso do dia')
      + '</section>'
      + '<section><h3>' + tr('Navegação') + '</h3>'
      + '<label class="pref-row"><span><b>' + tr('Tela inicial') + '</b><small>' + tr('O que abre quando você entra no painel') + '</small></span><select name="start">' + startOpts + '</select></label>'
      + '<div class="pref-row"><span><b>' + tr('Modo apresentação') + '</b><small>' + tr('Tempo de cada tela') + '</small></span>' + seg('presentSeconds', prefs.presentSeconds, [[8, '8 s'], [12, '12 s'], [20, '20 s']]) + '</div>'
      + '</section>'
      + '<section><h3>' + tr('Blocos da visão geral') + '</h3><div class="pref-blocks">'
      + toggle('b_kpi', prefs.blocks.kpi, 'Indicadores')
      + toggle('b_today', prefs.blocks.today, 'Resumo do dia')
      + toggle('b_top', prefs.blocks.top, 'Mais acessados')
      + toggle('b_pins', prefs.blocks.pins, 'Favoritos e recentes')
      + '</div></section>'
      + '</form><div class="dialog-actions"><button type="button" class="btn" data-prefs-reset>' + tr('Restaurar padrão') + '</button><span class="spacer"></span><button type="button" class="btn primary" data-prefs-close>' + tr('Concluir') + '</button></div></div>';
    const sel = root.querySelector('select[name=start]');
    sel.value = Array.prototype.some.call(sel.options, (o) => o.value === prefs.start) ? prefs.start : 'overview';
  }

  function read() {
    const f = root.querySelector('form');
    const val = (n) => { const el = f.querySelector('[name="' + n + '"]:checked') || f.querySelector('select[name="' + n + '"]'); return el ? el.value : ''; };
    const chk = (n) => !!f.querySelector('[name="' + n + '"]').checked;
    prefs = {
      autoTheme: chk('autoTheme'),
      density: val('density') === 'compact' ? 'compact' : 'comfortable',
      motion: val('motion') === 'reduced' ? 'reduced' : 'full',
      welcome: chk('welcome'),
      start: val('start') || 'overview',
      presentSeconds: [8, 12, 20].includes(+val('presentSeconds')) ? +val('presentSeconds') : 12,
      blocks: { kpi: chk('b_kpi'), today: chk('b_today'), top: chk('b_top'), pins: chk('b_pins') },
    };
    savePrefs(prefs);
    applyPrefs(prefs);
    onChange(prefs);
  }

  function close() { root.classList.remove('on'); }

  root.addEventListener('change', read);
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-prefs-close]')) close();
    else if (e.target.closest('[data-prefs-reset]')) { prefs = structuredClone(DEFAULTS); savePrefs(prefs); applyPrefs(prefs); onChange(prefs); draw(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('on')) close(); });

  return {
    open() { draw(); root.classList.add('on'); const first = root.querySelector('input,select'); if (first) first.focus(); },
    get: () => prefs,
    // Header theme buttons are an explicit choice, so they switch the automatic theme off.
    disableAutoTheme() { if (!prefs.autoTheme) return; prefs = { ...prefs, autoTheme: false }; savePrefs(prefs); },
  };
}
