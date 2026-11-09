CREATE TABLE IF NOT EXISTS moments (
  id uuid PRIMARY KEY,
  happened_on date NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  photo bytea,
  photo_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
