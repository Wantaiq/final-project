module.exports = function setPostgresDefaultsOnHeroku() {
  if (process.env.DATABASE_URL) {
    const { parse } = require('pg-connection-string');

    const { host, database, user, password } = parse(process.env.DATABASE_URL);

    process.env.PGHOST = host;
    process.env.PGDATABASE = database;
    process.env.PGUSERNAME = user;
    process.env.PGPASSWORD = password;
  }
};
