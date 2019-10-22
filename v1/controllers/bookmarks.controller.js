//TASK-[]<Shobhit> - [Start]<2019-05-21>
var mongoose = require('mongoose');

/** call bookmarks model */
var bookmarks = mongoose.model('Bookmarks');
var users = mongoose.model('User');
var pages = mongoose.model('Pages');

/** Express vaildator */
const { validationResult } = require('express-validator/check');
let jwt = require('jsonwebtoken');

/**To get all bookmarks using user_id */
// let getAllBookmarks = async (req, res) => {
//   user_id = req.user_id;
//   bookmarks.aggregate([
//     {
//       $lookup:
//       {
//         from: 'pages',
//         localField: 'page_id',
//         foreignField: 'page_id',
//         as: 'page'
//       }
//     },
//     {
//       $match: {
//         user_id: user_id
//       }
//     }
//   ]).sort({ created_at: 'desc' }).then(bookmarks => {
//     if (bookmarks.length) {
//       return res.status(200).send({ status: true, result: bookmarks, message: 'success' });
//     }
//     return res.status(200).send({ status: false, result: [], message: 'No records found.' });
//   })
//     .catch(err => {
//       return res.status(200).send({ status: false, result: [], message: err });
//     });
// };



let getAllBookmarks = async (req, res) => {
  user_id = req.user_id;
  // users.findOne({ 'user_data.sAMAccountName': user_id }).then(user => {
  //   user_id = user.id;

  user_id = getUserObjId(user_id);
  user_id = await user_id;

  if (user_id) {
    bookmarks.find({ 'user_id': user_id })
      .populate('user_id')
      .populate('page_id')
      .sort({ created_at: 'desc' })
      .then(bookmarks => {
        if (bookmarks.length) {
          return res.status(200).send({ status: true, result: bookmarks, message: 'success' });
        }
        return res.status(200).send({ status: false, result: [], message: 'No records found.' });
      })
      .catch(err => {
        return res.status(200).send({ status: false, result: [], message: err });
      });
  } else {
    return res.status(200).send({ status: false, result: [], message: 'No records found.' });
  }
  // }).catch(err => {
  //   return res.status(200).send({ status: false, result: [], message: err });
  // });
};

/**get a single bookmark */
// let getBookmark = async (req, res) => {

//   const ObjectId = mongoose.Types.ObjectId;
//   user_id = req.user_id;
//   if (req.params.page_id && user_id) {
//     bookmarks.find({ page_id: req.params.page_id, user_id: user_id }).then(bookmark => {
//       if (bookmark.length) {
//         return res.status(200).send({ status: true, result: bookmark, message: "success" });
//       }
//       return res.status(200).send({ status: false, result: [], message: "Not found." });
//     }).catch(err => {
//       return res.status(200).send({ status: false, result: [], message: err });
//     });
//   } else {
//     return res.status(200).send({ status: false, result: [], message: "Not found." });
//   }
// };

let getBookmark = async (req, res) => {
  user_id = req.user_id;
  if (req.params.page_id && user_id) {
    // users.findOne({ 'user_data.sAMAccountName': user_id }).then(user => {
    //   user_id = user.id;
    // pages.findOne({ 'page_id': req.params.page_id }).then(pages => {
    //   page_id = pages.id;

    user_id = getUserObjId(user_id);
    page_id = getPageObjId(req.params.page_id);

    user_id = await user_id;
    page_id = await page_id;

    if (user_id && page_id) {
      bookmarks.find({ page_id: page_id, user_id: user_id }).then(bookmark => {
        if (bookmark.length) {
          return res.status(200).send({ status: true, result: bookmark, message: "success" });
        }
        return res.status(200).send({ status: false, result: [], message: "Not found." });
      }).catch(err => {
        return res.status(200).send({ status: false, result: [], message: err });
      });
    } else {
      return res.status(200).send({ status: false, result: [], message: "Not found." });
    }
    // }).catch(err => {
    //   return res.status(200).send({ status: false, result: [], message: err });
    // });
    // }).catch(err => {
    //   return res.status(200).send({ status: false, result: [], message: err });
    // });
  } else {
    return res.status(200).send({ status: false, result: [], message: "Not found." });
  }
};

/** Create a bookmark */
// let createBookmark = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(200).send({ status: false, result: [], 'message': errors.array() });
//   }
//   user_id = req.user_id;
//   let type = '';
//   if (req.body.type == 'fav' && req.body.type !== '') {
//     type = 'fav';
//   } else if (req.body.type == 'action-item' && req.body.type !== '') {
//     type = 'action item';
//   } else {
//     type = '';
//   }
//   bookmarks.create({
//     user_id: user_id || "SYSTEM",
//     page_id: req.body.page_id,
//     category: req.body.category || "USER",
//     type: type
//   }).then(bookmark => {
//     return res.status(200).send({ status: true, result: bookmark, message: 'success' });
//   }
//   ).catch(err => {
//     return res.status(200).send({ status: false, result: [], message: err })
//   });
// };

let createBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).send({ status: false, result: [], 'message': errors.array() });
  }

  user_id = req.user_id;
  let type = '';

  if (req.body.type == 'fav' && req.body.type !== '') {
    type = 'fav';
  } else if (req.body.type == 'action-item' && req.body.type !== '') {
    type = 'action item';
  } else {
    type = '';
  }

  // users.findOne({ 'user_data.sAMAccountName': user_id }).then(user => {
  //   user_id = user.id;
  //   pages.findOne({ 'page_id': req.body.page_id }).then(page => {
  //     page_id = page.id;

  // mongoose.connection.db.collection('bookmarks').insertOne({
  //   user_id: mongoose.connection.db.collection('users').findOne({ 'user_data.sAMAccountName': user_id }).id,
  //   page_id: mongoose.connection.db.collection('pages').findOne({ 'page_id': req.body.page_id }).id,
  //   category: req.body.category || "USER",
  //   type: type
  // }).then(bookmark => {

  user_id = getUserObjId(user_id);
  page_id = getPageObjId(req.body.page_id);

  user_id = await user_id;
  page_id = await page_id;

  if (user_id && page_id) {
    bookmarks.create({
      user_id: user_id || "SYSTEM",
      page_id: page_id,
      category: req.body.category || "USER",
      type: type
    }).then(bookmark => {
      return res.status(200).send({ status: true, result: bookmark, message: 'success' });
    }
    ).catch(err => {
      return res.status(200).send({ status: false, result: [], message: err })
    });
    //   }).catch(err => {
    //     return res.status(200).send({ status: false, result: [], message: err })
    //   });
    // }).catch(err => {
    //   return res.status(200).send({ status: false, result: [], message: err })
    // });
  } else {
    return res.status(200).send({ status: true, result: bookmark, message: 'No record found' });
  }
};

async function getUserObjId(user_id) {
  return await users.findOne({ 'user_data.sAMAccountName': user_id }).then(user => {
    return user_id = user.id;
  });
};

async function getPageObjId(page_id) {
  return await pages.findOne({ 'page_id': page_id }).then(page => {
    return page_id = page.id;
  });
};


/**
 * Delete a particular bookmark using _id
 * @param {*} req.params._id 
 * @param {*} res 
 */
let deleteBookmark = async (req, res) => {
  bookmarks.findByIdAndRemove(req.params._id).then(
    (bookmark) => {
      return res.status(200).send({ status: true, result: [], message: 'Bookmark deleted successfully.' });
    }
  ).catch(err => {
    return res.status(200).send({ status: false, result: [], 'message': err });
  });
};

/**
 * Update a bookmark using _id
 * @param {*} req 
 * @param {*} res 
 */
let updateBookmark = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).send({ status: false, result: [], 'message': errors.array() });
  }
  bookmarks.findByIdAndUpdate(req.params._id, req.body, { new: true }).then(bookmark => {
    return res.status(200).send({ status: true, result: bookmark, message: 'Bookmark updated successfully.' });
  })
    .catch(err => {
      return res.status(200).send({ status: false, result: [], 'message': err });
    });
};

module.exports = {
  getBookmark,
  getAllBookmarks,
  createBookmark,
  deleteBookmark,
  updateBookmark
};
