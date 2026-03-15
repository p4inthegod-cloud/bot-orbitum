# Trading Funnel Bot - TODO

## Backend Setup
- [x] Initialize project with web-db-user template
- [x] Create database schema (users, materials, lessons, broadcasts)
- [x] Create tRPC procedures for bot API
- [ ] Add Telegram bot token to secrets

## Telegram Bot Core
- [x] Setup Telegram Bot API client (telegraf)
- [x] Create /start command handler
- [x] Create main menu with lesson navigation
- [x] Implement lesson/material viewing
- [x] Add user tracking (viewed materials)
- [x] Implement free tier limits (first 3 lessons)

## Admin Panel Frontend
- [x] Create DashboardLayout with admin navigation
- [x] Dashboard page with statistics
- [x] Users management page
- [x] Materials management page
- [x] Broadcasts/Mailing page
- [x] Admin authentication

## Database Schema
- [x] Users table (telegram_id, subscription_status, created_at)
- [x] Lessons table (lesson_number, title, order)
- [x] Materials table (lesson_id, title, content, access_level)
- [x] User progress table (user_id, material_id, viewed_at)
- [x] Broadcasts table (title, content, target_users, sent_at)

## Content Management
- [x] Load 13 lessons with materials
- [x] Set access levels (free vs premium)
- [x] Create material content (text + links)

## Statistics & Analytics
- [x] Track user joins
- [x] Track material views
- [x] Track subscription status
- [x] Generate dashboard stats

## Testing & Deployment
- [ ] Test bot commands
- [ ] Test admin panel flows
- [x] Setup bot webhook or polling
- [x] Prepare deployment guide

## Future Enhancements
- [ ] Integrate payment system (Stripe/YooKassa)
- [ ] Automated broadcast scheduling
- [ ] Video content support
- [ ] Advanced analytics
- [ ] User notifications
