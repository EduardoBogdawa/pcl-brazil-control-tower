import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  label: string;
  section: string;
  description: string;
  color: string;
  position: number;
  show_on_overview: boolean;
}

export interface Panel {
  id: string;
  name: string;
  category: string;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  name: string;
  owner: string;
  period: 'Semanal' | 'Mensal';
  day: string;
}

const CATEGORY_COLUMNS = 'id, name, label, section, description, color, position, show_on_overview';
const TASK_COLUMNS = 'id, name, owner, period, day';

// Deletions only stamp deleted_at, so removed items stay recoverable.
const deletedNow = () => ({ deleted_at: new Date().toISOString() });

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('ct_categories')
    .select(CATEGORY_COLUMNS)
    .is('deleted_at', null)
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: Omit<Category, 'id' | 'position' | 'show_on_overview'>, position: number): Promise<Category> {
  const { data, error } = await supabase
    .from('ct_categories')
    .insert({ ...input, position, show_on_overview: true })
    .select(CATEGORY_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Categoria não foi criada.');
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('ct_categories').update(deletedNow()).eq('id', id);
  if (error) throw error;
}

// Returns null when the shared table has never been filled (no rows at all, deleted or not).
export async function fetchPanels(): Promise<Panel[] | null> {
  const { data, error } = await supabase.from('ct_panels').select('id, data, created_at, deleted_at');
  if (error) throw error;
  if (!data || !data.length) return null;
  return data
    .filter((row) => !row.deleted_at && row.data && typeof row.data === 'object')
    .map((row) => ({ ...(row.data as Panel), id: row.id, createdAt: row.created_at }));
}

function toRow(panel: Panel) {
  // createdAt mirrors the row's own column, so it is kept out of the stored panel data.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, ...data } = panel;
  return { id: panel.id, category: panel.category, data, updated_at: new Date().toISOString() };
}

export async function savePanel(panel: Panel): Promise<void> {
  const { error } = await supabase.from('ct_panels').upsert(toRow(panel));
  if (error) throw error;
}

export async function deletePanel(id: string): Promise<void> {
  const { error } = await supabase.from('ct_panels').update(deletedNow()).eq('id', id);
  if (error) throw error;
}

// Several visitors may open the app before the first seed finishes; existing rows are left untouched.
export async function seedPanels(panels: Panel[]): Promise<void> {
  const { error } = await supabase
    .from('ct_panels')
    .upsert(panels.map(toRow), { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function fetchTasks(): Promise<Task[] | null> {
  const { data, error } = await supabase.from('ct_tasks').select(`${TASK_COLUMNS}, deleted_at`);
  if (error) throw error;
  if (!data || !data.length) return null;
  return data
    .filter((t) => !t.deleted_at)
    .map((t) => ({ id: t.id, name: t.name, owner: t.owner, period: t.period, day: t.day }));
}

export async function createTasks(tasks: Omit<Task, 'id'>[]): Promise<Task[]> {
  const { data, error } = await supabase.from('ct_tasks').insert(tasks).select(TASK_COLUMNS);
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('ct_tasks').update(deletedNow()).eq('id', id);
  if (error) throw error;
}

export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string | null;
  end_time: string | null;
  owners: string[];
  participants: string[];
  recurrence: Recurrence;
  recurrence_until: string | null;
  color: string;
}

const EVENT_COLUMNS = 'id, title, description, start_date, start_time, end_time, owners, participants, recurrence, recurrence_until, color';

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('ct_events')
    .select(EVENT_COLUMNS)
    .is('deleted_at', null)
    .order('start_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CalendarEvent[];
}

export async function saveEvent(input: Omit<CalendarEvent, 'id'>, id?: string): Promise<CalendarEvent> {
  const query = id
    ? supabase.from('ct_events').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id)
    : supabase.from('ct_events').insert(input);
  const { data, error } = await query.select(EVENT_COLUMNS).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Evento não foi salvo.');
  return data as CalendarEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('ct_events').update(deletedNow()).eq('id', id);
  if (error) throw error;
}

export interface AgendaItem {
  id: string;
  weekday: number;
  title: string;
  position: number;
}

const AGENDA_COLUMNS = 'id, weekday, title, position';

export async function fetchAgenda(): Promise<AgendaItem[]> {
  const { data, error } = await supabase
    .from('ct_agenda_items')
    .select(AGENDA_COLUMNS)
    .is('deleted_at', null)
    .order('weekday', { ascending: true })
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []) as AgendaItem[];
}

export async function addAgendaItem(input: Omit<AgendaItem, 'id'>): Promise<AgendaItem> {
  const { data, error } = await supabase.from('ct_agenda_items').insert(input).select(AGENDA_COLUMNS).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Item da agenda não foi salvo.');
  return data as AgendaItem;
}

export async function removeAgendaItem(id: string): Promise<void> {
  const { error } = await supabase.from('ct_agenda_items').update(deletedNow()).eq('id', id);
  if (error) throw error;
}

export interface PanelStat {
  panel_id: string;
  open_count: number;
  last_opened_at: string;
}

export async function fetchPanelStats(): Promise<PanelStat[]> {
  const { data, error } = await supabase
    .from('ct_panel_stats')
    .select('panel_id, open_count, last_opened_at')
    .order('open_count', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as PanelStat[];
}

export async function trackOpen(panelId: string): Promise<void> {
  const { error } = await supabase.rpc('ct_track_open', { p_panel_id: panelId });
  if (error) throw error;
}

export type TrashKind = 'panel' | 'task' | 'event' | 'category';

export interface TrashItem {
  kind: TrashKind;
  id: string;
  title: string;
  detail: string;
  deleted_at: string;
}

const TRASH_TABLE: Record<TrashKind, string> = {
  panel: 'ct_panels',
  task: 'ct_tasks',
  event: 'ct_events',
  category: 'ct_categories',
};

export const TRASH_DAYS = 30;

export async function fetchTrash(): Promise<TrashItem[]> {
  const since = new Date(Date.now() - TRASH_DAYS * 86400000).toISOString();
  const [panels, tasks, events, cats] = await Promise.all([
    supabase.from('ct_panels').select('id, category, data, deleted_at').gte('deleted_at', since),
    supabase.from('ct_tasks').select('id, name, owner, deleted_at').gte('deleted_at', since),
    supabase.from('ct_events').select('id, title, start_date, deleted_at').gte('deleted_at', since),
    supabase.from('ct_categories').select('id, label, deleted_at').gte('deleted_at', since),
  ]);
  const failed = [panels, tasks, events, cats].find((r) => r.error);
  if (failed?.error) throw failed.error;
  const items: TrashItem[] = [
    ...(panels.data ?? []).map((r) => ({
      kind: 'panel' as const, id: r.id, deleted_at: r.deleted_at,
      title: String((r.data as Panel | null)?.name ?? r.id), detail: r.category,
    })),
    ...(tasks.data ?? []).map((r) => ({ kind: 'task' as const, id: r.id, title: r.name, detail: r.owner, deleted_at: r.deleted_at })),
    ...(events.data ?? []).map((r) => ({ kind: 'event' as const, id: r.id, title: r.title, detail: r.start_date, deleted_at: r.deleted_at })),
    ...(cats.data ?? []).map((r) => ({ kind: 'category' as const, id: r.id, title: r.label, detail: '', deleted_at: r.deleted_at })),
  ];
  return items.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));
}

export async function restoreItem(kind: TrashKind, id: string): Promise<void> {
  const { error } = await supabase.from(TRASH_TABLE[kind]).update({ deleted_at: null }).eq('id', id);
  if (error) throw error;
}
