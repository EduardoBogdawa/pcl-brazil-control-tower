import { tr } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';
import { fetchAgenda, addAgendaItem, removeAgendaItem } from '@/control-tower/store';

// weekday follows the whiteboard order: 1 = segunda ... 7 = domingo.
const DAYS = [
  { n: 1, short: 'Seg', long: 'Segunda' }, { n: 2, short: 'Ter', long: 'Terça' }, { n: 3, short: 'Qua', long: 'Quarta' },
  { n: 4, short: 'Qui', long: 'Quinta' }, { n: 5, short: 'Sex', long: 'Sexta' }, { n: 6, short: 'Sáb', long: 'Sábado' }, { n: 7, short: 'Dom', long: 'Domingo' },
];

function todayWeekday() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

export function createWeeklyAgenda({ esc, showToast, onChange }) {
  let items = null;
  let loadFailed = false;
  let loading = false;
  const modal = document.getElementById('agendaModal');
  const board = document.getElementById('agendaBoard');

  function load() {
    if (loading) return;
    loading = true;
    fetchAgenda().then((rows) => { items = rows; draw(); onChange(); })
      .catch(() => { loadFailed = true; draw(); onChange(); })
      .finally(() => { loading = false; });
  }

  function dayItems(n) {
    return (items || []).filter((x) => x.weekday === n).sort((a, b) => a.position - b.position);
  }

  function draw() {
    if (!modal.classList.contains('on')) return;
    if (loadFailed) { board.innerHTML = '<div class="load-state error">' + esc(tr('Não foi possível carregar a agenda. Recarregue a página para tentar novamente.')) + '</div>'; return; }
    if (!items) { board.innerHTML = '<div class="load-state">' + esc(tr('Carregando agenda...')) + '</div>'; return; }
    const today = todayWeekday();
    board.innerHTML = DAYS.map((d) => {
      const list = dayItems(d.n);
      return '<section class="agenda-day' + (d.n === today ? ' today' : '') + (d.n > 5 ? ' weekend' : '') + '" aria-label="' + esc(tr(d.long)) + '">'
        + '<header><b>' + esc(tr(d.short)) + '</b>' + (d.n === today ? '<span class="agenda-today">' + esc(tr('Hoje')) + '</span>' : '') + '<small>' + list.length + '</small></header>'
        + '<ul>' + (list.length ? list.map((x) => '<li><span class="today-dot"></span><span class="agenda-txt">' + esc(x.title) + '</span><button type="button" class="agenda-del" data-agenda-del="' + esc(x.id) + '" aria-label="' + esc(tr('Remover {0}', x.title)) + '" title="' + esc(tr('Remover')) + '">' + icon('x') + '</button></li>').join('') : '<li class="agenda-empty">' + esc(tr('Sem itens')) + '</li>') + '</ul>'
        + '<form class="agenda-add" data-agenda-day="' + d.n + '"><label class="sr-only" for="agendaNew' + d.n + '">' + esc(tr('Novo item para {0}', tr(d.long))) + '</label><input id="agendaNew' + d.n + '" maxlength="80" autocomplete="off" placeholder="' + esc(tr('Adicionar item')) + '"><button type="submit" aria-label="' + esc(tr('Adicionar')) + '">' + icon('plus') + '</button></form>'
        + '</section>';
    }).join('');
  }

  board.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-agenda-day]');
    if (!f) return;
    e.preventDefault();
    const input = f.querySelector('input');
    const title = input.value.trim();
    if (!title) { input.focus(); return; }
    const weekday = Number(f.getAttribute('data-agenda-day'));
    const list = dayItems(weekday);
    const btn = f.querySelector('button');
    btn.disabled = true;
    addAgendaItem({ weekday, title: title.slice(0, 80), position: list.length ? list[list.length - 1].position + 1 : 1 })
      .then((saved) => { items = items.concat(saved); draw(); onChange(); const again = document.getElementById('agendaNew' + weekday); if (again) again.focus(); })
      .catch(() => { showToast(tr('Não foi possível salvar o item.'), true); btn.disabled = false; });
  });

  board.addEventListener('click', (e) => {
    const b = e.target.closest('[data-agenda-del]');
    if (!b) return;
    const id = b.getAttribute('data-agenda-del');
    b.disabled = true;
    removeAgendaItem(id)
      .then(() => { items = items.filter((x) => x.id !== id); draw(); onChange(); })
      .catch(() => { showToast(tr('Não foi possível remover o item.'), true); b.disabled = false; });
  });

  const close = () => modal.classList.remove('on');
  document.getElementById('agendaClose').onclick = close;
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  return {
    open() {
      modal.classList.add('on');
      if (!items && !loadFailed) load();
      draw();
    },
    // null while loading (starts a fetch), false if loading failed.
    today() {
      if (loadFailed) return false;
      if (!items) { load(); return null; }
      return dayItems(todayWeekday());
    },
  };
}
