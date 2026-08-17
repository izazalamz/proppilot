<div align="center">

# 🏢 PropPilot
### Next-Generation Multi-Tenant Property & Asset Management SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<p align="center">
  <b>Streamline operations, automate financial billing, empower residents, and scale commercial & residential real estate portfolios seamlessly.</b>
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & RBAC](#-system-architecture--rbac)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Database Seeding](#3-database-seeding)
- [Test Personas & Login Credentials](#-test-personas--login-credentials)
- [API Architecture](#-api-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🌟 Overview

**PropPilot** is an enterprise-grade multi-tenant property management platform engineered for property managers, real estate investment owners, staff technicians, and residential/commercial tenants. 

By unifying portfolio analytics, space hierarchy (buildings, floors, units), automated recurring invoicing, SSLCommerz online payment gateways, real-time maintenance ticketing, and a dedicated resident portal, PropPilot delivers a complete, frictionless operational workflow.

---

## 🚀 Key Features

### 1. 🏢 Multi-Workspace & Portfolio Management
- **True Multi-Tenancy:** Manage multiple company portfolios (accounts) under a single user identity.
- **Dynamic Workspace Switcher:** Floating glass popover menu with role badges and active checkmarks.
- **Granular RBAC:** Strict permission boundaries separating executive owners, property managers, maintenance staff, and residential tenants.

### 2. 🔍 Properties & Unit 360° Command Center
- **Interactive Space Hierarchy:** Multi-tier visualization (Property $\rightarrow$ Unit Group / Floor $\rightarrow$ Individual Unit).
- **Unit 360° Drawer:** Deep-dive inspector showing unit specifications, active lease metadata, financial status, maintenance history, and linked documents.
- **Deep-Linking:** Jump effortlessly between lease agreements, tenant profiles, and physical units with one click.

### 3. 🏡 Dedicated Resident Tenant Portal (`/portal`)
- **Multi-Lease Switcher:** Renters with multiple leased apartments can switch active rentals with instantaneous data hydration.
- **Self-Service Financials:** View itemized rent breakdowns, payment histories, and download invoices.
- **Online Checkout:** Integrated SSLCommerz sandbox simulation for card, mobile banking (bKash/Nagad), and internet banking payments.
- **Maintenance Requests:** Submit repair tickets with priority levels and track progress in real-time.
- **Notices & Vault:** View building announcements and access digital lease agreements.

### 4. 💳 Finance, Invoicing & Billing Engine
- **Automated Billing Catalog:** Define customizable charge types (Base Rent, Security Deposits, Utility Surcharges, Parking, Sky Concierge).
- **Invoice Lifecycle:** Full support for `DRAFT`, `UNPAID`, `PARTIALLY_PAID`, `PAID`, and `OVERDUE` states.
- **Payment Verification:** Real-time ledger updates upon payment reconciliation.

### 5. 🛠️ Maintenance & Work Order Management
- **Status Lifecycle Tracking:** `REQUESTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CANCELLED`.
- **Assignment & Priorities:** Route emergency, high, medium, and low-priority tickets directly to maintenance staff.

### 6. 📂 Document Vault & Building Notices
- **Secure File Storage:** Centralized document repository categorized by leases, tenants, properties, and maintenance tickets.
- **Notice Board:** Broadcast announcements to all tenants or target specific properties and tiers.

### 7. ⚙️ Account Settings & Security Hub (`/settings`)
- Profile update (name, phone number, contact details).
- Password change with cryptographic hash verification (`bcrypt`).
- Portfolio & workspace overview with instant tenant jump links.

---

## 🛡️ System Architecture & RBAC

```
                   ┌──────────────────────────────────────┐
                   │             PropPilot                │
                   └──────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌────────────────────────────────┐                     ┌────────────────────────────────┐
│     Management Workspace       │                     │     Resident Tenant Portal     │
│   (/dashboard, /properties)    │                     │           (/portal)            │
├────────────────────────────────┤                     ├────────────────────────────────┤
│ • Owner (Full Admin & Billing) │                     │ • Active Lease Inspector       │
│ • Manager (Operational Ops)    │                     │ • Online Rent Payment (SSLCom) │
│ • Staff (Maintenance Tickets)  │                     │ • Repair Ticket Submissions    │
└────────────────────────────────┘                     └────────────────────────────────┘
```

### RBAC Matrix:

| Role | Properties & Units | Tenants & Leases | Finance & Billing | Maintenance | Documents | Resident Portal |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **👑 OWNER** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Switchable |
| **👔 MANAGER** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Switchable |
| **🔧 STAFF** | View Only | View Only | View Only | Update & Resolve | View Only | Switchable |
| **🏠 TENANT** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full Access |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + Vite 6
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS + Custom Design Tokens (Vanilla CSS variables)
- **Icons:** Lucide React
- **HTTP Client:** Axios (with dynamic workspace & token interceptors)

### **Backend**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **ORM:** Prisma ORM 6
- **Validation:** Zod schema validation
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt password hashing
- **Payment Gateway:** SSLCommerz Sandbox Integration & IPN Webhooks

### **Database**
- **Engine:** PostgreSQL 15+

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [PostgreSQL](https://www.postgresql.org/) database instance
- npm or yarn package manager

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/proppilot_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_proppilot"
FRONTEND_URL="http://localhost:5173"
SSLCOMMERZ_STORE_ID="testbox"
SSLCOMMERZ_STORE_PASS="qwerty"
```

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start backend development server
npm run dev
```

---

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The application will be accessible at: `http://localhost:5173`.

---

### 3. Database Seeding

Populate the database with a complete multi-workspace and multi-role dataset:

```bash
cd backend
node prisma/seed.js
```

---

## 🔑 Test Personas & Login Credentials

All test users share the password: **`password123`**

| Persona | Email | Workspace 1: **Skynet Heights Portfolio** | Workspace 2: **OmniCorp Real Estate Group** |
| :--- | :--- | :--- | :--- |
| **Sarah Connor** | `sarah.connor@example.com` | 👑 **OWNER** *(Full Management Access)* | 🏠 **TENANT** *(Penthouse 4201)* |
| **Alex Murphy** | `alex.murphy@example.com` | 🏠 **TENANT** *(Apt 101)* | 👑 **OWNER** *(Full Management Access)* |
| **Elena Rostova** | `elena.rostova@example.com` | 🏠 **TENANT** *(Apt 102)* | 👔 **MANAGER** *(Property Manager)* |
| **Marcus Wright** | `marcus.manager@example.com` | 👔 **MANAGER** | — |
| **Kyle Reese** | `kyle.technician@example.com` | 🔧 **STAFF** *(Field Tech)* | — |

---

## 📡 API Architecture

```
/api
├── /auth
│   ├── POST /register               # Account registration
│   ├── POST /login                  # User authentication & token issuance
│   ├── GET  /me                     # Active session & workspace hydration
│   ├── PUT  /profile                # Update name & phone number
│   └── PUT  /change-password        # Secure password update
│
├── /properties                      # Properties, Unit Groups & Units CRUD
├── /tenants                         # Tenant profiles & Lease contracts
├── /finance                         # Invoices, Payments, Charge Types & SSLCommerz
├── /maintenance                     # Work orders, Repair tickets & Assignments
├── /documents                       # Document Vault uploads & metadata
├── /analytics                       # Portfolio KPIs, Occupancy & Revenue stats
└── /portal
    ├── GET  /overview               # Tenant multi-lease profile & balance
    ├── POST /maintenance            # Tenant repair request submission
    └── POST /invoices/:id/sslcommerz/init # Launch payment gateway checkout
```

---

## 📂 Project Directory Structure

```
proppilot/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Comprehensive relational data models
│   │   └── seed.js                  # Multi-tenant demo dataset seeder
│   └── src/
│       ├── config/                  # DB connection & environment configuration
│       ├── controllers/             # Request handling & HTTP validation
│       ├── middlewares/             # JWT auth & Workspace RBAC guards
│       ├── routes/                  # Express route definitions
│       └── services/                # Business logic & DB transactions
│
└── frontend/
    ├── public/                      # Static assets & icons
    └── src/
        ├── api/                     # Axios client & request interceptors
        ├── components/
        │   ├── common/              # PersistentDrawer, Modals, Skeletons
        │   ├── layout/              # AppLayout, WorkspaceDropdown
        │   └── properties/          # Unit360Drawer & Space Hierarchy
        ├── contexts/                # AuthContext & Workspace state provider
        └── pages/                   # Dashboard, Properties, Tenants, Finance,
                                     # Maintenance, Documents, Portal, Settings
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by the PropPilot Engineering Team.</sub>
</div>