# eCRIS — El Salvador City Local Civil Registry Office

Civil Registration Information System for birth registration (Municipal Form No. 102), admin review and the Register of Live Birth.

## Development

```sh
npm i
npm run dev
```

Create a `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and (server only) `SUPABASE_SERVICE_ROLE_KEY`. Apply the SQL in `drizzle/migrations/` in order.
