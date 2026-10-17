# Auth

Email and password sign in / sign up on two standalone pages, plus route protection for `/library` and `/playlist/*` when Supabase is configured.

## Sub-features
- `auth-login` — `/login` form: email, password, submit, inline error.
- `auth-signup` — `/signup` form, cross-linked with `/login`.
- `auth-protected` — `src/proxy.ts` redirects unauthenticated visits to `/library` and `/playlist/*` to `/login` (only when Supabase is configured).
- `auth-callback` — `/auth/callback` exchanges a confirmation code for a session.

## How to get to it (user POV)
- Signed-out visitors reach `/login` and `/signup` from the sidebar `Sign in` link.

## Driving it with Playwright
Preconditions
- Dev server healthy. Real credentials are NOT available in the default run (no Supabase env vars).

- **Login page.** `page.goto("/login")`; the `Sign in` heading, an `Email` and a `Password` placeholder input, and the `Sign in` submit button are visible.
- **Signup page.** Click the `Sign up` link; the URL becomes `/signup`, the `Sign up` heading is visible, and the `Sign in` link is visible to go back.
- **Backend-less gating.** `page.goto("/library")` stays on `/library` and the `Your Library` heading renders; the sidebar still shows the `Sign in` link. There is no redirect because the proxy short-circuits without env vars.
- **Backend-less submit.** On `/login`, fill both fields and click `Sign in`; the URL stays `/login` and an error paragraph renders.
- **Proof.** Screenshots to `artifacts/verify-auth/`: login card, signup card, `/library` while signed out.

## Verified-unreachable
- `auth-callback` and any real session flow need a live Supabase project with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set (plus a confirmed account). With a configured backend, the additions are: signing in navigates to `/` and the sidebar `Sign in` link disappears; signing up routes to `/`; and an unauthenticated visit to `/library` or `/playlist/*` redirects to `/login`.

## Gotchas
- The inputs have placeholders but no labels or `aria-label`; address them by placeholder.
- Without Supabase env vars the proxy is bypassed entirely, so `/library` and `/playlist/*` are publicly reachable — do not assert a redirect in that mode.
