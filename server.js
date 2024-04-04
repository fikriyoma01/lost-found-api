const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash'); // Impor connect-flash
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Konfigurasi CORS
app.use(cors({
  origin: 'http://localhost:3000', // Sesuaikan dengan origin frontend Anda
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true // Untuk mendukung sesi dengan CORS
}));

// Middleware untuk parsing JSON dan urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Connect flash middleware
app.use(flash());

// Passport Config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // Tambahkan ini jika Anda menggunakan method .createIndex di mana saja dalam aplikasi Anda
  // useFindAndModify: false // Tambahkan ini jika Anda menggunakan method .findOneAndUpdate atau .findOneAndDelete
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Define routes
app.use('/lostitems', require('./routes/lostItems'));
app.use('/founditems', require('./routes/foundItems'));
app.use('/users', require('./routes/users')); 

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});