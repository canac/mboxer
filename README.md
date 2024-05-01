# mboxer

MBOX file server

## Database

To setup the postgres database, execute the following SQL:

```sql
CREATE TABLE message (
  id UUID PRIMARY KEY NOT NULL,
  sender VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  date TIMESTAMP NOT NULL,
  content VARCHAR NOT NULL
);

CREATE TABLE attachment (
  id UUID PRIMARY KEY NOT NULL,
  message_id UUID REFERENCES message(id),
  filename VARCHAR,
  mime_type VARCHAR,
  contents BYTEA NOT NULL
);
```
