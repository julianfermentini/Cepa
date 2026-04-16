-- ============================================================
-- Demo seed: bodega + viñedo + lote completo + QR
-- Credenciales: demo@cepa.wine / cepa2024
-- ============================================================

-- Bodega demo
INSERT INTO wineries (id, name, slug, email, password_hash, logo_url, primary_color, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Bodega Valle Escondido',
  'valle-escondido',
  'demo@cepa.wine',
  '$2y$10$VLg9hjRlDXB6B.xMu1OlyOSY3lpP.YCaDuBw/2NbEPF05gESNjGN2',
  NULL,
  '#8E24AC',
  NOW()
) ON CONFLICT DO NOTHING;

-- Viñedo demo
INSERT INTO vineyards (id, winery_id, name, location, altitude_m, soil_type, lat, lng, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Finca El Espino',
  'Agrelo, Luján de Cuyo, Mendoza',
  980,
  'Franco-arcilloso con piedras',
  -33.0467,
  -68.9167,
  NOW()
) ON CONFLICT DO NOTHING;

-- Lote demo — Malbec 2022
INSERT INTO lots (
  id, winery_id, vineyard_id,
  name, variety, vintage_year,
  harvest_date, harvest_kg, brix_at_harvest, ph_at_harvest,
  fermentation_days, barrel_type, barrel_months,
  winemaker_name, winemaker_note,
  bottle_count, bottled_at,
  lot_code, status, hash, created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Valle Escondido Malbec Gran Reserva 2022',
  'Malbec',
  2022,
  '2022-03-28',
  18400.00,
  25.8,
  3.42,
  21,
  'Roble francés 70% nueva, 30% segundo uso',
  14,
  'Ing. Sebastián Quiroga',
  'Este Malbec nació de una cosecha tardía que nos regaló concentración excepcional. Decidimos hacer una selección manual parcela por parcela, descartando el 30% de la uva para quedarnos con lo mejor. El resultado es un vino que habla de este suelo de altura, con toda la elegancia que nos da el roble francés sin perder la fruta intensa.',
  4200,
  '2023-05-15',
  '#VE2022-047',
  'active',
  'sha256-demo-hash-valle-escondido-malbec-2022',
  NOW()
) ON CONFLICT DO NOTHING;

-- Perfil sensorial
INSERT INTO lot_sensory_profiles (
  lot_id,
  red_fruit, spices, wood, tannins, acidity, body,
  service_temp_min, service_temp_max,
  decant_minutes, glass_type
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  82, 65, 58, 74, 48, 88,
  16, 18,
  45,
  'Borgoña grande'
) ON CONFLICT DO NOTHING;

-- QR code
INSERT INTO qr_codes (id, lot_id, short_code, target_url, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'demo2022',
  'http://localhost:3000/wine/demo2022',
  NOW()
) ON CONFLICT DO NOTHING;

-- Segundo lote: Cabernet Sauvignon
INSERT INTO lots (
  id, winery_id, vineyard_id,
  name, variety, vintage_year,
  harvest_date, harvest_kg, brix_at_harvest, ph_at_harvest,
  fermentation_days, barrel_type, barrel_months,
  winemaker_name, winemaker_note,
  bottle_count, bottled_at,
  lot_code, status, hash, created_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Valle Escondido Cabernet Sauvignon 2021',
  'Cabernet Sauvignon',
  2021,
  '2021-04-05',
  14800.00,
  26.2,
  3.55,
  28,
  'Roble americano 100% nueva',
  18,
  'Ing. Sebastián Quiroga',
  'Un Cabernet con estructura imponente, criado en roble americano nuevo por 18 meses. La vendimia 2021 fue fría y larga, lo que permitió una maduración lenta y fenólica perfecta. Notas de tabaco, cuero y fruta negra con un final eterno.',
  2800,
  '2022-11-20',
  '#VE2021-031',
  'active',
  'sha256-demo-hash-valle-escondido-cs-2021',
  NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO lot_sensory_profiles (
  lot_id,
  red_fruit, spices, wood, tannins, acidity, body,
  service_temp_min, service_temp_max,
  decant_minutes, glass_type
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  70, 78, 72, 88, 52, 92,
  17, 19,
  60,
  'Burdeos'
) ON CONFLICT DO NOTHING;

INSERT INTO qr_codes (id, lot_id, short_code, target_url, created_at)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  'cs2021',
  'http://localhost:3000/wine/cs2021',
  NOW()
) ON CONFLICT DO NOTHING;
