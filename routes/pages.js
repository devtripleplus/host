const express = require('express');
const router = express.Router();
const { check } = require('express-validator/check')
var pages = require('../v1/controllers/pages.controller');
const auth = require('../auth');

/** get all Pages at once */
router.get('/pages/', auth.authorize, pages.getPages);

/**get a single Page by id */
router.get('/pages/:page_id', auth.authorize, pages.getPage);

/**get a single Page by id */
router.get('/pages-with-bookmark', auth.authorize, pages.getPagesWithBookmarkStatus);

/**create a bookmark */
router.post('/pages/', auth.authorize, [
    check('page_id').isString().withMessage("Please provide a valid page id."),
    check('title').isString().withMessage("Please provide a valid title."),
], pages.createPage);

module.exports = router;


