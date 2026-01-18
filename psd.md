# 📱 Expense Tracker PWA – Feature Overview

## 🎯 Objective

Build a **mobile-first PWA expense tracker** that allows users to log expenses using **text and voice**, powered by AI for **natural language parsing and auto-categorization**, with scope to evolve into a **limited personal finance assistant**.

---

## 👤 User Experience Goals

- Mobile-first design.
- Installable PWA.
- Fast expense entry.
- Minimal typing.
- Supports both:
  - Text input.
  - Voice input.
- User reviews and confirms before saving.

---

## 🧩 Core Features

### Expense Entry
- Add expenses via natural language:
  - “Spent 250 on lunch yesterday.”
  - “Paid 1200 for groceries.”
- Extract:
  - Amount.
  - Currency.
  - Category.
  - Description / merchant.
  - Date & time.

---

### AI Parsing & Categorization
- Understand flexible language formats.
- Normalize dates and amounts.
- Auto-categorize expenses.
- Category editable before save.

---

### Voice Support
- Optional voice input.
- Tap mic → speak → review → save.
- Speech → text → parse using same pipeline as text.

---

### Confirmation & Editing
- Show parsed result.
- Allow edits for all fields.
- Handle low-confidence cases.

---

### Expense Management
- List, search, filter expenses.
- Edit / delete records.

---

### Analytics
- Daily / weekly / monthly summaries.
- Category breakdowns.
- Total spend overview.

---

### Offline Support
- Add expenses offline.
- Sync when online.

---

### Personal Assistant Scope
- Limited to finance queries:
  - “How much did I spend on food this week?”
- No general chatbot behavior.

---

## 🌐 API Expectations

- Expense CRUD APIs.
- Text / Voice parse APIs.
- Categorization APIs.
- Analytics APIs.
- Assistant query APIs.

---

## 🧠 AI Usage (Flexible)

- AI used for parsing, categorization, and query understanding.
- Model choice is pluggable:
  - Backend-hosted models.
  - Or API providers (e.g. OpenRouter).

---

## 🛠️ Good to Have

- Budgets.
- Recurring expenses.
- Notifications.
- Receipt OCR.
- Export (CSV/Excel).
- Multi-currency support.

---

## ✅ Principles

- Mobile-first.
- Fast UX.
- AI assists, user controls.
- Scoped assistant (not general chat).
