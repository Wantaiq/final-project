exports.up = async (sql) => {
  await sql`
    CREATE TABLE stories (
      id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      title VARCHAR(50),
      story VARCHAR,
			user_id integer REFERENCES users (id) ON DELETE CASCADE
    )
  `;
};

exports.down = async (sql) => {
  await sql`
    DROP TABLE stories
  `;
};