var mongoose = require('mongoose');

var ConfigsSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
    },

    key: {
        type: String
    },

    value: {
        type: String
    },

    created_at: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Configs', ConfigsSchema);