# Blog Frontend (React + Vite)

## Setup
1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (optional) to override API URL

```bash
VITE_API_URL=http://localhost:4000/api
```

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173

## Notes
- Auth token is stored in localStorage and attached as `Authorization: Bearer <token>`.
- Update `VITE_API_URL` if your backend runs on a different port.
