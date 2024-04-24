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
```
