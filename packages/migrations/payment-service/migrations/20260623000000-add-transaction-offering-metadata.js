"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(
    require("fs").readFileSync(
      __dirname +
        "/sqls/20260623000000-add-transaction-offering-metadata-up.sql",
      "utf8",
    ),
  );
};

exports.down = function (db) {
  return db.runSql(
    require("fs").readFileSync(
      __dirname +
        "/sqls/20260623000000-add-transaction-offering-metadata-down.sql",
      "utf8",
    ),
  );
};

exports._meta = {
  version: 1,
};
