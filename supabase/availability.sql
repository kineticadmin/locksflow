-- ============================================================
-- Locks Flow — Tables disponibilités
-- À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Disponibilité par jour de la semaine (0=dim, 1=lun ... 6=sam)
CREATE TABLE IF NOT EXISTS availability (
  day_of_week smallint PRIMARY KEY CHECK (day_of_week >= 0 AND day_of_week <= 6),
  active      boolean NOT NULL DEFAULT true,
  slots       text[]  NOT NULL DEFAULT '{}'
);

INSERT INTO availability (day_of_week, active, slots) VALUES
  (0, false, '{}'),
  (1, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}'),
  (2, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}'),
  (3, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}'),
  (4, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}'),
  (5, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}'),
  (6, true, '{"09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"}')
ON CONFLICT (day_of_week) DO NOTHING;

-- Créneaux bloqués (slot = NULL → journée entière bloquée)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date       date NOT NULL,
  slot       text,
  reason     text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(date);

-- RLS : lecture publique, écriture admin uniquement
ALTER TABLE availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read availability"  ON availability   FOR SELECT USING (true);
CREATE POLICY "public read blocked_slots" ON blocked_slots  FOR SELECT USING (true);
CREATE POLICY "admin write availability"  ON availability   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin write blocked_slots" ON blocked_slots  FOR ALL USING (auth.role() = 'authenticated');
