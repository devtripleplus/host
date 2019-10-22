const express = require('express');
const router = express.Router();
const userMasters = require('../v1/controllers/userMasters.controller');
const auth = require('../auth');

router.post('/userMasters/doLogin', userMasters.doLogin);

router.get('/userMasters/getUser', auth.authorize, userMasters.getUser);

router.get('/userMasters/getProduct', auth.authorize, userMasters.getProduct);

router.post('/userMasters/refreshToken', auth.authorize, userMasters.refreshToken);

router.get('/userMasters/getPDF/:pdf_id', auth.authorize, userMasters.getPDF);

// router.get('/getSVG/:svg_id', userMasters.getSVG);

router.get('/userMasters/getImages/:img_id', auth.authorize, userMasters.getImages);

router.post('/userMasters/setValueSetting', auth.authorize, userMasters.enableValue);

router.get('/userMasters/getValueSetting', auth.authorize, userMasters.getValueSetting);

/**get a single Page by id */
router.get('/login-with-okta', userMasters.loginWithOkta);


module.exports = router;