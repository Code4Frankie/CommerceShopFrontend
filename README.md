# ShopCore Web

React + Vite storefront for the ShopCore API.

## Run locally

```bash
npm install
cp .env.example .env   # then set VITE_API_URL
npm run dev
```

## API endpoints this app expects

| Action | Request |
| --- | --- |
| List products | `GET /products` |
| Product detail | `GET /products/:id` |
| Register | `POST /auth/register` `{ name, email, password }` |
| Login | `POST /auth/login` `{ email, password }` -> `{ token, user }` |
| Place order | `POST /orders` `{ items: [{ product, quantity }] }` (Bearer token) |
| My orders | `GET /orders/my` (Bearer token) |

If your routes differ, change them in one place: `src/api.js`.

## Backend CORS

The API must allow the front-end origin. In the backend `.env` on Render, allow your Vercel URL
(for example `https://shopcore-web.vercel.app`) in the CORS configuration.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New -> Project**, import the repo. Framework preset: **Vite** (auto-detected).
3. Add environment variable `VITE_API_URL` = your Render API URL ending in `/api`.
4. Deploy. `vercel.json` already handles page refreshes on routes like `/cart`.
5. Add the Vercel URL to the API's allowed CORS origins, then redeploy the API.
# CommerceShopFrontend
