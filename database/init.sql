-- create a table
CREATE TABLE hello (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  message TEXT NOT NULL
);

-- add test data
INSERT INTO hello (message)
  VALUES ('Hello World from db!');