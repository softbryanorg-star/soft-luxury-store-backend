# Luxury Store Backend (minimal scaffold)

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install deps:

```bash
cd backend
npm install
```

3. Start dev server:

```bash
npm run dev
```

## What is included
- Express server (`server.js`)
- MongoDB (Mongoose) connection
- Auth routes: register/login with JWT
- Product endpoints (list/get)
- Order creation endpoint (creates order in DB)
- Paystack webhook endpoint (verifies signature)

## Paystack setup (dashboard & webhook)

1. In your Paystack dashboard, copy the **Secret Key** and add it to your `.env` as `PAYSTACK_SECRET_KEY`.
2. Set your `FRONTEND_ORIGIN` in `.env` (e.g. `http://localhost:5173`) so callbacks can use the correct URL.
3. Configure the webhook URL in the Paystack dashboard to point to your backend webhook endpoint:

   - Webhook URL: `https://<YOUR_DOMAIN>/api/payments/webhook/paystack`

   Use your deployed domain in production. For local testing you can use an HTTP tunneling tool (eg. `ngrok`) and set the webhook to the tunnel URL.

4. In the dashboard webhook settings enable events for `charge.success` (and any others you need).

5. The server verifies the webhook by validating the `x-paystack-signature` header using your `PAYSTACK_SECRET_KEY` — do not disable this verification.

## Next steps
- Add request validation, tests, and stronger role-based protections.
- Optionally configure persistent sessions or refresh tokens for improved security.

## Refresh token & cookie notes

- This scaffold implements a secure refresh-token flow: the server issues a short-lived JWT access token and a long-lived refresh token stored in a server-side DB table and sent to the browser as an `httpOnly` cookie.
- The cookie is set for the site root (`/`) so `/api/auth/refresh` and `/api/auth/logout` receive it. The frontend uses `axios` with `withCredentials: true` and a response interceptor that calls `POST /api/auth/refresh` when it receives a 401.
- Endpoints added:
   - `POST /api/auth/login` — returns `{ token, user }` and sets `refreshToken` cookie.
   - `POST /api/auth/register` — same as login.
   - `POST /api/auth/refresh` — reads httpOnly cookie, returns new access token.
   - `POST /api/auth/logout` — removes refresh token server-side and clears cookie.

Make sure your frontend runs with `axios` configured to send credentials and the backend `FRONTEND_ORIGIN` environment variable matches your frontend origin. For local development `ngrok` can expose a public URL used in the Paystack dashboard and to test cookie flows across domains.
