//TASK-[]<Bishwajeet> - [Start]<2019-08-19>
var mongoose = require('mongoose');
var configs = mongoose.model('Configs');

let getAllConfigurations = async (req, res) => {
    configs.find({})
        .sort({ created_at: 'desc' })
        .then(configs => {
            if (configs.length) {
                return res.status(200).send({ status: true, result: configs, message: 'success' });
            }
            return res.status(200).send({ status: false, result: [], message: 'No records found.' });
        })
        .catch(err => {
            console.log(err);
            return res.status(200).send({ status: false, result: [], message: err });
        });
};

let addConfigurations = async (req, res) => {
    configs.create({
        key: req.body.key,
        value: req.body.value
    }).then(configs => {
        return res.status(200).send({ status: true, result: configs, message: 'success' });
    }
    ).catch(err => {
        console.log(err);
        return res.status(200).send({ status: false, result: [], message: err })
    });
};

module.exports = {
    getAllConfigurations,
    addConfigurations
};
