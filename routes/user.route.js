const express = require('express');
const router = express.Router();
const { check } = require('express-validator/check')
var userMasters = require('../v1/controllers/userMasters.controller');

/** get all Pages at once */
router.get('/', (req, res) => {
    res.send({ data: "sahi hai"})
});



module.exports = router;


