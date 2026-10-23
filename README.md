# koh! Enterprise REST API Server

Node.js, Express, and MongoDB/TypeScript REST API backend powering the **koh! Command Center** and **Factory Floor Batch Processing Suite**.

## 🚀 Features
- **MongoDB / Mongoose & Local Fallback Store**: High-reliability data persistence with in-memory fallback and JSON store.
- **Factory Floor Batch Engines**: Landed cost, dehydration yield %, pulverizing mesh sieves, packaging counts, and dispatch quality signoffs.
- **Enterprise Operations API**: RESTful endpoints for Procurement, Production, Catalog & COGS, Marketing ROAS, NPD Innovation, Cultivation Planning, Automated P&L Statements, and RBAC Audit Logs.

## 🛠️ Tech Stack
- **Runtime**: Node.js & TypeScript (`tsx`)
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose (with automated fallback store)
- **Environment**: Dotenv, CORS

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Running Locally
```bash
# Development mode with hot-reloading
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server runs on `http://localhost:5000`.

- **API Base**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`
