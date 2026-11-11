import { supabase } from '@/lib/supabase';
import { text, escapeHtml as esc } from '@/control-tower/category-support.js';

export function mountBomAudits(root) {
  const section = document.createElement('section');
  section.className = 'category-support';
  const today = new Date();
  const maxDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  const results = { ok: text('Sem divergências', 'No discrepancies'), findings: text('Com divergências', 'Discrepancies found'), pending: text('Em análise', 'Under review') };
  section.innerHTML = '<h3>' + text('Histórico de auditorias BOM', 'BOM audit history') + '</h3><p>' + text('Registre auditorias realizadas. Histórico compartilhado com os usuários desta torre.', 'Record completed audits. History is shared with this tower’s users.') + '</p><details class="support-guide"><summary>' + text('Registrar auditoria', 'Record audit') + '</summary><form class="bom-form"><div class="support-fields"><label>' + text('Data realizada', 'Audit date') + '<input name="audit_date" type="date" required max="' + maxDate + '"></label><label>' + text('Planta / item / escopo', 'Plant / item / scope') + '<input name="scope" required maxlength="160"></label><label>' + text('Auditor responsável', 'Auditor') + '<input name="auditor" required maxlength="100"></label><label>' + text('Resultado', 'Result') + '<select name="result">' + Object.entries(results).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select></label></div><label>' + text('Constatações e ações', 'Findings and actions') + '<textarea name="notes" maxlength="2000" rows="3"></textarea></label><button class="btn" type="submit">' + text('Salvar auditoria', 'Save audit') + '</button><button class="btn bom-cancel" type="button" hidden>' + text('Cancelar edição', 'Cancel editing') + '</button></form></details><p class="support-status" role="status"></p><div class="bom-history"></div><button type="button" class="btn bom-refresh">' + text('Atualizar histórico', 'Refresh history') + '</button>';
  root.prepend(section);
  const form = section.querySelector('form'), status = section.querySelector('[role="status"]'), history = section.querySelector('.bom-history'), cancel = section.querySelector('.bom-cancel');
  let editingId = null;
  cancel.onclick = () => { editingId = null; form.reset(); cancel.hidden = true; };
  async function load() {
    history.textContent = text('Carregando auditorias…', 'Loading audits…');
    try {
      const { data, error } = await supabase.from('bom_audit_records').select('id,audit_date,scope,auditor,result,notes').order('audit_date', { ascending: false });
      if (error || !Array.isArray(data)) throw error || new Error('Invalid response');
      if (!section.isConnected) return;
      history.innerHTML = data.length ? '<div class="support-table-wrap"><table class="support-table"><caption>' + text('Auditorias realizadas', 'Completed audits') + '</caption><thead><tr>' + [text('Data', 'Date'), text('Escopo', 'Scope'), text('Auditor', 'Auditor'), text('Resultado', 'Result'), text('Constatações', 'Findings'), text('Ações', 'Actions')].map((v) => '<th scope="col">' + v + '</th>').join('') + '</tr></thead><tbody>' + data.map((row) => '<tr><td>' + esc(row.audit_date) + '</td><td>' + esc(row.scope) + '</td><td>' + esc(row.auditor) + '</td><td>' + esc(results[row.result] || row.result) + '</td><td>' + esc(row.notes) + '</td><td><button type="button" class="btn" data-audit="' + esc(row.id) + '">' + text('Editar', 'Edit') + '</button></td></tr>').join('') + '</tbody></table></div>' : '<p>' + text('Nenhuma auditoria registrada. Use Registrar auditoria para começar.', 'No audits recorded. Use Record audit to get started.') + '</p>';
      history.querySelectorAll('[data-audit]').forEach((button) => {
        button.onclick = () => {
          const row = data.find((item) => item.id === button.dataset.audit);
          editingId = row.id;
          ['audit_date', 'scope', 'auditor', 'result', 'notes'].forEach((key) => { form.elements.namedItem(key).value = row[key]; });
          section.querySelector('details').open = true;
          cancel.hidden = false;
          form.elements.namedItem('audit_date').focus();
        };
      });
    } catch { history.textContent = text('Não foi possível carregar o histórico. Tente atualizar.', 'Unable to load history. Try refreshing.'); }
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    ['scope', 'auditor', 'notes'].forEach((key) => { values[key] = values[key].trim(); });
    if (!values.scope || !values.auditor) { status.textContent = text('Preencha escopo e auditor.', 'Enter scope and auditor.'); return; }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    status.textContent = text('Salvando…', 'Saving…');
    try {
      const request = editingId ? supabase.from('bom_audit_records').update(values).eq('id', editingId) : supabase.from('bom_audit_records').insert(values);
      const { data, error } = await request.select('id');
      if (error || !data?.length) throw error || new Error('Not saved');
      editingId = null; form.reset(); cancel.hidden = true;
      status.textContent = text('Auditoria salva.', 'Audit saved.');
      await load();
    } catch { status.textContent = text('Não foi possível salvar. Confira os campos e tente novamente.', 'Unable to save. Check the fields and try again.'); }
    finally { button.disabled = false; }
  };
  section.querySelector('.bom-refresh').onclick = load;
  load();
}
