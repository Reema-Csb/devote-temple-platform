'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS main.temple_images (

      id SERIAL PRIMARY KEY,

      temple_id uuid NOT NULL
        REFERENCES main.temples(id)
        ON DELETE CASCADE,

      image_url text NOT NULL,

      created_on timestamptz DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS main.temple_images;
  `);
};

exports._meta = {
  version: 1
};