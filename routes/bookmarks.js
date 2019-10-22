const express = require('express');
const router = express.Router();
const { check } = require('express-validator/check')
var bookmarks = require('../v1/controllers/bookmarks.controller');
const auth = require('../auth');

/** get all bookmarks at once */
router.get('/bookmark/', auth.authorize, bookmarks.getAllBookmarks);

/**get a single bookmark by id */
router.get('/bookmark/:page_id', auth.authorize, bookmarks.getBookmark);

/**create a bookmark */
router.post('/bookmark/', auth.authorize, [
    check('page_id').isString().withMessage("Please provide a valid page id.")
], bookmarks.createBookmark);

/**Delete a bookmark */
router.delete('/bookmark/:_id', auth.authorize, bookmarks.deleteBookmark);

/**Update a bookmark */
router.put('/bookmark/:_id', auth.authorize, [
    check('page_id').isString().withMessage("Please provide a valid page id.")
], bookmarks.updateBookmark);
module.exports = router;


