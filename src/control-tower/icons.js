const PATHS = {
  home: '<rect width="7" height="9" x="3" y="3" rx="1.5"/><rect width="7" height="5" x="14" y="3" rx="1.5"/><rect width="7" height="9" x="14" y="12" rx="1.5"/><rect width="7" height="5" x="3" y="16" rx="1.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  star: '<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.8a3.4 3.4 0 0 1 0 6.4M18 14.6c1.8.8 3 2.7 3 5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  palette: '<path d="M12 2a10 10 0 0 0 0 20c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13a1.6 1.6 0 0 1-.43-1.12 1.64 1.64 0 0 1 1.66-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6 17.46 2 12 2z"/><circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};

export function icon(name, cls) {
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (PATHS[name] || PATHS.layers) + '</svg>';
}

// Category glyphs: thin strokes over a soft duotone fill (.fl) in the category color.
const GLYPHS = {
  home: '<rect class="fl" x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  link: '<rect class="fl" x="2" y="7" width="20" height="10" rx="5"/><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><path d="M8 12h8"/>',
  bot: '<rect class="fl" x="4" y="8" width="16" height="12" rx="4"/><rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 8V4.5M9.5 4.5h5M2 13v3M22 13v3M9.5 12.5v2M14.5 12.5v2"/>',
  ai: '<path class="fl" d="M11 4l1.9 5.6 5.6 1.9-5.6 1.9L11 19l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M11 4l1.9 5.6 5.6 1.9-5.6 1.9L11 19l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M19 2.5v4M17 4.5h4M19 17v4M17 19h4"/>',
  award: '<circle class="fl" cx="12" cy="9" r="6"/><circle cx="12" cy="9" r="6"/><path d="M8.6 13.9 7 21.5l5-3 5 3-1.6-7.6"/><path d="m9.5 9 1.8 1.8 3.2-3.3"/>',
  book: '<path class="fl" d="M2.5 4h5.5a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2.5z"/><path d="M12 8v13"/><path d="M2.5 18V4h5.5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5.5v14H15a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M15 9h3.5M15 12.5h3.5"/>',
  prompt: '<rect class="fl" x="3" y="4" width="18" height="16" rx="3.5"/><rect x="3" y="4" width="18" height="16" rx="3.5"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h3.5"/>',
  users: '<circle class="fl" cx="9" cy="8" r="3.5"/><circle cx="9" cy="8" r="3.5"/><path d="M3 20.5c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.8a3.4 3.4 0 0 1 0 6.4M18 14.6c1.8.8 3 2.7 3 5"/>',
  calendar: '<path class="fl" d="M3 10V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v3z"/><rect width="18" height="17" x="3" y="4.5" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18M7.5 14h3M13.5 14h3M7.5 17.5h3"/>',
  tree: '<rect class="fl" x="9" y="2.5" width="6" height="5" rx="1.5"/><rect x="9" y="2.5" width="6" height="5" rx="1.5"/><rect x="2.5" y="16.5" width="6" height="5" rx="1.5"/><rect x="15.5" y="16.5" width="6" height="5" rx="1.5"/><path d="M12 7.5V12M5.5 16.5V12h13v4.5"/>',
  cube: '<path class="fl" d="M12 2.8 20 7.3l-8 4.5-8-4.5z"/><path d="M12 2.8 20 7.3v9.4l-8 4.5-8-4.5V7.3z"/><path d="m4 7.3 8 4.5 8-4.5M12 11.8v9.4"/>',
  swap: '<rect class="fl" x="2.5" y="2.5" width="19" height="19" rx="6"/><path d="M6.5 9h11M14.5 6l3 3-3 3"/><path d="M17.5 15h-11M9.5 12l-3 3 3 3"/>',
  delta: '<path class="fl" d="M14 3v5h5z"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6M12 11v6"/>',
  trend: '<path class="fl" d="M4 16 9 11l4 3 7-7v13.5H4z"/><path d="M3 20.5h18"/><path d="m4 16 5-5 4 3 7-7"/><path d="M15.5 7H20v4.5"/>',
  rocket: '<path class="fl" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><circle cx="16" cy="8" r="1.6"/>',
  layers: '<path class="fl" d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
};

const CATEGORY_GLYPHS = {
  'Acessos e Links': 'link', Agentes: 'bot', 'Best Practice': 'award', 'BOM Audit': 'tree', CM: 'swap',
  CPI: 'trend', ECR: 'delta', 'Instrução': 'book', 'Packaging/SPI': 'cube', 'PC&L Advanced': 'rocket', IA: 'ai',
  Prompt: 'prompt', Workshops: 'users', Todos: 'home', 'Calendário': 'calendar',
};

export function categoryIcon(name) {
  const g = GLYPHS[CATEGORY_GLYPHS[name]] || GLYPHS.layers;
  return '<svg class="ico glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + g + '</svg>';
}

// Spread across the hue wheel so neighbouring categories stay distinguishable.
const CATEGORY_TINTS = {
  'Acessos e Links': '#3B82F6', Calendário: '#0EA5E9', IA: '#06B6D4', Agentes: '#14B8A6', 'Packaging/SPI': '#10B981',
  CPI: '#16A34A', Workshops: '#65A30D', 'Best Practice': '#CA8A04', 'BOM Audit': '#D97706', ECR: '#F97316',
  'Instrução': '#C2410C', CM: '#EC4899', 'PC&L Advanced': '#E4002B', Prompt: '#64748B',
};
const TINT_FALLBACK = ['#3B82F6', '#14B8A6', '#22C55E', '#F59E0B', '#0EA5E9', '#F97316', '#10B981', '#64748B'];

// Categories created later get a stable color derived from their name.
export function categoryTint(name) {
  if (CATEGORY_TINTS[name]) return CATEGORY_TINTS[name];
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINT_FALLBACK[h % TINT_FALLBACK.length];
}

const BRAND = {
  powerbi: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="4" height="9" rx="1.2" fill="#F8D74A"/><rect x="10" y="7" width="4" height="13" rx="1.2" fill="#F2C811"/><rect x="16" y="3.5" width="4" height="16.5" rx="1.2" fill="#E8A700"/></svg>',
  excel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h9.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H9z" fill="#21A366"/><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5V9h-6z" fill="#33C481"/><path d="M14 15h6v3.5a1.5 1.5 0 0 1-1.5 1.5H14z" fill="#185C37"/><rect x="3" y="7" width="10" height="10" rx="1.4" fill="#107C41"/><path d="m5.6 9.4 1.7 2.6-1.8 2.6h1.5L8 12.9l1 1.7h1.5l-1.8-2.6 1.7-2.6H9L8 11.1 7.1 9.4z" fill="#fff"/></svg>',
  sharepoint: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="13" cy="8.5" r="5.5" fill="#036C70"/><circle cx="16.5" cy="13.5" r="4.5" fill="#1A9BA1"/><circle cx="13.5" cy="17.5" r="3.5" fill="#37C6D0"/><rect x="3" y="7" width="10" height="10" rx="1.4" fill="#03787C"/><path d="M6.2 13.4c.4.3 1 .5 1.6.5.6 0 .9-.2.9-.5 0-.8-2.6-.6-2.6-2.4 0-1 .8-1.6 2-1.6.6 0 1.1.1 1.5.3v1.1c-.4-.3-.9-.4-1.4-.4-.5 0-.8.2-.8.5 0 .8 2.6.6 2.6 2.4 0 1-.8 1.6-2.1 1.6-.7 0-1.3-.2-1.7-.4z" fill="#fff"/></svg>',
  powerapps: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 12l-9 9z" fill="#E04F8E"/><path d="M12 3 3 12l9 9z" fill="#B0185F"/><path d="M8 12 12 8l4 4-4 4z" fill="#fff" opacity=".9"/></svg>',
  trello: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="#0C66E4"/><rect x="6" y="6" width="5" height="11" rx="1.2" fill="#fff"/><rect x="13" y="6" width="5" height="7" rx="1.2" fill="#fff"/></svg>',
  copilot: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="cpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2DD4BF"/><stop offset=".55" stop-color="#0EA5E9"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs><path d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4L12 19.5l-2.4-6.1L3.5 11l6.1-2.4z" fill="url(#cpg)"/><circle cx="18.5" cy="18.5" r="2" fill="#0EA5E9"/></svg>',
  bsc: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="#fff"/><path d="M12 12 19 5M16 5h3v3"/></svg>',
  tito: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M12 6v13" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/><circle cx="18" cy="18" r="2" fill="#E4002B"/></svg>',
  web: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a13.5 13.5 0 0 0 0 18 13.5 13.5 0 0 0 0-18M3 12h18"/></svg>',
};

const BRAND_LABEL = {
  powerbi: 'Power BI', excel: 'Excel', sharepoint: 'SharePoint', powerapps: 'Power Apps', trello: 'Trello',
  copilot: 'Copilot Studio', bsc: 'Balanced Scorecard', tito: 'Tito', web: 'Portal',
};

function brandOf(d) {
  const u = (d.url || '').toLowerCase();
  const n = (d.name || '').toLowerCase();
  if (d.id === 'bsc-balanced-scorecard' || u.includes('bsc.nexteer.app')) return 'bsc';
  if (u.includes('apps.powerapps.com')) return 'powerapps';
  if (d.id === 'power-bi-hub' || u.includes('powerbi.com') || n.includes('power bi')) return 'powerbi';
  if (u.includes('tito.com.br') || n.includes('tito')) return 'tito';
  if (u.includes('trello.com')) return 'trello';
  if (/excel|xlsx/.test(u + n)) return 'excel';
  if (u.includes('sharepoint.com')) return 'sharepoint';
  if (u.includes('copilotstudio.microsoft.com')) return 'copilot';
  return 'web';
}

function hostOf(url) {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) ? u.hostname : '';
  } catch {
    return '';
  }
}

// Google's favicon service answers unknown sites with a generic 16px globe, so tiny results fall back to our own icon.
function faviconImg(host) {
  if (!/^[a-z0-9.-]+$/i.test(host)) return '';
  return '<img class="portal-fav" src="https://www.google.com/s2/favicons?sz=64&domain=' + host + '" alt="" loading="lazy" referrerpolicy="no-referrer"'
    + ' onload="if(this.naturalWidth<=16)this.remove();else this.parentNode.classList.add(\'has-fav\')" onerror="this.remove()">';
}

export function portalIcon(d) {
  const b = brandOf(d);
  const label = b === 'web' ? (hostOf(d.url) || BRAND_LABEL.web) : BRAND_LABEL[b];
  const fav = b === 'web' ? faviconImg(hostOf(d.url)) : '';
  return '<span class="portal-logo ' + b + '" role="img" aria-label="' + label + '" title="' + label + '">' + BRAND[b] + fav + '</span>';
}
