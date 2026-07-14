# 🌙 Luna Top-Up (VTU API Server)

A robust, high-performance Virtual Top-Up (VTU) API backend engine built with **Node.js**, **Express**, **TypeScript**, and **Prisma (PostgreSQL)**. Luna Top-Up supports secure user authentication, double-entry ledger wallet systems, Flutterwave payment gateway integration, API rate limiting, and background message queues via Redis and BullMQ.

---

## 🚀 Key Features

*   **Double-Entry Bookkeeping**: Accounts use a double-entry ledger structure ([LedgerEntry](file:///C:/Users/HP/Documents/luna-top-up/prisma/schema.prisma#L115-L131)) to track every transaction, ensuring absolute consistency between debit and credit movements.
*   **Virtual Top-Up (VTU)**: Seamless purchases of Airtime, Data, and Bills through Flutterwave VTU integrations, complete with an **auto-refund engine** if a third-party vendor request fails.
*   **Secure Authentication & Profiles**:
    *   JWT-based session authentication with refresh/access tokens.
    *   Secure passcodes, masked sensitive data (BVN, NIN), and a mandatory transaction PIN for wallet transfers/purchases.
    *   API rate limiters ([rateLimiter.ts](file:///C:/Users/HP/Documents/luna-top-up/src/config/rateLimiter.ts)) to shield auth and general routes from brute-force attacks.
*   **Asynchronous Background Tasks**: Powered by **Redis & BullMQ** ([queues.ts](file:///C:/Users/HP/Documents/luna-top-up/src/services/shared/queues.ts) / [workers.ts](file:///C:/Users/HP/Documents/luna-top-up/src/services/shared/workers.ts)) to handle outbound transactional email operations (welcome emails, deposit alerts, purchase success updates, and refund notifications).
*   **Idempotency & Webhooks**:
    *   Secure Flutterwave webhook integration with signature validation.
    *   Idempotency verification to prevent duplicate payments.
*   **Interactive Documentation**: Interactive REST API documentation powered by Swagger UI.

---

## 🛠️ Technology Stack

*   **Runtime Environment**: Node.js (v18+)
*   **Programming Language**: TypeScript
*   **Web Framework**: Express.js (v5)
*   **Database (ORM)**: PostgreSQL (via Prisma ORM)
*   **Background Jobs**: BullMQ (with ioredis)
*   **Email Deliverability**: Brevo (formerly Sendinblue)
*   **Payment Gateway**: Flutterwave API
*   **Validation & Security**: Zod, BCrypt, Helmet, CORS, Express Rate Limit
*   **API Docs**: Swagger UI Express & Swagger-JSDoc

---

## 📁 Project Architecture & Tour

Below is an overview of the directory structure:

```bash
luna-top-up/
├── prisma/
│   ├── migrations/          # SQL migration files
│   ├── schema.prisma        # Database schema definitions
│   └── seed.ts              # Database seed script for VTU products/categories
├── src/
│   ├── app.ts               # Main Express application configuration & routing middleware
│   ├── server.ts            # Entrypoint file to launch the HTTP Server and start workers
│   ├── config/              # Application environment & services configuration
│   │   ├── db.ts            # Prisma client instance initialization
│   │   ├── env.ts           # Strictly validated environment variables configuration
│   │   ├── flutterwave.ts   # Flutterwave client initialization
│   │   ├── rateLimiter.ts   # Rate limit rules for application routes
│   │   ├── redis.ts         # Redis database connection pool configuration
│   │   └── swagger.ts       # Swagger configuration object
│   ├── services/            # Infrastructure-level services (shared utils, workers)
│   │   ├── middleware/      # Authentication & error-handling middleware
│   │   └── shared/          # Mailers, HTTP wrappers, queue definitions, and workers
│   └── modules/             # Feature-based folders containing routes, controllers, and services
│       ├── auth/            # Sign up, Sign in, OTPs, Reset passwords
│       ├── payments/        # Wallet funding, Flutterwave webhooks & payment history
│       ├── transaction/     # User audit trails, transaction records
│       ├── userProfile/     # User details & PIN setup
│       ├── vtu/             # Topup options (Airtime, Data, Bills) & purchase controllers
│       └── wallet/          # Wallet balances & peer-to-peer transfers
```

### Key Source Files:
- Database Schema: [`prisma/schema.prisma`](file:///C:/Users/HP/Documents/luna-top-up/prisma/schema.prisma)
- Server Entrypoint: [`src/server.ts`](file:///C:/Users/HP/Documents/luna-top-up/src/server.ts)
- Main Express App: [`src/app.ts`](file:///C:/Users/HP/Documents/luna-top-up/src/app.ts)
- Background Queues: [`src/services/shared/queues.ts`](file:///C:/Users/HP/Documents/luna-top-up/src/services/shared/queues.ts)
- Queue Workers: [`src/services/shared/workers.ts`](file:///C:/Users/HP/Documents/luna-top-up/src/services/shared/workers.ts)
- Configured Env: [`src/config/env.ts`](file:///C:/Users/HP/Documents/luna-top-up/src/config/env.ts)

---

## 📊 Core Workflows

### 1. Wallet Deposit via Webhook
```mermaid
sequenceDiagram
    participant User as Client/User
    participant App as API Server
    participant DB as PostgreSQL
    participant FLW as Flutterwave
    participant Redis as Redis / Queue

    User->>App: POST /api/payment/init (amount)
    App->>FLW: Initiate Payment (charge)
    FLW-->>App: Payment details link
    App-->>User: Return reference & checkout url
    Note over User,FLW: User completes payment on Flutterwave UI
    FLW->>App: Webhook POST /api/payment/webhook (signature, payload)
    App->>App: Verify webhook signature & check idempotency
    alt Valid & Unprocessed
        App->>DB: Start transaction
        App->>DB: Credit User Wallet (Account) & Debit Escrow/System Bank
        App->>DB: Record Payment & LedgerEntry
        App->>DB: Save WebhookLog as PROCESSED
        App->>Redis: dispatchDepositEmail(job)
        App->>DB: Commit transaction
        App-->>FLW: 200 OK
        Note over Redis,App: BullMQ worker sends notification via Brevo
    else Already Processed
        App-->>FLW: 200 OK (no action)
    end
```

### 2. VTU Purchase with Auto-Refund
```mermaid
flowchart TD
    A[User requests purchase POST /api/vtu/purchase] --> B{Verify user, balance & pin}
    B -- Invalid/Insufficient --> C[Return error]
    B -- Valid --> D[Create Transaction in PENDING status]
    D --> E[Debit User Wallet Account & Credit System/Vendor Account]
    E --> F[Call Flutterwave / Vendor API to execute top-up]
    F -- API Success --> G[Update Transaction status to SUCCESS]
    G --> H[Dispatch success email]
    F -- API Failure --> I[Update Transaction status to FAILED]
    I --> J[Initiate Auto-Refund: Debit System & Credit User Account]
    J --> K[Dispatch refund/failure email]
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory and configure the variables as follows:

```env
# Database Settings
DATABASE_URL="postgresql://username:password@localhost:5432/luna_topup?schema=public"

# Server Settings
PORT=8000

# Authentication & Cryptography (JWT)
ACCESS_TOKEN_SECRET="your-super-secure-jwt-secret-key"
ACCESS_TOKEN_EXPIRE_AT="24h"

# Redis Queue Connection
REDIS_URL="redis://127.0.0.1:6379"

# Email Configuration (Brevo)
EMAIL_FROM="Luna <noreply@yourdomain.com>"
BREVO_API_KEY="xkeysib-..."

# Payment Integration (Flutterwave)
FLW_SECRET_KEY="FLWSECK_TEST-..."
FLW_WEBHOOK_SECRET="your-flutterwave-webhook-secret-hash"
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [PostgreSQL](https://www.postgresql.org/)
*   [Redis Server](https://redis.io/)

### 1. Clone the project and install dependencies
```bash
git clone <repository-url>
cd luna-top-up
npm install
```

### 2. Run Database Migrations
Generate Prisma Client models and push the database schema:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Seed Database VTU Products
Seed the initial list of billers and service categories from the configured vendor (Flutterwave):
```bash
npx ts-node prisma/seed.ts
```

### 4. Run the Application

#### Development Mode (Hot-reloading)
Runs nodemon watching TypeScript files:
```bash
npm run dev
```

#### Production Mode
Compiles TypeScript into Node.js runtime code and runs the output:
```bash
npm run build
npm start
```

---

## 🔌 API Endpoints Summary

All routes are prefixed with `/api`. Detailed endpoints are accessible via Interactive Swagger docs at `/api-docs` when the server is running.

### Authentication (`/api/auth`)
*   `POST /register` - Register a new user profile
*   `POST /login` - Sign in and retrieve an access token
*   `POST /password` - Request a password recovery OTP
*   `POST /verify` - Verify registration/recovery OTP
*   `POST /changePassword` - Set a new password (authenticated)

### User Profile (`/api/user`)
*   `GET /profile` - Retrieve current user profile
*   `POST /pin` - Create/Update wallet transaction PIN

### Wallet Operations (`/api/wallet`)
*   `GET /` - Retrieve the user's primary wallet account balance
*   `POST /transfer` - Secure peer-to-peer wallet transfer to another user

### Payments & Funding (`/api/payment`)
*   `POST /init` - Initialize a Flutterwave checkout payment link to fund the wallet
*   `POST /webhook` - Receives deposit success callback from Flutterwave (Public)

### VTU & Services (`/api/vtu`)
*   `GET /` - List all active VTU product categories
*   `GET /:categoryCode` - Get biller products under a category (e.g., `AIRTIME`, `DATA`)
*   `GET /bill/:flwId` - Retrieve details of a specific bill
*   `POST /purchase` - Initiate an Airtime or Data VTU purchase

---

## 🛡️ Double-Entry Ledger Bookkeeping Design

Unlike traditional balance columns updated in-place (which are prone to race conditions), Luna Top-Up implements a transactional double-entry system.

When a payment succeeds, or a VTU purchase completes, balance movement is recorded in a transaction context:
*   Every balance adjustment generates a [`LedgerEntry`](file:///C:/Users/HP/Documents/luna-top-up/prisma/schema.prisma#L115).
*   A ledger contains a `sourceAccountId` (where the money is leaving) and a `destAccountId` (where the money is going).
*   System funds originate or terminate in a designated `SYSTEM_BANK` account, while user funds utilize specific `USER` accounts.
*   The system verifies the ledger entries balance to zero ($\sum \text{Credits} - \sum \text{Debits} = 0$) for total transaction auditability.

---

## 📝 License

This project is licensed under the ISC License. See [package.json](file:///C:/Users/HP/Documents/luna-top-up/package.json) for details.
