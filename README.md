# FocusCam 🎯

A full-stack focus tracking app that uses your webcam to detect when you're distracted and motivates you to stay on track.

## Features
- User signup / login with JWT auth
- Personal motivation quote saved to your profile
- Live webcam feed with face-api.js distraction detection
- Detects: eyes closed, face away, yawning, phone in hand
- Audio alert + motivation quote shown on distraction
- Session stats: focus %, alert count, streak, total time
- Session history saved to MongoDB

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + React Router |
| Styling | CSS Variables (dark theme) |
| Camera AI | face-api.js + TensorFlow.js |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

---

## Project Structure
```
focuscam/
├── client/           ← React frontend
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Motivation.jsx
│       │   ├── FocusSession.jsx
│       │   └── Summary.jsx
│       ├── components/
│       │   ├── CameraFeed.jsx
│       │   ├── AlertOverlay.jsx
│       │   ├── StatsPanel.jsx
│       │   └── Navbar.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useFaceDetection.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/           ← Node.js + Express backend
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── motivation.js
│   │   └── sessions.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
│
├── package.json      ← root (optional for monorepo)
└── README.md
```

---

## Setup & Run

### 1. Install MongoDB
Make sure MongoDB is running locally on port 27017, or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud DB).

### 2. Setup Backend
```bash
cd server
npm install
# Create .env file:
echo "MONGO_URI=mongodb://localhost:27017/focuscam" > .env
echo "JWT_SECRET=your_super_secret_key_here" >> .env
echo "PORT=5000" >> .env
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open App
Visit: http://localhost:5173

---

## How Detection Works

face-api.js runs entirely in the browser (no server needed for detection):

| Distraction | How Detected |
|---|---|
| Eyes Closed | Eye Aspect Ratio (EAR) < 0.2 from 68-point landmarks |
| Yawning | Mouth Aspect Ratio (MAR) > 0.6 from landmarks |
| Face Away | No face detected in frame for 2+ seconds |
| Phone in Hand | Brightness drop + face + object heuristic |

Models are loaded from: https://cdn.jsdelivr.net/npm/face-api.js/weights/

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login, get JWT |
| GET | /api/auth/me | Get current user |
| PUT | /api/motivation | Save motivation |
| POST | /api/sessions | Save session |
| GET | /api/sessions | Get session history |
