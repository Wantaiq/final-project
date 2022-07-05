exports.up = async (sql) => {
  await sql`CREATE TABLE favorites (
   id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
   user_id integer REFERENCES users(id),
   story_id integer REFERENCES stories(id)
 )`;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE favorites
  `;
};
