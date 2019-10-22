//TASK-[]<Shobhit> - [Start]<2019-05-21>
var mongoose = require('mongoose');

/** call Pages model */
var pages = mongoose.model('Pages');
var bookmarks = mongoose.model('Bookmarks');
var users = mongoose.model('User');
/** Express vaildator */
const { validationResult } = require('express-validator/check');

/**To get all Pages using user_id */
let getPages = async (req, res) => {
    var tpas = [];
    // let tpas = req.query.tpas.split(',')?req.query.tpas.split(',') : [];    // It was as per the first requirement
    //Commented code used for previous TPA data for sorting and ordering
    let stage = req.query.trimester ? req.query.trimester.split(',') : [];
    let risks = req.query.riskfactors ? req.query.riskfactors.split(',') : [];

    //tpa0 is pointing if no risk factor selected
    if (!risks.length) {
        risks.push('tpa0');
    }
    // for(let i= 0; i< risks.length; i++){
    //     console.log(risks[i]);
    // }

    //risks.forEach( async risk => {
    for (let i = 0; i < risks.length; i++) {
        var stageFieldExpr = 'meta.searchMatrix.' + risks[i] + '.' + stage[0];
        var query = {};
        query[stageFieldExpr] = { $exists: true };
        var sortExpr = {};
        sortExpr[stageFieldExpr] = 1;

        await pages.find(query).sort(sortExpr).select(['page_id', 'title', 'type']).then(async res => {
            var pagesWithBookmark = [];
            tpas.push(res);
        }).catch(err => {
            return res.status(200).send({ status: false, data: [], message: JSON.stringify(err) });
        });
    }
    // })
    setTimeout(() => {
        if (!tpas.length) {
            return res.status(200).send({ status: false, data: [], message: "Not found." });
        }
        //let pages = getUnique(Array.from(new Set(tpas)), 'page_id');
        res.status(200).send({ status: true, meta: { total: tpas.length }, data: tpas });
    }, 200);


    // pages.find({          // It was as per the first requirement
    //     $or: [
    //         { "page_id": { $in: tpas } },

    //         //Commented code used for previous TPA data for sorting and ordering

    //         // { "meta.level": { $in: [1, 2] } },
    //         // { "meta.classifiers.stage": { $in: stage } },
    //         // { "meta.classifiers.risk_factors.Prenatal": { $in: prenatal } },
    //         // { "meta.classifiers.risk_factors.Medical": { $in: medical } },
    //         // { "meta.classifiers.risk_factors.Vital": { $in: vital } },
    //         // { "meta.classifiers.risk_factors.History": { $in: history } },
    //     ]
    // })
    // pages.find().sort()
    // .select(['page_id', 'title'])
    // .then(pages => {
    //     if (pages.length) {
    //         let orderedPages = [];
    //         tpas.forEach(item => {
    //             orderedPages.push(pages.filter( page => item==page.page_id)[0]);
    //         });
    //         res.status(200).send({ status: true, result: { total: orderedPages.length, data: orderedPages }, message: 'success' });
    //     }
    //     res.status(200).send({ status: false, result: [], message: 'No records found.' });
    // })
    // .catch(err => {
    //     return res.status(200).send({ status: false, result: [], message: err });
    // });
};

// async function getAllPages(risks, stage){            // api as per the name
//     let tpas = [];
//     if(!risks.length){
//         risks.push('tpa0');
//     }
//     console.log(risks, stage)
//     risks.forEach( async risk => {
//         var stageFieldExpr = 'meta.searchMatrix.' + risk + '.' + stage[0];
//         var query = {};
//         query[stageFieldExpr] = { $exists: true };
//         var sortExpr = {};
//         sortExpr[stageFieldExpr] = 1;
//         pages.find(query).sort(sortExpr).select(['page_id', 'title']).then( pages => { 
//             pages.forEach(function(page) {
//                 tpas.push(page);
//             });
//         }).catch(err => {
//             return res.status(200).send({ status: false, data: [], message: err });
//         });
//     })
//     return tpas;
// }

//remove duplicate elements from the array object
function getUnique(arr, comp) {
    const unique = arr.map(e => e[comp])
        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)
        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);
    return unique;
}



/**get a pages with bookmark status */
let getPagesWithBookmarkStatus = async (req, res) => {
    if (req.query.page_ids) {
        let page_ids = req.query.page_ids ? req.query.page_ids.split(',') : [];
        var user_id = await getUserObjId(req.user_id);
        await pages.aggregate([
            {
                $lookup:
                {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "page_id",
                    as: "bookmark"
                }
            },
            { $project: { _id: 1, page_id: 1, bookmark: {
                $filter: {
                   input: "$bookmark",
                   as: "bm",
                   cond: { $eq: [ "$$bm.user_id", mongoose.Types.ObjectId(user_id) ] }
                }
             }, title: 1, type: 1 } },
            { $match: { page_id: { $in: page_ids } } }
        ]).then(page => {
            res.status(200).send({ status: true, meta: { total: page.length }, data: page });
        }).catch(err => {
            return res.status(200).send({ status: false, data: [], message: JSON.stringify(err) });
        });

    } else {
        return res.status(200).send({ status: false, result: [], message: "Not found." });
    }
};

async function getUserObjId(user_id) {
    return await users.findOne({ 'user_data.sAMAccountName': user_id }).then(user => {
        return user_id = user.id;
    });
};




/**get a single page */
let getPage = async (req, res) => {
    if (req.params.page_id) {
        pages.find({ page_id: req.params.page_id }).then(page => {
            if (page.length) {
                return res.status(200).send({ status: true, result: page[0], message: "success" });
            }
            return res.status(200).send({ status: false, result: [], message: "Not found." });

        }).catch(err => {
            return res.status(200).send({ status: false, result: [], message: err });
        });
    } else {
        return res.status(200).send({ status: false, result: [], message: "Not found." });
    }
};

/** Create a Page */
let createPage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).send({ status: false, result: [], 'message': errors.array() });
    }
    let pageData = {
        page_id: req.body.page_id,
        title: req.body.title,
        page_template: req.body.page_template,
        content: req.body.content,
        page_options: req.body.page_options,
        leaf_node: req.body.leaf_node,
        meta: req.body.meta
    };
    // res.send(pageData);
    pages.create(pageData).then(page => {
        res.status(200).send({ status: true, result: page, message: 'success' });
    }
    ).catch(err => {
        res.status(200).send({ status: false, result: [], message: err })
    });
};


module.exports = {
    getPage,
    getPages,
    createPage,
    getPagesWithBookmarkStatus
};
