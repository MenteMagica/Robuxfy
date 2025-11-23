# Robuxfy Database Scripts

This folder now contains a single authoritative set of SQL scripts under `DB/sql`.
Each file is intended to be run in order against the `db_robuxfy` schema:

1. `01_tables.sql` – creates base tables and entity structures.
2. `02_relations_1n.sql` – adds one-to-many relationships and foreign keys.
3. `03_relations_nn.sql` – builds many-to-many bridge tables.
4. `indexes.sql` – applies search and helper indexes.
5. `procedures.sql` – installs stored procedures used by the Node.js helpers.

The scripts assume the `db_robuxfy` database exists (they create it if needed) and
use consistent column names (for example `users.profile_picture` and
`podcasts.cover_image`) that match the API helpers in `src/data`.
