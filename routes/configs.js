const express = require('express');
const router = express.Router();
var configs = require('../v1/controllers/configs.controller');
const auth = require('../auth');

/** get all configurations at once */
router.get('/configs/', auth.authorize, configs.getAllConfigurations);

router.post('/configs/', auth.authorize, configs.addConfigurations);

module.exports = router;