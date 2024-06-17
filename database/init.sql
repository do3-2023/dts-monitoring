-- create a table
CREATE TABLE IF NOT EXISTS person (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  location TEXT
);

-- add test data
INSERT INTO person (last_name, phone_number, location)
  VALUES ('Potter', '0702030405', 'London'),
         ('Delacour', '0712345678', 'Paris');