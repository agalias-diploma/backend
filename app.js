const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');

require('dotenv').config();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const helloRouter = require('./routes/hello');
const s3Routes = require('./routes/s3-bucket');
require('./utils/passportConfig')(passport);

const app = express();

console.log("Starting the server...");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Public routes
app.use(indexRouter)
app.use('/', indexRouter);
app.use(helloRouter)
app.use('/hello', indexRouter);
app.use(authRouter)
app.use('/auth', authRouter);
app.use('/api', s3Routes);

// Protected routes
app.use(passport.authenticate('jwt', { session: false }));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res) => {
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        }
    });
});

module.exports = app;
