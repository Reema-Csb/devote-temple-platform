SET search_path TO main,public;

ALTER TABLE main.temple_locations
  ADD COLUMN IF NOT EXISTS deleted bool DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_on timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS modified_by uuid;

ALTER TABLE main.temple_offerings
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS modified_by uuid;

INSERT INTO main.temples (id, name, description, deity, is_active)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Sree Padmanabhaswamy Temple', 'Dedicated to Lord Vishnu, famous for its spiritual richness.', 'Vishnu', true),
  ('22222222-2222-4222-8222-222222222222', 'Tirupati Balaji Temple', 'One of the richest temples in the world.', 'Vishnu', true),
  ('33333333-3333-4333-8333-333333333333', 'Brihadisvara Temple', 'Built by the Chola dynasty.', 'Shiva', true),
  ('44444444-4444-4444-8444-444444444444', 'Kashi Vishwanath Temple', 'One of the 12 Jyotirlingas.', 'Shiva', true),
  ('55555555-5555-4555-8555-555555555555', 'Meenakshi Temple', 'Famous for its Dravidian architecture.', 'Parvati', true),
  ('66666666-6666-4666-8666-666666666666', 'Sabarimala Temple', 'Dedicated to Lord Ayyappa.', 'Ayyappa', true),
  ('77777777-7777-4777-8777-777777777777', 'Kedarnath Temple', 'Himalayan pilgrimage site.', 'Shiva', true),
  ('88888888-8888-4888-8888-888888888888', 'Konark Sun Temple', 'UNESCO World Heritage site.', 'Surya', true),
  ('99999999-9999-4999-8999-999999999999', 'Jagannath Temple', 'Famous Rath Yatra festival.', 'Vishnu', true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Shri Murudeshwara Shiva Temple', 'Ornate Hindu temple with a giant statue of Shiva perched dramatically on a peninsula.', 'Shiva', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Shree Somnath Temple', 'The temple is famous for its history of being rebuilt multiple times.', 'Shiva', true),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ram Mandir', 'The newly constructed grand Ram Temple in Ayodhya.', 'Rama', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deity = EXCLUDED.deity,
  is_active = EXCLUDED.is_active,
  modified_on = CURRENT_TIMESTAMP;

INSERT INTO main.temple_locations (
  id, temple_id, address_line1, city, state, country, postal_code, latitude, longitude
)
VALUES
  ('11111111-aaaa-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'West Nada', 'Thiruvananthapuram', 'Kerala', 'India', '695023', 8.4827819, 76.9436835),
  ('22222222-aaaa-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Tirumala', 'Tirupati', 'Andhra Pradesh', 'India', '517504', 13.6833000, 79.3470000),
  ('33333333-aaaa-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Membalam Road', 'Thanjavur', 'Tamil Nadu', 'India', '613007', 10.7828000, 79.1318000),
  ('44444444-aaaa-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Lahori Tola', 'Varanasi', 'Uttar Pradesh', 'India', '221001', 25.3109000, 83.0100000),
  ('55555555-aaaa-4555-8555-555555555555', '55555555-5555-4555-8555-555555555555', 'Madurai Main', 'Madurai', 'Tamil Nadu', 'India', '625001', 9.9194997, 78.1092718),
  ('66666666-aaaa-4666-8666-666666666666', '66666666-6666-4666-8666-666666666666', 'Sannidhanam', 'Pathanamthitta', 'Kerala', 'India', '689713', 9.4326000, 77.0942000),
  ('77777777-aaaa-4777-8777-777777777777', '77777777-7777-4777-8777-777777777777', 'Kedarnath', 'Rudraprayag', 'Uttarakhand', 'India', '246445', 30.7352000, 79.0669000),
  ('88888888-aaaa-4888-8888-888888888888', '88888888-8888-4888-8888-888888888888', 'Konark', 'Konark', 'Odisha', 'India', '752111', 19.8876000, 86.0945000),
  ('99999999-aaaa-4999-8999-999999999999', '99999999-9999-4999-8999-999999999999', 'Grand Road', 'Puri', 'Odisha', 'India', '752001', 19.8049000, 85.8189000),
  ('aaaaaaaa-bbbb-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Murudeshwar', 'Murudeshwar', 'Karnataka', 'India', '581350', 14.0948000, 74.4845000),
  ('bbbbbbbb-aaaa-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Prabhas Patan', 'Prabhas Patan', 'Gujarat', 'India', '362268', 20.8880000, 70.4012000),
  ('cccccccc-aaaa-4ccc-8ccc-cccccccccccc', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ram Janmabhoomi', 'Ayodhya', 'Uttar Pradesh', 'India', '224123', 26.7996000, 82.2042000)
ON CONFLICT (id) DO UPDATE SET
  address_line1 = EXCLUDED.address_line1,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  postal_code = EXCLUDED.postal_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  modified_on = CURRENT_TIMESTAMP;

INSERT INTO main.temple_offerings (id, temple_id, name, description, price, currency, is_active)
VALUES
  ('10111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Archana', 'Offering of names to Lord Vishnu.', 101.00, 'INR', true),
  ('10222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Deepa Seva', 'Lighting lamps for blessings.', 151.00, 'INR', true),
  ('20222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Suprabhata Seva', 'Morning seva offering.', 301.00, 'INR', true),
  ('20333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'Annadanam', 'Food offering to devotees.', 501.00, 'INR', true),
  ('30333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Abhishekam', 'Sacred abhishekam offering.', 251.00, 'INR', true),
  ('40444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'Rudrabhishekam', 'Offering for Lord Shiva.', 351.00, 'INR', true),
  ('50555555-5555-4555-8555-555555555555', '55555555-5555-4555-8555-555555555555', 'Kumkum Archana', 'Special archana for the goddess.', 151.00, 'INR', true),
  ('60666666-6666-4666-8666-666666666666', '66666666-6666-4666-8666-666666666666', 'Neyyabhishekam', 'Traditional ghee offering.', 201.00, 'INR', true),
  ('70777777-7777-4777-8777-777777777777', '77777777-7777-4777-8777-777777777777', 'Bilva Archana', 'Bilva leaf offering to Lord Shiva.', 151.00, 'INR', true),
  ('80888888-8888-4888-8888-888888888888', '88888888-8888-4888-8888-888888888888', 'Surya Namaskar Offering', 'Offering to the Sun deity.', 201.00, 'INR', true),
  ('90999999-9999-4999-8999-999999999999', '99999999-9999-4999-8999-999999999999', 'Mahaprasad Seva', 'Prasadam offering for devotees.', 251.00, 'INR', true),
  ('a0aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Deepotsava Seva', 'Lamp offering for Lord Shiva.', 201.00, 'INR', true),
  ('b0bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Somnath Archana', 'Archana offering to Lord Shiva.', 201.00, 'INR', true),
  ('c0cccccc-cccc-4ccc-8ccc-cccccccccccc', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ram Darbar Seva', 'Offering for Sri Rama blessings.', 301.00, 'INR', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active,
  modified_on = CURRENT_TIMESTAMP;
