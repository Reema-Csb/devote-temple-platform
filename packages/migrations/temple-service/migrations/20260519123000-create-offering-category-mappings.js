'use strict';

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {

  await db.runSql(`
    CREATE TABLE IF NOT EXISTS main.offering_category_mappings (

      id SERIAL PRIMARY KEY,

      offering_id uuid NOT NULL
        REFERENCES main.temple_offerings(id)
        ON DELETE CASCADE,

      category_name text NOT NULL
    );
  `);
};

exports.down = async function (db) {

  await db.runSql(`
    DROP TABLE IF EXISTS main.offering_category_mappings;
  `);
};

exports._meta = {
  version: 1,
};