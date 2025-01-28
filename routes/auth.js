const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const AuthUser = require('../models/auth');

const router = express.Router();

router.get('/auth', (req, res) => {
    res.redirect('/auth/google'); // Redirect to the Google OAuth login
});

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
  
const FRONTEND_URL = process.env.FRONTEND_URL;

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { user: { id: user._id, email: user.google.email } },
        'secretKey',
        { expiresIn: '1h' }
      );

      // Redirect to the frontend with the token
      res.redirect(`${FRONTEND_URL}?token=${token}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);


module.exports = router;
