var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let records = [];
  bookmarks = await mongoose.model('Bookmarks').find();
  res.render('pages/index', { title: 'UPM', bookmarks: bookmarks });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', { title: 'About' });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('pages/contact', { title: 'Contact' });
});

module.exports = router;
