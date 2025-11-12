# Invento — Browser-Based Inventory Management System

**Invento** is a complete inventory, billing, and revenue tracking system — built entirely with **Vanilla JavaScript**, **HTML**, and **SCSS**, with **LocalStorage** for offline data persistence.  
No frameworks. No backend. Just clean, efficient, browser-based logic.

---

## ⚙️ Features

### Core Modules
- **Add / Update / Delete Products (Inventory CRUD)**
- **Bulk Item Addition** — quickly upload or add multiple stock items
- **Smart Search & Auto Calculations** 
- **Auto-Generated PDF Invoices** (via jsPDF)
- **Sales & Revenue Analytics Dashboard**

### Expense Management
- **Calendar-based Expense Tracking** — mark daily expenses or purposes
- **Withdraw Feature** — not for real money withdrawal!  
  Simply lets shop owners **record expenses or profit cuts**, replacing traditional notebooks or diaries.

### Data Storage
- 100% **Offline Mode** using browser **LocalStorage**
- All data persists locally — no sign-in or internet required

### Learning Focus
- DOM manipulation & performance
- Modular SCSS (partials)
- Building an app that **feels like a PWA** — without any backend
- UI/UX optimization for shop owners’ workflow

---

## Future Enhancements
- **Firebase OTP verification** for shop owner authentication  
- **Automated WhatsApp Invoice Sharing** (requires online access)

---

## Tech Stack
| Category | Technologies |
|-----------|---------------|
| Frontend | HTML5, SCSS, Vanilla JavaScript |
| Styling | SCSS partials & variables |
| Storage | LocalStorage (Browser) |
| Libraries | jsPDF, jsPDF AutoTable |
| Build Tool | SASS Compiler |

---

## How to Run Locally

```bash
# Clone this repository
git clone https://github.com/Menaka0411/inventory-manager.git

# Navigate to project folder
cd inventory-manager

# Compile SCSS to CSS (if not compiled)
sass styles/style.scss styles/style.css

# Open index.html in your browser
