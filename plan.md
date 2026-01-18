# Expense Tracker - Development Plan

## Phase 1: Core Features ✅ COMPLETE
- [x] User authentication (Supabase Auth)
- [x] Add expenses (manual form)
- [x] Edit expenses
- [x] Delete expenses
- [x] View dashboard with total and category breakdown
- [x] AI-powered natural language parsing (Groq)
- [x] Voice input (Web Speech API)
- [x] PWA setup (installable, manifest, icons)
- [x] Deploy to Vercel
- [x] Partial offline support (add offline, auto-sync)

## Phase 2: UX Improvements ✅ COMPLETE
- [x] Dashboard redesign
  - [x] Summary cards (Recurring, One-time, Grand Total)
  - [x] Group expenses by category (collapsible sections)
  - [x] Compact expense cards (reduce spacing)
  - [x] Visual category indicators (icons/colors)
  - [x] Category-based organization
- [x] Recurring expense support
  - [x] Add "recurring" flag to expense model (database migration)
  - [x] UI toggle for marking expenses as recurring
  - [x] Visual distinction (badge/icon) for recurring items
  - [ ] Filter to show/hide recurring expenses
- [x] Improved expense cards
  - [x] Smaller font sizes, tighter spacing
  - [x] Category color coding
  - [x] Merchant prominence
  - [x] Quick action buttons (edit/delete)
- [x] Custom toast notifications (replaced browser alerts)
- [x] Custom confirmation dialogs
- [x] Predefined category system (15 categories)
- [x] AI constrained to use predefined categories

## Phase 3: Categories & Organization
- [x] Time-based filtering
  - [x] Month view with navigation
  - [x] Week view (Monday-Sunday)
  - [x] Period selector UI component
  - [x] URL state management
- [ ] Custom category management
  - [ ] Create custom categories
  - [ ] Assign icons to categories
  - [ ] Set category colors
  - [ ] Default categories on signup
- [ ] Search & filtering
  - [ ] Search by description/merchant
  - [ ] Filter by date range
  - [ ] Filter by category
  - [ ] Filter by amount range
  - [ ] Sort options (date, amount, category)
- [ ] Bulk operations
  - [ ] Select multiple expenses
  - [ ] Bulk delete
  - [ ] Bulk category change

## Phase 4: Budget Tracking
- [ ] Budget creation
  - [ ] Set monthly budget
  - [ ] Set per-category budgets
  - [ ] Budget period selection (weekly/monthly/yearly)
- [ ] Budget visualization
  - [ ] Progress bars for each category
  - [ ] Overall budget progress
  - [ ] Color-coded warnings (green/yellow/red)
- [ ] Budget alerts
  - [ ] Notifications when approaching limit (80%, 90%, 100%)
  - [ ] Daily/weekly spending summaries
  - [ ] Budget recommendations based on history

## Phase 5: Analytics & Insights
- [ ] Spending trends
  - [ ] Line chart: spending over time
  - [ ] Bar chart: category breakdown
  - [ ] Pie chart: expense distribution
- [ ] Comparisons
  - [ ] Month-over-month comparison
  - [ ] Year-over-year comparison
  - [ ] Category trends
- [ ] Insights
  - [ ] Top spending categories
  - [ ] Most frequent merchants
  - [ ] Average daily/weekly/monthly spend
  - [ ] Unusual spending patterns detection

## Phase 6: Advanced Features
- [ ] Receipt management
  - [ ] Photo upload
  - [ ] OCR for data extraction
  - [ ] Attach receipts to expenses
  - [ ] Gallery view of receipts
- [ ] Export & reporting
  - [ ] Export to CSV
  - [ ] Export to PDF with charts
  - [ ] Email monthly reports
  - [ ] Custom date range exports
- [ ] Recurring expenses automation
  - [ ] Auto-create recurring expenses
  - [ ] Subscription tracking
  - [ ] Renewal reminders
- [ ] Multi-currency support
  - [ ] Currency selection per expense
  - [ ] Real-time exchange rates
  - [ ] Multi-currency totals

## Phase 7: Collaboration (Future)
- [ ] Expense sharing
  - [ ] Share with family/roommates
  - [ ] Split expenses
  - [ ] Group budgets
  - [ ] Shared categories
- [ ] Permissions
  - [ ] View-only access
  - [ ] Edit access
  - [ ] Admin controls

## Technical Debt & Improvements
- [ ] Complete offline support
  - [ ] Convert dashboard to Client Component
  - [ ] Cache expense data for offline viewing
  - [ ] Conflict resolution for offline edits
- [ ] Performance optimization
  - [ ] Implement pagination for expense list
  - [ ] Virtual scrolling for large lists
  - [ ] Image optimization for receipts
- [ ] Testing
  - [ ] Unit tests for core functions
  - [ ] Integration tests for sync logic
  - [ ] E2E tests for critical flows
- [ ] Accessibility
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader support

## Bug Fixes & Polish
- [ ] Fix: Dashboard offline navigation (shows browser error)
- [ ] Fix: Service worker registration in dev mode
- [ ] Improve: Loading states and skeletons
- [ ] Improve: Error messages and validation
- [ ] Improve: Mobile responsiveness
- [ ] Improve: Dark mode consistency

---

## Current Focus: Phase 3 - Time-Based Filtering Complete! 🎉

**Recently Completed:**

### Phase 2: UX Improvements ✅
1. ✅ Dashboard redesign with summary cards
2. ✅ Recurring expense tracking (database + UI)
3. ✅ Category grouping with collapsible sections
4. ✅ Compact, mobile-optimized design
5. ✅ Custom toast notifications & dialogs
6. ✅ 15 predefined categories with AI constraint

### Phase 3: Time-Based Filtering ✅
1. ✅ Month/Week view selector with tab-based UI
2. ✅ Period navigation (previous/next arrows)
3. ✅ Week definition: Monday-Sunday
4. ✅ URL state management for bookmarking
5. ✅ "Today" button for quick navigation
6. ✅ Dynamic expense filtering by date range

**Next Up: Categories & Organization**
- Custom category management
- Search & filtering (description, merchant, amount)
- Bulk operations
