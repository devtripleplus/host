//TASK-[]<Bishwajeet> - [Start]<2019-05-21>

let jwt = require('jsonwebtoken');
let CryptoJS = require('crypto-js');
let response = require('./responses/response');
let uuidv4 = require('uuid/v4');
let moment = require('moment');
let crypto = require('crypto');
// let userMasters = require('./v1/controllers/userMasters.controller');

sign = (data) => {
    let signedJWT = jwt.sign(data[0], process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRATION_DURATION });
    return signedJWT;
}

createHash = async (data, res) => {
    let salt = process.env.SALT_VALUE;
    let iterations = 4;
    return await crypto.pbkdf2(JSON.stringify(data), salt, iterations, 1, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        return derivedKey.toString('hex');
    });
}

generateNewToken = (user) => {
    let uuid = uuidv4();
    let today = new Date();
    let newDateObj = moment(today).add(15, 'm').toDate();
    let expiryDate = newDateObj.valueOf();
    let userData = {};
    userData = {
        sAMAccountName: user.sAMAccountName,
        mail: user.mail,
        sn: user.sn,
        givenName: user.givenName
    };
    let issuedAt = new Date().valueOf();
    let checksumObj = {
        'uuid': uuid,
        'expiryDate': expiryDate,
        'userData': userData,
        'issuedAt': issuedAt
    };
    let checksum = createHash(checksumObj);
    let sortedResult = [{
        'uuid': uuid,
        'expiryDate': expiryDate,
        'userData': userData,
        'issuedAt': issuedAt,
        'checksum': checksum
    }];
    return sign(sortedResult);
}

module.exports = {
    authorize: async (req, res, next) => {
        try {
            var token = req.headers['token'].toString();
            jwt.verify(token, process.env.SECRET_KEY, async (err, jwtResult) => {
                if (!err) {
                    req.user_id = jwtResult.userData.sAMAccountName;
                    next();
                }
                else {
                    let decoded = jwt.decode(token);
                    let newToken = generateNewToken(decoded.userData);
                    let msg = "Token renewed";
                    res.status(401).send({ status: false, message: msg, token: newToken });
                }
            });

            // if (issuedAt < new Date() && expiryDate > new Date()) {
            //     next();
            // } else if (issuedAt < new Date() && expiryDate < new Date()) {
            //     let token = await userMasters.refreshToken();
            //     res.status(200).send({
            //         token: token
            //     });
            // } else if (issuedAt < new Date()) {
            //     res.status(401).send({
            //         message: 'Access token isn’t provided or is invalid'
            //     });
            // }
        }
        catch (error) {
            response.authErrors(error, res);
        }

    },
    
    sign,
    generateNewToken,

    verify: (token) => {
        let verifiedJWT = jwt.verify(token, process.env.SECRET_KEY);
        return verifiedJWT;
    },

    encrypter: (plainText) => {
        return CryptoJS.AES.encrypt((plainText).toString(), process.env.CRYPTO_SECRET_KEY).toString();
    },

    decrypter: (encryptedText) => {
        return CryptoJS.AES.decrypt((encryptedText).toString(), process.env.CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8);
    }
}

//TASK-[]<Bishwajeet> - [Start]<2019-05-21>