var mongoose = require('mongoose');

var PagesSchema = new mongoose.Schema({
  user_data: {
    type: {}
  },
  enable_value: {
    type: Number,
    default: 0
  },
  last_login: {
    type: Date,
    default: Date.now
  }

});
// module.exports = mongoose.model('User', PagesSchema);

const User = mongoose.model('User', PagesSchema);
module.exports = User;