const API = 'https://date.nager.at/api/v3/PublicHolidays/';
const CACHE_PREFIX = 'pcl-holidays-v1-';
const CACHE_TTL = 7 * 24 * 3600 * 1000;

// Plants close for Carnival (BR) and Holy Week (MX) even though they are not official public holidays.
const BANK_COUNTRIES = ['BR', 'MX'];

// China announces its closure periods yearly; the API only lists the main day, so official ranges are kept here.
const CN_OFFICIAL = {
  2026: [
    ['2026-01-01', '2026-01-03', 'Ano Novo', "New Year's Day"],
    ['2026-02-15', '2026-02-23', 'Ano Novo Chinês (Festival da Primavera)', 'Chinese New Year (Spring Festival)'],
    ['2026-04-04', '2026-04-06', 'Festival Qingming', 'Qingming Festival'],
    ['2026-05-01', '2026-05-05', 'Dia do Trabalho', 'Labour Day'],
    ['2026-06-19', '2026-06-21', 'Festival do Barco-Dragão', 'Dragon Boat Festival'],
    ['2026-09-25', '2026-09-27', 'Festival do Meio do Outono', 'Mid-Autumn Festival'],
    ['2026-10-01', '2026-10-07', 'Dia Nacional (Golden Week)', 'National Day (Golden Week)'],
  ],
};

// Typical closure spans (days before, days after) used until the official calendar is published.
const CN_SPANS = {
  "New Year's Day": [0, 0, 'Ano Novo'],
  'Chinese New Year (Spring Festival)': [-1, 6, 'Ano Novo Chinês (Festival da Primavera)'],
  'Labour Day': [0, 4, 'Dia do Trabalho'],
  'Dragon Boat Festival': [0, 2, 'Festival do Barco-Dragão'],
  'Mid-Autumn Festival': [0, 2, 'Festival do Meio do Outono'],
  'National Day': [0, 6, 'Dia Nacional (Golden Week)'],
};

const DAY = 86400000;
const toUtc = (iso) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);
const shift = (iso, days) => toIso(toUtc(iso) + days * DAY);

export function todayIn(tz, now) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function daysBetween(fromIso, toIsoDate) {
  return Math.round((toUtc(toIsoDate) - toUtc(fromIso)) / DAY);
}

function readCache(key) {
  try {
    const hit = JSON.parse(localStorage.getItem(key) || 'null');
    return hit && Array.isArray(hit.list) && Date.now() - hit.at < CACHE_TTL ? hit.list : null;
  } catch {
    return null;
  }
}

function writeCache(key, list) {
  try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), list })); } catch { /* storage full or blocked */ }
}

async function fetchYear(cc, year) {
  const key = CACHE_PREFIX + cc + '-' + year;
  const cached = readCache(key);
  if (cached) return cached;
  const res = await fetch(API + year + '/' + cc);
  if (!res.ok) throw new Error('holidays ' + res.status);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('holidays shape');
  const list = raw.filter((h) => h && typeof h.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(h.date)).map((h) => ({
    date: h.date,
    localName: String(h.localName || h.name || ''),
    name: String(h.name || h.localName || ''),
    types: Array.isArray(h.types) ? h.types : [],
    counties: Array.isArray(h.counties) ? h.counties : null,
  }));
  writeCache(key, list);
  return list;
}

function applies(h, cc, region) {
  const local = !h.counties || (region && h.counties.includes(region));
  if (!local) return false;
  return h.types.includes('Public') || (!h.counties && BANK_COUNTRIES.includes(cc) && h.types.includes('Bank'));
}

// Consecutive days with the same name (e.g. Carnival Mon+Tue) collapse into one range.
function mergeDays(items) {
  const out = [];
  items.sort((a, b) => a.start.localeCompare(b.start)).forEach((h) => {
    const last = out[out.length - 1];
    if (last && last.en === h.en && daysBetween(last.end, h.start) <= 1) last.end = h.end > last.end ? h.end : last.end;
    else out.push({ ...h });
  });
  return out;
}

function chinaYear(year, list) {
  if (CN_OFFICIAL[year]) return CN_OFFICIAL[year].map(([start, end, pt, en]) => ({ start, end, pt, en, estimated: false }));
  return list.filter((h) => CN_SPANS[h.name]).map((h) => {
    const [before, after, pt] = CN_SPANS[h.name];
    return { start: shift(h.date, before), end: shift(h.date, after), pt, en: h.name, estimated: true };
  });
}

// Resolves to { [cc]: [{ start, end, pt, en, estimated }] }; a country that fails to load is simply left empty.
export async function loadHolidays(sites, years) {
  const out = {};
  let failures = 0;
  await Promise.all(sites.map(async (s) => {
    const perYear = await Promise.all(years.map((y) => fetchYear(s.cc, y).then((list) => ({ y, list })).catch(() => { failures += 1; return { y, list: null }; })));
    const items = [];
    perYear.forEach(({ y, list }) => {
      if (s.cc === 'CN') { items.push(...chinaYear(y, list || [])); return; }
      if (!list) return;
      list.filter((h) => applies(h, s.cc, s.region)).forEach((h) => {
        items.push({ start: h.date, end: h.date, pt: s.cc === 'BR' ? h.localName : h.name, en: h.name, estimated: false });
      });
    });
    out[s.cc] = mergeDays(items);
  }));
  if (failures === sites.length * years.length) throw new Error('holidays unavailable');
  return out;
}
