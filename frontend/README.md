# Frontend

## Run locally

From repo root:

```bash
cd frontend
npm install
npm run dev -- --webpack
```

Open `http://localhost:3000`.

We use `--webpack` on Windows to avoid Turbopack path-length issues in deeply nested workspace folders.

## Key pages

- `/` : mock login (choose Athlete / Coach)
- `/dashboard` : coach dashboard shell
- `/checkin` : athlete check-in page
- `/acl-analyzer` : **ACL video + text analyzer UI** (upload video, fill intake, view backend JSON)

## Backend configuration

By default the analyzer calls:
- `http://127.0.0.1:8000`

Override by setting:

```bash
set NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

Then restart `npm run dev`.
