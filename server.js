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
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://evana:lh8ZyXQ9uEo98hOJ@evana.pqgeiri.mongodb.net/clozer?retryWrites=true&w=majority&appName=evana')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'clozer-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://evana:lh8ZyXQ9uEo98hOJ@evana.pqgeiri.mongodb.net/clozer?retryWrites=true&w=majority&appName=evana'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use('/api/auth', authRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Clozer running at http://localhost:${PORT}`);
});