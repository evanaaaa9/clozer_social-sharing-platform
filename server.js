require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const circleRoutes = require('./routes/circles');
const postRoutes = require('./routes/posts');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://evana:<db_password>@evana.pqgeiri.mongodb.net/?appName=evana')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'clozer-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://evana:<db_password>@evana.pqgeiri.mongodb.net/?appName=evana'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// View engine
app.set('view engine', 'html');
app.engine('html', require('fs').readFile.bind(require('fs')));

// Routes
app.use('/', authRoutes);
app.use('/circles', circleRoutes);
app.use('/posts', postRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);

// Landing page
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Clozer running at http://localhost:${PORT}`);
});
