# Clozer 🟢

A circle-based social sharing platform. Create private circles, share posts with only the people you choose. No algorithms, no noise — just intentional sharing.

**Tech stack:** HTML · CSS · JavaScript · Node.js · Express · MongoDB

---

## Features

- Create and manage circles (e.g. Close Friends, Work Crew, Family)
- Share posts with selected circles only
- Like and comment on posts
- Add/remove members from circles
- Authentication with sessions
- Clean minimal UI

---

## Local setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/clozer.git
cd clozer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clozer
SESSION_SECRET=some_long_random_string
NODE_ENV=development
```

### 4. Run MongoDB locally
Make sure MongoDB is running on your machine.
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### 5. Start the app
```bash
npm run dev   # development (nodemon)
npm start     # production
```

Visit: **http://localhost:3000**

---

## Deploy to Render (free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repo
4. Set these:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add environment variables in Render dashboard:
   - `MONGODB_URI` → get a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - `SESSION_SECRET` → any long random string
   - `NODE_ENV` → `production`
6. Click **Deploy** 🚀

---

## Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New project → Deploy from GitHub
3. Add a **MongoDB** plugin from the Railway dashboard
4. Set env vars: `SESSION_SECRET`, `NODE_ENV=production`
5. Railway auto-detects Node.js and deploys

---

## Project structure

```
clozer/
├── server.js           # Express app entry
├── models/
│   ├── User.js         # User schema
│   ├── Circle.js       # Circle schema
│   └── Post.js         # Post schema
├── routes/
│   ├── auth.js         # Register, login, logout
│   ├── circles.js      # Circle CRUD + members
│   ├── posts.js        # Posts, likes, comments
│   └── dashboard.js    # Dashboard page
├── middleware/
│   └── auth.js         # requireAuth middleware
├── public/
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   ├── register.html   # Register page
│   ├── dashboard.html  # App dashboard
│   ├── css/style.css   # All styles
│   └── js/dashboard.js # Dashboard logic
└── .env.example
```

---

## Get a free MongoDB URI (Atlas)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the URI and paste in your `.env` as `MONGODB_URI`
5. Replace `<password>` with your DB user's password

---

Built with ♥ using Node.js + Express + MongoDB
