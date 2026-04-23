# EcoMatch India

A B2B waste-to-resource marketplace using AI and blockchain validation, designed to solve industrial waste offloading and align with circular economy standards.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, multer
- **AI Integration**: Google Gemini API via `@google/genai`
- **Security/Hashing**: Crypto-js

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your variables.
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=3000
MONGODB_URI="your_railway_mongodb_connection_string"
JWT_SECRET="your_custom_jwt_secret"
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 3. Start the Application
Since we are using Express with Vite integrated as middleware, you can run both backend and frontend concurrently with one command:

```bash
# Starts Express server on PORT 3000 which also serves the Vite React app
npm run dev
```

Navigate to `http://localhost:3000` to view the app!

---

## 🗄️ Connecting to Railway MongoDB

This project uses Mongoose to connect directly to an external MongoDB database. Since you're hosting the DB on [Railway](https://railway.app/):

1. **Deploy MongoDB on Railway**:
   - Create a new project in Railway.
   - Choose **Provision PostreSQL / MySQL / MongoDB / Redis** and select **MongoDB**.
2. **Get the Connection URI**:
   - Click on your new MongoDB service card in your Railway project.
   - Go to the **Variables** tab (or **Connect** tab).
   - Find your `MONGO_URL` or `MONGO_PUBLIC_URL` (usually looks like `mongodb://mongo:YOUR_PASSWORD@containers-us-west...railway.app:PORT`).
3. **Add URI to your App**:
   - Paste that exact connection string into your `.env` file as `MONGODB_URI`.
   - The code in `server.ts` will pick it up automatically via `process.env.MONGODB_URI`.

> **Note:** If you are running your Node.js app inside Railway as well, Railway automatically injects the `MONGO_URL` variable. You can change `process.env.MONGODB_URI` to `process.env.MONGO_URL || process.env.MONGODB_URI` in `server.ts` for zero-config Railway deployments!
