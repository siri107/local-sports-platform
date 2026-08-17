# Local Sports & Indoor Games Partner Finder Platform

A full-stack MERN web application that helps users find nearby partners for indoor and
outdoor games — now with communities, notifications, upcoming games, enhanced profiles,
and a full analytics dashboard.

## Problem Statement
Many individuals struggle to find suitable partners to play recreational games due to
lack of awareness about nearby players, limited access to community networks, and
dependence on informal WhatsApp groups.

## Objectives
- Enable users to find nearby game partners easily
- Promote indoor and outdoor recreational activities
- Encourage community bonding and social interaction
- Reduce coordination effort for casual games

## Feature Set (v2)
- **Auth & Profiles:** registration/login, editable profile, public profile view for
  any user (bio, favorite games, skill level, achievements, communities, ratings)
- **Player Discovery:** search/filter by game, location, skill level
- **Active Users:** see who's online now or recently active, with live status dots
- **Play Requests:** send/accept/reject/cancel requests; each action creates a notification
- **Upcoming Games:** accepted requests automatically appear as upcoming games for both
  users, with opponent contact info, venue, date, and time; mark as completed when done
- **Match History & Ratings:** completed games list, with optional post-match rating
- **Communities:** create/join/leave communities by sport, post discussions, like posts,
  add upcoming events (creator only)
- **Notifications & History:** a unified feed of play requests, acceptances, declines,
  cancellations, community updates, and system notifications, with read/unread state
- **Analytics Dashboard (admin):** KPI cards + line/bar/pie charts covering user growth,
  community growth, popular sports, active locations, peak hours, request breakdown,
  and daily activity
- **28 supported sports/activities** — see full list below

## Scope
**In-Scope:** Web-based platform (responsive), partner discovery by location/game type,
user profiles, match requests and confirmations, communities, notifications, analytics.
**Out of Scope:** Native mobile apps, tournament organization/scoring, paid coaching.

## Technology Stack
- **Frontend:** React.js, HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, React Router DOM,
  Axios, Recharts (analytics charts)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt.js

## System Architecture

```
[React Frontend] <--Axios/REST--> [Express.js API] <--Mongoose--> [MongoDB]
      |                                  |
  React Router                    JWT Auth Middleware
  Context API (Auth)              Controllers / Routes
```

## Folder Structure

```
local-sports-platform/
├── backend/
│   ├── config/db.js
│   ├── controllers/     (auth, user, game, player, request, admin,
│   │                     community, notification, analytics)
│   ├── middleware/      (auth, errorHandler)
│   ├── models/          (User, Game, PlayRequest, Community, CommunityPost, Notification)
│   ├── routes/
│   ├── utils/notify.js  (notification creation helper)
│   ├── seed/seedGames.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   (Navbar, Footer, PlayerCard, ProtectedRoute)
    │   ├── pages/         (Home, Login, Register, Dashboard, Profile, PublicProfile,
    │   │                   EditProfile, FindPlayers, PlayRequests, UpcomingGames,
    │   │                   MatchHistory, Communities, CommunityDetail, ActiveUsers,
    │   │                   Notifications, Analytics, AdminDashboard, About, Contact)
    │   ├── context/       (AuthContext)
    │   ├── hooks/         (useAuth)
    │   ├── services/      (api.js — Axios instance)
    │   ├── constants/     (games.js — shared sports list)
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Database Schema

**Users**: name, email, password (hashed), phone, role (user/admin), favoriteGames[],
skillLevel, availability {days[], timeSlot}, location, playingLocationType, bio,
achievements[], gamesPlayedCount, communities[] (ref), rating {average, count},
ratingsReceived[], lastActive.

**Games**: name, category (indoor/outdoor), description, icon.

**PlayRequests**: sender (User ref), receiver (User ref), game, message,
proposedLocation, proposedDate, proposedTime, status
(pending/accepted/rejected/cancelled/completed), completedAt.

**Communities**: name, description, sportType, coverImage, creator (User ref),
members[] (ref), events[] {title, description, location, date}.

**CommunityPosts**: community (ref), author (User ref), content, likes[] (ref).

**Notifications**: user (recipient ref), type, title, message, relatedUser,
relatedRequest, relatedCommunity, game, location, status, isRead.

## API List

| Method | Endpoint                          | Description                        | Auth    |
|--------|------------------------------------|--------------------------------------|---------|
| POST   | /api/auth/register                  | Register a new user                  | Public  |
| POST   | /api/auth/login                     | Login user                           | Public  |
| POST   | /api/auth/logout                    | Logout user                          | Public  |
| GET    | /api/users/profile                   | Get logged-in user's profile         | Private |
| PUT    | /api/users/profile                    | Update profile                       | Private |
| GET    | /api/users/:id                        | Get any user's public profile        | Private |
| GET    | /api/games                          | List all games                       | Public  |
| POST   | /api/games                          | Create a game                        | Admin   |
| DELETE | /api/games/:id                       | Delete a game                        | Admin   |
| GET    | /api/players/search                   | Search nearby players                | Private |
| GET    | /api/players/active                   | List online/recently active users    | Private |
| POST   | /api/requests                       | Send a play request                  | Private |
| GET    | /api/requests                        | Get sent & received requests         | Private |
| GET    | /api/requests/upcoming                | Get upcoming (accepted) games        | Private |
| GET    | /api/requests/history                 | Get match history (completed)        | Private |
| PUT    | /api/requests/:id/accept               | Accept a play request                | Private |
| PUT    | /api/requests/:id/reject               | Reject a play request                | Private |
| PUT    | /api/requests/:id/cancel               | Cancel a sent pending request        | Private |
| PUT    | /api/requests/:id/complete              | Mark an accepted game completed      | Private |
| POST   | /api/requests/:id/rate                 | Rate an opponent post-match          | Private |
| GET    | /api/communities                     | List/search communities              | Private |
| POST   | /api/communities                     | Create a community                   | Private |
| GET    | /api/communities/:id                  | Get community details                | Private |
| PUT    | /api/communities/:id/join              | Join a community                     | Private |
| PUT    | /api/communities/:id/leave             | Leave a community                    | Private |
| POST   | /api/communities/:id/events             | Add an event (creator only)          | Private |
| GET    | /api/communities/:id/posts              | List discussion posts                | Private |
| POST   | /api/communities/:id/posts              | Create a discussion post             | Private |
| PUT    | /api/communities/posts/:postId/like      | Like/unlike a post                   | Private |
| GET    | /api/notifications                    | Get all notifications                | Private |
| GET    | /api/notifications/unread-count         | Get unread notification count        | Private |
| PUT    | /api/notifications/:id/read             | Mark one notification as read        | Private |
| PUT    | /api/notifications/read-all             | Mark all notifications as read       | Private |
| GET    | /api/analytics                       | Full KPI/analytics payload           | Admin   |
| GET    | /api/admin/users                      | List all users                       | Admin   |
| DELETE | /api/admin/users/:id                   | Remove a user                        | Admin   |
| GET    | /api/admin/reports                      | Basic platform stats                 | Admin   |

## Supported Sports & Activities
Cricket, Football, Volleyball, Basketball, Badminton, Tennis, Table Tennis, Chess,
Carrom, Kabaddi, Hockey, Pickleball, Skating, Running, Cycling, Swimming, Athletics,
Throwball, Handball, Billiards, Snooker, Futsal, Bowling, Archery, Yoga, Fitness
Groups, Trekking, Cards.

## Installation Steps

### Prerequisites
- Node.js (v18+) and npm installed
- MongoDB running locally or a MongoDB Atlas connection string

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI, JWT_SECRET, etc.
npm run dev            # starts the server on http://localhost:5000
```

Optional: seed the full sports list into MongoDB:
```bash
node seed/seedGames.js
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL if backend isn't on localhost:5000
npm run dev              # starts the app on http://localhost:5173
```

### Creating an Admin User
By default all new registrations get the `user` role. To create an admin, register
normally, then manually update that user's `role` field to `"admin"` in MongoDB
(e.g., via MongoDB Compass or the mongo shell):
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
Admins get access to `/admin` (user management, basic reports) and `/analytics`
(the full KPI dashboard with charts).

## Future Enhancements
- Mobile application
- Real-time chat and messaging (current notifications are polling-based, not sockets)
- Tournament and leaderboard features
- Privacy settings for public profile visibility
- AI-based partner recommendations

## Expected Outcome
A clean, modern, responsive web application implementing all core functionalities —
registration/login, profile management, player search, communities, play requests,
upcoming games, notifications, match history, and an admin analytics dashboard —
built with React.js, Node.js, Express.js, and MongoDB.
