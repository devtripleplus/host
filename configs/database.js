var mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (!err) {
        console.log("Connected Successfully");
    }
    else {
        console.log("Connection error: " + err);
    }
});

require('../models/bookmarks');
require('../models/pages');
require('../models/user');
require('../models/configs');
require('../models/loginAttempts');