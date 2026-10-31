CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id text NOT NULL,
  category text NOT NULL CHECK (category IN ('drainage','sewage_overflow','water_stagnation','garbage','water_supply')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 5 AND 800),
  locality text NOT NULL CHECK (char_length(locality) BETWEEN 2 AND 120),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  source text NOT NULL DEFAULT 'citizen_app' CHECK (source IN ('pmc_open_data','citizen_app','field_survey')),
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.complaints TO anon, authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Complaints are public" ON public.complaints FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can file a complaint" ON public.complaints FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX complaints_ward_idx ON public.complaints (ward_id, status);

CREATE TABLE public.officer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id text NOT NULL,
  officer_name text NOT NULL CHECK (char_length(officer_name) BETWEEN 2 AND 120),
  designation text NOT NULL DEFAULT 'Sanitary Inspector' CHECK (char_length(designation) BETWEEN 2 AND 120),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 1000),
  risk_verified boolean NOT NULL DEFAULT true,
  observed_cases integer NOT NULL DEFAULT 0 CHECK (observed_cases BETWEEN 0 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.officer_feedback TO anon, authenticated;
GRANT ALL ON public.officer_feedback TO service_role;
ALTER TABLE public.officer_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feedback is public" ON public.officer_feedback FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit feedback" ON public.officer_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX officer_feedback_ward_idx ON public.officer_feedback (ward_id, created_at DESC);

INSERT INTO public.complaints (ward_id, category, description, locality, severity, status, source, reported_at, resolved_at) VALUES
('hadapsar','water_stagnation','Stagnant rainwater collected in open plot behind society for over a week','Magarpatta Road','high','open','pmc_open_data', now() - interval '4 days', NULL),
('hadapsar','sewage_overflow','Manhole overflowing onto service road after heavy rain','Sasane Nagar','high','in_progress','pmc_open_data', now() - interval '9 days', NULL),
('hadapsar','drainage','Storm water drain choked with silt and plastic','Handewadi','medium','open','citizen_app', now() - interval '2 days', NULL),
('kondhwa','water_stagnation','Water logging near construction site, mosquito breeding reported','NIBM Road','high','open','field_survey', now() - interval '3 days', NULL),
('kondhwa','garbage','Uncollected wet waste beside nallah','Kausar Baug','medium','open','citizen_app', now() - interval '6 days', NULL),
('bhavani-peth','sewage_overflow','Sewage backflow in lane, residents reporting fever cases','Nana Peth','high','open','pmc_open_data', now() - interval '5 days', NULL),
('bhavani-peth','drainage','Drain cover broken, sewage mixing with rainwater','Bhavani Peth','high','in_progress','pmc_open_data', now() - interval '11 days', NULL),
('yerawada','water_stagnation','Pothole pools along riverside road','Yerawada','medium','open','citizen_app', now() - interval '1 day', NULL),
('yerawada','water_supply','Contaminated tap water complaint from 3 buildings','Kalas','high','in_progress','pmc_open_data', now() - interval '7 days', NULL),
('kothrud','drainage','Blocked side drain causing overflow on footpath','Karve Road','medium','resolved','pmc_open_data', now() - interval '14 days', now() - interval '3 days'),
('kothrud','garbage','Debris dumping blocking drain inlet','Bhusari Colony','low','open','citizen_app', now() - interval '2 days', NULL),
('aundh-baner','water_stagnation','Rainwater trapped in unused excavation pit','Balewadi','medium','open','field_survey', now() - interval '3 days', NULL),
('aundh-baner','drainage','Drain overflow near school gate','Baner Road','medium','in_progress','pmc_open_data', now() - interval '8 days', NULL),
('shivajinagar','sewage_overflow','Chamber overflow near market area','Shivajinagar','high','open','pmc_open_data', now() - interval '4 days', NULL),
('sinhgad-road','water_stagnation','Low lying area flooded after 3 days of rain','Vadgaon Budruk','high','open','citizen_app', now() - interval '2 days', NULL),
('dhankawadi','drainage','Nallah silting reported by residents','Katraj','medium','open','pmc_open_data', now() - interval '10 days', NULL),
('wanawadi','garbage','Garbage heap adjacent to stagnant pool','Wanawadi','medium','open','citizen_app', now() - interval '5 days', NULL),
('bibwewadi','water_supply','Muddy water supply after pipeline repair','Bibwewadi','medium','resolved','pmc_open_data', now() - interval '13 days', now() - interval '6 days'),
('nagar-road','water_stagnation','Water accumulation at metro construction site','Viman Nagar','high','open','field_survey', now() - interval '1 day', NULL),
('warje','drainage','Drain overflowing into residential lane','Warje Malwadi','medium','open','citizen_app', now() - interval '6 days', NULL),
('dhole-patil','sewage_overflow','Sewage leak near hotel line','Koregaon Park','high','in_progress','pmc_open_data', now() - interval '9 days', NULL),
('kasba','drainage','Old peth drainage line choked','Kasba Peth','high','open','pmc_open_data', now() - interval '3 days', NULL);

INSERT INTO public.officer_feedback (ward_id, officer_name, designation, message, risk_verified, observed_cases) VALUES
('hadapsar','S. Kulkarni','Sanitary Inspector','Field visit confirms breeding spots near Magarpatta. Fogging done, larvicide pending.', true, 6),
('bhavani-peth','A. Shaikh','Medical Officer','Fever cluster in Nana Peth matches the leptospirosis warning. Chlorination started.', true, 11),
('kothrud','P. Deshmukh','Junior Engineer','Risk level looks overstated here, drains cleared last week and no stagnation observed.', false, 1),
('yerawada','R. Jadhav','Sanitary Inspector','Water sample sent for testing from Kalas. Two typhoid cases reported at ward clinic.', true, 2);