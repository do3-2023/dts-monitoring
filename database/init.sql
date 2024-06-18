-- create a table
CREATE TABLE IF NOT EXISTS person (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  location TEXT
);