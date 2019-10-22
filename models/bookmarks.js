var mongoose = require('mongoose');

var BookmarksSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user_id: {
    // type: String,
    // ref:'User',
    // required: "This field is required."
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String
  },
  type: {
    type: String
  },
  page_id: {
    // type: String,
    // ref:'Pages',
    // required: 'This field is required.'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pages'
  },
  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Bookmarks', BookmarksSchema);