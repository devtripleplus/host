var mongoose = require('mongoose');

var loginAttemptsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },

    lockUntil: {
        type: Number
    }

});

const loginAttempts = mongoose.model('loginAttempts', loginAttemptsSchema);
module.exports = loginAttempts;