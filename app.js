'use strict';
require('rootpath')();
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var globSync = require('glob').sync;
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./configs/database');

// var appRouter = require('./routes/route');
// var indexRouter = require('./routes/index');

var app = express();
app.use(cors('*'));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Origin", "http://localhost:8100");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// view engine setup
app.engine('ejs', require('express-ejs-extend'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var allRoutes = globSync('./routes/**/*', {
  cwd: __dirname
}).map(require);

allRoutes.forEach(function (routes) {
  app.use('/api/v1', routes);
});

// app.use('/api/v1', appRouter);
// app.use('/', indexRouter);

//catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;