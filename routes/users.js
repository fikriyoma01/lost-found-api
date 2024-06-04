const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Registrasi Pengguna
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;
    
    // Periksa apakah user sudah terdaftar
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User sudah terdaftar" });
    }

    // Enkripsi password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    // Buat user baru
    user = new User({
      name,
      email,
      password
    });

    // Simpan user
    await user.save();
    
    res.status(201).json({ success: true, message: "User berhasil didaftarkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  console.log('Received login request with body:', req.body);
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
    // Menggenerate token
  const token = jwt.sign({ id: user._id }, 'rahasia', {
    expiresIn: 86400 // expires in 24 hours
  });
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({message: err.message});
      }
      // Sukses login, kirimkan respon sukses dan token jika perlu
      // Contoh: res.json({message: 'Login berhasil', token: 'yourTokenHere'});
      return res.json({
        message: 'Login berhasil',
        user: {
          _id: user._id, // Include the MongoDB user ID
          email: user.email,
          name: user.name
          // Add any other user info you need client-side
        },
        token: token
        // Include the token if you are using token-based authentication
      });
    });
  })(req, res, next);
});

module.exports = router;

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
  });
