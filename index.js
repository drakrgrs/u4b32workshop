const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_flavors"
);
const app = express();
app.use(express.json());

//GET
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /*SQL*/ `SELECT * from flavors ORDER BY created_at DESC`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//GET by ID
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
        SELECT * from flavors
        WHERE id = $1
      `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//POST
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /*SQL*/ `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
      `;
    const response = await client.query(SQL, [req.body.name]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//PUT
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /*SQL */ `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at= now()
        WHERE id=$3 RETURNING *
      `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /*SQL*/ `
        DELETE from flavors
        WHERE id = $1
      `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));

  let SQL = /* SQL */ `
    DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
id SERIAL PRIMARY KEY,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
name VARCHAR(50) NOT NULL,
is_favorite BOOLEAN DEFAULT FALSE
);
    `;
  await client.query(SQL);
  console.log("tables created");
  SQL = /*SQL*/ ` 
    INSERT INTO flavors(name, is_favorite) VALUES('Lilikoi', TRUE);
INSERT INTO flavors(name) VALUES('Li Hing Mui');
INSERT INTO flavors(name) VALUES('Taro');
    `;
  await client.query(SQL);
  console.log("data seeded");
};

init();
