create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  desc        text not null default '',
  price       text not null default 'Sur devis',
  unit        text not null default '',
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

-- RLS
alter table services enable row level security;
create policy "public read" on services for select using (true);
create policy "admin write" on services for all using (auth.role() = 'authenticated');

-- Données initiales
insert into services (name, "desc", price, unit, sort_order) values
  ('Retwist',               'Le soin régulier pour garder tes locks propres, bien définies et en bonne santé. On retravaille chaque section avec soin.',                       '50€',       '/ session', 0),
  ('Départ de locks',       'Le début de quelque chose. On pose les bases de ton flow avec les bonnes techniques pour que tes locks partent sur une bonne trajectoire.',        'Sur devis', '',          1),
  ('Entretien & détartrage','Nettoyage en profondeur pour des locks saines. On élimine les résidus et on redonne de la légèreté à l''ensemble.',                               'Sur devis', '',          2),
  ('Réparation',            'Une lock abîmée, ça se répare. On diagnostique, on traite, et on remet ton flow dans le bon état.',                                               'Sur devis', '',          3);
