var mongoose = require('mongoose');

var PagesSchema = new mongoose.Schema({
  page_id: {
    type: String,
    unique: true,
    required: true
  },
  leaf_node: {
    type: Boolean
  },
  page_template: {
    type: String,
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: [],
  },
  page_options: {
    type: [],
  },
  meta_data: {
    type: Object
  },
  bookmark_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmarks'
  },

});

// module.exports = mongoose.model('Pages', PagesSchema);

const Pages = mongoose.model('Pages', PagesSchema);
module.exports = Pages;