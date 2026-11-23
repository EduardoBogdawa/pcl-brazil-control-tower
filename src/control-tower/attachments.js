import { tr, getLang } from '@/control-tower/i18n';
import { icon } from '@/control-tower/icons.js';
import { uploadAttachment, attachmentUrl, attachmentExt, ATTACHMENT_TYPES, ATTACHMENT_MAX_BYTES } from '@/control-tower/store';

const $ = (id) => document.getElementById(id);
const KINDS = { ppt: 'ppt', pptx: 'ppt', ppsx: 'ppt', pdf: 'pdf', doc: 'doc', docx: 'doc', xls: 'xls', xlsx: 'xls', csv: 'xls' };

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sizeLabel(bytes) {
  return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

function itemHtml(a, i) {
  const ext = attachmentExt(a.name);
  const date = new Date(a.uploadedAt).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'pt-BR');
  return '<li class="attach-item" style="--i:' + i + '"><span class="attach-kind k-' + (KINDS[ext] || 'img') + '">' + esc(ext.toUpperCase()) + '</span>'
    + '<a class="attach-name" href="' + esc(attachmentUrl(a.path, a.name)) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(a.name) + '</b><small>' + esc(sizeLabel(a.size)) + ' · ' + esc(date) + '</small></a>'
    + '<a class="attach-act" href="' + esc(attachmentUrl(a.path, a.name)) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(tr('Baixar {0}', a.name)) + '" title="' + esc(tr('Baixar')) + '">' + icon('download') + '</a>'
    + '<button type="button" class="attach-act danger" data-attach-remove="' + i + '" aria-label="' + esc(tr('Remover {0}', a.name)) + '" title="' + esc(tr('Remover')) + '">' + icon('x') + '</button></li>';
}

export function attachmentChipHtml(d) {
  const n = (d.attachments || []).length;
  if (!n) return '';
  return '<button type="button" class="attach-chip" data-instruction="' + esc(d.id) + '">' + icon('paperclip') + esc(tr(n === 1 ? '{0} anexo' : '{0} anexos', n)) + '</button>';
}

export function createAttachments({ findPanel, persist }) {
  const input = $('attachInput');
  const list = $('attachList');
  const status = $('attachStatus');
  const add = $('attachAdd');
  let panelId = '';
  input.accept = Object.keys(ATTACHMENT_TYPES).map((e) => '.' + e).join(',');
  add.insertAdjacentHTML('afterbegin', icon('paperclip'));

  function say(msg, isError) {
    status.textContent = msg;
    status.classList.toggle('error', !!isError);
  }

  function draw() {
    const d = findPanel(panelId);
    const items = (d && d.attachments) || [];
    list.innerHTML = items.length ? items.map(itemHtml).join('') : '<li class="attach-empty">' + esc(tr('Nenhum arquivo anexado ainda.')) + '</li>';
    list.querySelectorAll('[data-attach-remove]').forEach((b) => {
      b.onclick = () => {
        const p = findPanel(panelId);
        const a = p && p.attachments[Number(b.getAttribute('data-attach-remove'))];
        if (!a || !window.confirm(tr('Remover "{0}" deste painel?', a.name))) return;
        p.attachments = p.attachments.filter((x) => x !== a);
        persist(p);
        draw();
        say(tr('Anexo removido.'));
      };
    });
  }

  add.onclick = () => input.click();
  input.onchange = async () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file || !panelId) return;
    if (!ATTACHMENT_TYPES[attachmentExt(file.name)]) return say(tr('Tipo de arquivo não aceito. Use PowerPoint, PDF, Word, Excel ou imagem.'), true);
    if (file.size > ATTACHMENT_MAX_BYTES) return say(tr('O arquivo passa de 25 MB. Reduza o tamanho e tente novamente.'), true);
    const id = panelId;
    add.disabled = true;
    add.classList.add('busy');
    say(tr('Enviando {0}...', file.name));
    try {
      const a = await uploadAttachment(id, file);
      const p = findPanel(id);
      if (!p) throw new Error('panel-missing');
      p.attachments = (p.attachments || []).concat(a);
      persist(p);
      if (panelId === id) draw();
      say(tr('Arquivo anexado. Todos que abrirem este painel podem baixá-lo.'));
    } catch (e) {
      console.error('attachment upload failed', e);
      say(tr('Não foi possível anexar o arquivo. Verifique a conexão e tente novamente.'), true);
    } finally {
      add.disabled = false;
      add.classList.remove('busy');
    }
  };

  return {
    open(d) {
      panelId = d.id;
      say('');
      draw();
    },
  };
}
