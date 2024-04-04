const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/UserModel'); // Sesuaikan dengan path model pengguna Anda

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
  passport.authenticate('local', {
    successRedirect: '/dashboard', // Sesuaikan dengan rute sukses
    failureRedirect: '/users/login', // Sesuaikan dengan rute gagal
    failureFlash: true
  })(req, res, next);
});

module.exports = router;

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
  });
