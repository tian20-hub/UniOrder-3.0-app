# Uniorder 🎓✨

> The modern school uniform & campus merchandise management system.

Uniorder simplifies uniform ordering, stock tracking, payment confirmations, and role-based campus store management.

---

## 📁 Project Structure

```
uniorder/
├── public/
│   └── index.html               # HTML template & fonts
├── src/
│   ├── components/
│   │   ├── Login.js             # 🔐 Login Page
│   │   ├── SignUp.js            # 📝 Create Account
│   │   ├── ResetPassword.js     # 🔑 Forgot Password + OTP Verification
│   │   ├── StudentCatalog.js    # 🎓 Catalog + Profile + Orders
│   │   ├── OrderHistory.js      # 📋 Student Order Status
│   │   ├── Inventory.js         # 👕 Staff — Stock Management
│   │   ├── FinancePayments.js   # 💰 Finance — Confirm & Release
│   │   ├── MotherAdmin.js       # 👑 System Control & User Management
│   │   ├── Reports.js           # 📊 Charts & Statistics
│   │   └── Shared.js            # 🧩 UI Kit (Icons, Badges, Layout)
│   │
│   ├── App.js                   # 🔀 App Routing & State Hub
│   ├── index.js                 # 🚀 Entry Point
│   └── index.css                # 🎨 Tailwind Styles & Design System
│
├── tailwind.config.js           # ⚙️ Tailwind Setup
├── postcss.config.js            # ⚙️ PostCSS Setup
├── package.json                 # 📦 Dependencies & Scripts
└── README.md                    # 📖 Project Documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 👥 Roles & Workflows

1. **Student**:
   - Browse catalog by categories (Tops, Bottoms, Layers, Sportswear).
   - Add items to bag, place orders, and review live order progress.
2. **Staff**:
   - Track inventory across uniform lines and receive low-stock alerts.
   - Quick one-click stock adjustments.
3. **Finance**:
   - Verify student payments.
   - Confirm orders and release packages for student pickup.
4. **Administrator (MotherAdmin)**:
   - Full system overview, user management, and access controls.
   - Analytics, order volume trends, and revenue insights.

