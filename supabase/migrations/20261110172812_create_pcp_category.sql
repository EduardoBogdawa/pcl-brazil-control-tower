/*
# PCP category with starter panels

1. New Data
- Category `PCP` (Planejamento e Controle da Produção), shown on the overview, placed right after Comex.
- Four starter panels in PCP, one per planning stage, waiting for the team to add their links:
  - `pcp-edi` EDI (customer schedules received electronically)
  - `pcp-po-clientes` PO Clientes (firm customer purchase orders)
  - `pcp-mps` MPS (master production schedule)
  - `pcp-sop` S&OP (monthly sales & operations planning)
  Each panel stores its stage in `data.pcpGroup` so the PCP page can split cards into sections.

2. Security
- No changes. Existing RLS policies on ct_categories and ct_panels apply.

3. Notes
1. Idempotent: the category is only inserted if no active category named PCP exists,
   and panels use fixed ids with ON CONFLICT DO NOTHING.
2. No existing data is changed or removed.
*/

INSERT INTO ct_categories (name, label, section, description, color, position, show_on_overview)
SELECT 'PCP', 'PCP', '', 'Planejamento e controle da produção: EDI, pedidos, MPS e S&OP', '#2563EB', 116, true
WHERE NOT EXISTS (SELECT 1 FROM ct_categories WHERE name = 'PCP' AND deleted_at IS NULL);

INSERT INTO ct_panels (id, category, data) VALUES
('pcp-edi', 'PCP', jsonb_build_object('id','pcp-edi','name','EDI','category','PCP','pcpGroup','edi','status','Em construção','url','',
  'desc','Programações recebidas dos clientes via EDI (DELFOR/DELJIT): firmes, previsões e divergências.',
  'descEn','Customer schedules received via EDI (DELFOR/DELJIT): firm demand, forecasts and mismatches.','instruction','','workshopDate','')),
('pcp-po-clientes', 'PCP', jsonb_build_object('id','pcp-po-clientes','name','PO Clientes','category','PCP','pcpGroup','po','status','Em construção','url','',
  'desc','Pedidos de compra dos clientes: carteira, confirmações, alterações e atendimento.',
  'descEn','Customer purchase orders: backlog, confirmations, changes and fulfilment.','instruction','','workshopDate','')),
('pcp-mps', 'PCP', jsonb_build_object('id','pcp-mps','name','MPS','category','PCP','pcpGroup','mps','status','Em construção','url','',
  'desc','Plano mestre de produção: volumes semanais por item, capacidade e cobertura.',
  'descEn','Master production schedule: weekly volumes per item, capacity and coverage.','instruction','','workshopDate','')),
('pcp-sop', 'PCP', jsonb_build_object('id','pcp-sop','name','S&OP','category','PCP','pcpGroup','sop','status','Em construção','url','',
  'desc','Planejamento de vendas e operações: demanda x capacidade no médio prazo e decisões do ciclo mensal.',
  'descEn','Sales & operations planning: mid-term demand vs capacity and monthly cycle decisions.','instruction','','workshopDate',''))
ON CONFLICT (id) DO NOTHING;