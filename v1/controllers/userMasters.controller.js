//TASK-[]<Bishwajeet> - [Start]<2019-05-21>

let ActiveDirectory = require('activedirectory');
let authentication = require('auth');
let uuidv4 = require('uuid/v4');
let moment = require('moment');
let crypto = require('crypto');
let response = require('../../responses/response');
var mongoose = require('mongoose');
let fs = require('fs');
let path = require("path");
const adldapFactory = require('adldap')();
var zlib = require('zlib');
var user = mongoose.model('User');
var loginAttempts = mongoose.model('loginAttempts');
const okta = require('@okta/okta-sdk-nodejs');
 
// var reasons = {
//     NOT_FOUND: 0,
//     PASSWORD_INCORRECT: 1,
//     MAX_ATTEMPTS: 2
// };


/**login with Okta */
let loginWithOkta = async (req, res) => {
    const client = new okta.Client({
        orgUrl: process.env.ORG_URL,
        token: process.env.TOKEN   
    });

    // const newUser = {
    //     profile: {
    //       firstName: 'Foo',
    //       lastName: 'Bar',
    //       email: 'ssingh@chenoainc.com',
    //       login: 'ssingh@chenoainc.com',
    //     },
    //     credentials: {
    //       password : {
    //         value: 'Welcome@123'
    //       }
    //     }
    //   };
    //   client.createUser(newUser)
    //   .then(user => {
    //     console.log('Created user', user);
    //   }).catch( err => {
    //       console.log(err);
    //   });
    client.getUser('foo@example.com').then( user => 
    {
        return res.status(200).json({ status: true, data: user, message: "Success" });

    }        
        ).catch(err => console.log(err));
    
};


// var authConfig = {
//     url: process.env.LDAP_URL,
//     baseDN: process.env.BASE_DN,
//     timeout: 10000,
//     reconnect: { initialDelay: 100, maxDelay: 500, failAfter: 5 }
// }
// var ad = new ActiveDirectory(authConfig);

// TASK-[Login Functionality]<Bishwajeet> - [Start]<2019-05-21>
// Login functionality using Active Directory authentication with auto logout functionality after 15 minutes


// let getLogin = async (req, res) => {
//     try {
//         let userName = req.body.userName;
//         let password = req.body.password;
//         var authConfig = {
//             url: process.env.LDAP_URL,
//             baseDN: process.env.BASE_DN,
//             username: userName,
//             password: password,
//             timeout: 1000,
//             reconnect: { initialDelay: 100, maxDelay: 500, failAfter: 5 }
//         }
//         var ad = new ActiveDirectory(authConfig);

//         ad.authenticate(userName, password, function (err, auth) {
//             if (err) {
//                 console.log('ERROR: ' + JSON.stringify(err));
//                 error = "";

//                 if (err.errno == "ECONNREFUSED" || err.errno == "ETIMEOUT") {
//                     error = { msg: "Not able to Connect AD.", isAuthenticate: false };
//                     return res.status(500).json(error);
//                 }
//                 else {
//                     error = { msg: "Invalid Username/Password.", isAuthenticate: false };
//                     return response.authErrors(error, res);
//                 }
//             }

//             if (auth) {
//                 ad.findUser(userName, async function (err, user) {
//                     if (err) {
//                         console.log('ERROR:' + JSON.stringify(err));
//                         return res.status(200).json({ status: false, message: err });
//                     }
//                     if (!user) {
//                         console.log('User:' + userName + ' not found.');
//                         return res.status(200).json({ status: false, message: 'User not found.' });
//                     }
//                     else {
//                         // console.log(JSON.stringify(user));

//                         /** create or update user if exists */
//                         var userModel = mongoose.model('User');
//                         let userRecord = updateUserExist(user);

//                         await userRecord.then(result => {
//                             if (!result) {
//                                 userModel.create({
//                                     user_data: user,
//                                 }).then(newRecord => {
//                                     console.log("User created.");
//                                 }).catch(err => {
//                                     res.status(200).json({ status: false, message: err })
//                                 });
//                             } else {
//                                 let userData = result.user_data;
//                                 if (userData.lockoutTime != '0') {
//                                     res.status(200).json({ status: false, message: "You account is locked from AD." });
//                                 }
//                             }
//                         });

//                         let token = await generateNewToken(user);

//                         let result = {
//                             'token': token,
//                             'userName': user.mail
//                         };
//                         return response.result(result, res);
//                     }
//                 });
//             }
//             else {
//                 return res.status(200).json({ msg: "Authentication failed!", isAuthenticate: false });
//             }
//         });
//     } catch (error) {
//         response.error(error, res);
//     }
// }

let doLogin = async (req, res) => {
    try {
        let userName = req.body.userName;
        let password = req.body.password;
        var valEmail = validateEmail(userName);
        if (valEmail) {
            var adldapUserName = userName;
        } else {
            adldapUserName = process.env.DOMAIN_NAME + "\\" + userName;
            var modifiedUserName = userName.charAt(0).toUpperCase() + userName.substr(1);
        }
        const client = adldapFactory({
            searchUser: adldapUserName,
            searchUserPass: password,
            ldapjs: {
                url: process.env.LDAP_URL,
                searchBase: process.env.BASE_DN,
                scope: 'sub',
            }
        })

        client.bind().then(() => {
            if (valEmail) {
                var options = { filter: '(mail=' + userName + ')', attributes: ['sAMAccountName', 'cn', 'dn', 'userPrincipalName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'sn', 'givenName', 'displayName'] }
            } else {
                var options = { filter: '(sAMAccountName=' + modifiedUserName + ')', attributes: ['sAMAccountName', 'cn', 'dn', 'userPrincipalName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'sn', 'givenName', 'displayName'] }
            }
            client.search(options).then(async (user) => {
                if (!user) {
                    console.log('User:' + userName + ' not found.');
                    return res.status(200).json({ status: false, message: 'User not found.' });
                }
                else {
                    let userRecord = await updateUserExist(user[0]);
                    let token = authentication.generateNewToken(user[0]);
                    console.log(token);
                    let result = {
                        'token': token,
                        'userName': user.mail
                    };
                    return response.result(result, res);
                }
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            let errorCode = err.message.substr(76, 4);
            error = "";
            if (err.errno == "ECONNREFUSED" || err.errno == "ETIMEOUT") {
                error = { msg: "Not able to Connect AD.", isAuthenticate: false };
                return res.status(500).json(error);

            } else if (errorCode == 775) {
                error = { msg: "Account is locked. Please try after some time.", isAuthenticate: false };
                return response.authErrors(error, res);

            } else {
                error = { msg: "Invalid Username/Password.", isAuthenticate: false };
                return response.authErrors(error, res);
            }
        });
    } catch (error) {
        response.error(error, res);
    }
}

let validateEmail = (data, res) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(data);
}

// let doLogin = async (req, res) => {
//     try {
//         let userName = req.body.userName;
//         let password = req.body.password;
//         const client = adldapFactory({
//             searchUser: userName,
//             searchUserPass: password,
//             ldapjs: {
//                 url: process.env.LDAP_URL,
//                 searchBase: process.env.BASE_DN,
//                 scope: 'sub',
//             }
//         })

//         client.bind().then(async (data) => {
//             const options = { filter: '(mail=' + userName + ')', attributes: ['sAMAccountName', 'cn', 'dn', 'userPrincipalName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'sn', 'givenName', 'displayName'] }
//             client.search(options).then(async (user) => {
//                 if (!user) {
//                     console.log('User:' + userName + ' not found.');
//                     return res.status(200).json({ status: false, message: 'User not found.' });
//                 }
//                 else {
//                     let userRecord = await updateUserExist(user[0]);

//                     user_id = getUserObjId(userRecord.user_data.userPrincipalName);
//                     user_id = await user_id;

//                     loginAttemptData = getLoginAttemptData(user_id);
//                     loginAttemptData = await loginAttemptData;
//                     console.log(loginAttemptData);

//                     if (!loginAttemptData) {
//                         let updateLoginAttemptsData = updateLoginAttemptsOfUser(user_id);
//                         updateLoginAttemptsData = await updateLoginAttemptsData;
//                         let token = await generateNewToken(user[0]);
//                         let result = {
//                             'token': token,
//                             'userName': user.mail
//                         };
//                         return response.result(result, res);
//                     }

//                     if (loginAttemptData && loginAttemptData.lockUntil < Date.now()) {
//                         let updateLoginAttemptsData = updateLoginAttemptsOfUser(user_id);
//                         updateLoginAttemptsData = await updateLoginAttemptsData;
//                         let token = await generateNewToken(user[0]);
//                         let result = {
//                             'token': token,
//                             'userName': user.mail
//                         };
//                         return response.result(result, res);
//                     }

//                     if (loginAttemptData) {
//                         // just increment login attempts if account is already locked
//                         if (loginAttemptData.lockUntil && loginAttemptData.lockUntil > Date.now()) {
//                             incLoginAttemptsData = incLoginAttempts(user_id);
//                             incLoginAttemptsData = await incLoginAttemptsData;
//                             return res.status(200).json({ status: false, message: 'Account is locked. Please try after some time.' });
//                         }
//                     }
//                 }
//             }).catch((err) => {
//                 console.log(err);
//             });
//         }).catch(async (err) => {
//             console.log(err);
//             console.log(err.message.substr(76,4));
//             let errorCode = err.message.substr(76,4);
//             var userPrincipalName = userName.charAt(0).toUpperCase() + userName.substr(1);
//             user_id = getUserObjId(userPrincipalName);
//             user_id = await user_id;

//             incLoginAttemptsData = incLoginAttempts(user_id);
//             incLoginAttemptsData = await incLoginAttemptsData;

//             error = "";
//             if (err.errno == "ECONNREFUSED" || err.errno == "ETIMEOUT") {
//                 error = { msg: "Not able to Connect AD.", isAuthenticate: false };
//                 return res.status(500).json(error);

//             } else if (errorCode == 775) {
//                 error = { msg: "Account is locked. Please try after some time.", isAuthenticate: false };
//                 return response.authErrors(error, res);

//             } else {
//                 error = { msg: "Invalid Username/Password.", isAuthenticate: false };
//                 return response.authErrors(error, res);
//             }
//         });
//     } catch (error) {
//         response.error(error, res);
//     }
// }

/** Update user data if user already exists in database */
let updateUserExist = async (user, res) => {
    var userModel = mongoose.model('User');
    let now = new Date();
    return userModel.findOneAndUpdate({ "user_data.userPrincipalName": user.userPrincipalName }, { $set: { user_data: user, last_login: now } }, {
        upsert: true,
        returnNewDocument: true,
        new: true,
    });
}

let enableValue = async (req, res) => {
    var userModel = mongoose.model('User');
    let token = authentication.verify(req.headers['token']);
    userName = token.userData.mail;
    await userModel.findOneAndUpdate({ "user_data.mail": userName }, { $set: { enable_value: req.body.enable_value } }, {
        upsert: true
    });
    return res.status(200).json({ message: 'Settings updated.' });
}

let getValueSetting = async (req, res) => {
    var userModel = mongoose.model('User');
    let token = authentication.verify(req.headers['token']);
    userName = token.userData.mail;
    let user = await userModel.findOne({ "user_data.mail": userName }).select('_id enable_value');
    return res.status(200).json({ result: user });
}



let generateNewToken = async (user, res) => {
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
    console.log('authent', authentication)
    return authentication.sign(sortedResult);
}

let createHash = async (data, res) => {
    let salt = process.env.SALT_VALUE;
    let iterations = 4;
    return await crypto.pbkdf2(JSON.stringify(data), salt, iterations, 1, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        return derivedKey.toString('hex');
    });
}

// let ldapSearch = async (userName, password) => {
//     const options = { filter: '(mail=' + userName + ')', attributes: ['sAMAccountName', 'cn', 'dn', 'userPrincipalName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'sn', 'givenName', 'displayName'] }
//     const client = adldapFactory({
//         searchUser: userName,
//         searchUserPass: password,
//         ldapjs: {
//             url: process.env.LDAP_URL,
//             searchBase: process.env.BASE_DN,
//             scope: 'sub',
//         }
//     });

//     return new Promise((resolve, reject) => {
//         client.bind().then(() => {
//             client.search(options).then((user) => {
//                 resolve(user);
//             }).catch((err) => {
//                 return reject(err);
//             });
//         }).catch((err) => {
//             error = "";
//             if (err.errno == "ECONNREFUSED" || err.errno == "ETIMEOUT") {
//                 error = { msg: "Not able to Connect AD.", isAuthenticate: false };
//                 reject(error);
//             }
//             else {
//                 error = { msg: "Invalid Username/Password.", isAuthenticate: false };
//                 reject(error);
//             }
//         });
//     });
// }


// TASK-[refresh token]<Bishwajeet> - [Start]<2019-05-22>
// To generate a new token

let refreshToken = async (req, res) => {
    try {
        let payload = authentication.verify(req.headers['token']);
        var userModel = mongoose.model('User');
        userModel.findOne({ 'user_data.sAMAccountName': payload.userData.sAMAccountName }).then(async u => {
            let token = authentication.generateNewToken(u);
            let result = {
                'token': token,
                'userName': u.user_data.mail
            };
            return res.status(200).json({ status: true, data: result, message: "Token refreshed." });
        }).catch(err => {
            return res.json({
                status: false,
                message: err.message
            });
        });
    } catch (error) {
        response.error(error, res);
    }
}

// TASK-[refresh token]<Bishwajeet> - [End]<2019-05-22>

/** generate a new token for a user */
// let generateNewToken = async (user, res) => {
//     let userIdObj = {
//         'givenName': user.givenName,
//         'sn': user.sn,
//         'mail': user.mail,
//         'sAMAccountName': user.sAMAccountName
//     };
//     let salt = process.env.SALT_VALUE;
//     let iterations = 1000;
//     let userId = crypto.pbkdf2Sync(JSON.stringify(userIdObj), salt, iterations, 64, `sha512`).toString(`hex`);

//     let uuid = uuidv4();
//     let today = new Date();
//     let newDateObj = moment(today).add(15, 'm').toDate();
//     let expiryDate = newDateObj.valueOf();
//     let userData = {};
//     userData = {
//         sAMAccountName: user.sAMAccountName,
//     };
//     let issuedAt = new Date().valueOf();
//     let checksumObj = {
//         'uuid': uuid,
//         'expiryDate': expiryDate,
//         'userData': userData,
//         'issuedAt': issuedAt
//     };
//     let checksum = crypto.pbkdf2Sync(JSON.stringify(checksumObj), salt, iterations, 64, `sha512`).toString(`hex`);    // hashing with 1000 iterations, 64 length and sha512 digest
//     let sortedResult = [{
//         'uuid': uuid,
//         'expiryDate': expiryDate,
//         'userData': userData,
//         'issuedAt': issuedAt,
//         'checksum': checksum
//     }];
//     return authentication.sign(sortedResult);
// }

// TASK-[Login Functionality]<Bishwajeet> - [End]<2019-05-21>


// TASK-[Fake APIs]<Bishwajeet> - [Start]<2019-05-21>
// Fake API to check the functionality of jwt expiration

// let getUser = async (req, res) => {      // Get user api as per the npm package ACTIVE DIRECTORY
//     try {
//         if (req.headers['token'] != '') {
//             let token = authentication.verify(req.headers['token']);

//             var authConfig = {
//                 url: process.env.LDAP_URL,
//                 baseDN: process.env.BASE_DN,
//                 username: process.env.USERNAME,
//                 password: process.env.PASSWORD,
//                 timeout: 10000,
//                 reconnect: { initialDelay: 100, maxDelay: 500, failAfter: 5 }
//             }

//             var ad = new ActiveDirectory(authConfig);
//             ad.findUser(token.userData.sAMAccountName, async function (err, user) {
//                 if (err) {
//                     console.log('ERROR:' + JSON.stringify(err));
//                     return res.status(200).json({ status: false, message: err });
//                 }
//                 if (!user) {
//                     console.log('User:' + userName + ' not found.');
//                     return res.status(200).json({ status: false, message: 'User not found.' });
//                 }
//                 else {
//                     if (user.userAccountControl & 66048) {
//                         var userModel = mongoose.model('User');
//                         userModel.findOne({ 'user_data.sAMAccountName': user.sAMAccountName }).then(async u => {
//                             if (u && u.last_login > new Date(user.pwdLastSet / 1e4 - 1.16444736e13)) {
//                                 let newToken = await generateNewToken(user)
//                                 return res.json({
//                                     status: true,
//                                     token: newToken,
//                                     message: "User verified"
//                                 });
//                             }
//                             return res.json({
//                                 status: false,
//                                 message: "Your password has been changed on AD."
//                             });
//                         }).catch(err => {
//                             return res.json({
//                                 status: false,
//                                 message: err.message
//                             });
//                         });
//                     } else {
//                         error = { msg: "Your ldap account credentials has been changed. Please contact your admin", isAuthenticate: false };
//                         return response.authErrors(error, res);
//                     }
//                     // else if (user.userAccountControl == 8388608) {
//                     //     error = { msg: "Your password has some issue from AD.", isAuthenticate: false };
//                     //     return response.authErrors(error, res);
//                     // } else if (user.userAccountControl == 16) {
//                     //     error = { msg: "The account is currently locked on AD .", isAuthenticate: false };
//                     //     return response.authErrors(error, res);
//                     // } else if (user.userAccountControl == 2) {
//                     //     error = { msg: "Your account has been disabled on AD.", isAuthenticate: false };
//                     //     return response.authErrors(error, res);
//                     // }
//                 }
//             });
//         } else {
//             return res.status(200).json({ status: false, message: 'Token not exists.' });
//         }
//     } catch (error) {
//         return res.status(200).json({ status: false, message: error });
//     }
// }

let getUser = async (req, res) => {
    try {
        if (req.headers['token'] != '') {

            let token = authentication.verify(req.headers['token']);
            userName = token.userData.mail;

            const client = adldapFactory({
                searchUser: process.env.USERNAME,
                searchUserPass: process.env.PASSWORD,
                ldapjs: {
                    url: process.env.LDAP_URL,
                    searchBase: process.env.BASE_DN,
                    scope: 'sub',
                }
            })

            client.bind().then(() => {
                const options = { filter: '(mail=' + userName + ')', attributes: ['sAMAccountName', 'cn', 'dn', 'userPrincipalName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'sn', 'givenName', 'displayName'] }
                client.search(options).then(async (user) => {
                    // if (err) {
                    //     console.log('ERROR:' + JSON.stringify(err));
                    //     return res.status(200).json({ status: false, message: err });
                    // }

                    console.log("User", user);

                    if (!user) {
                        console.log('User:' + userName + ' not found.');
                        return res.status(200).json({ status: false, message: 'User not found.' });
                    }
                    else {
                        if (user[0].userAccountControl & 66048) {
                            var userModel = mongoose.model('User');
                            userModel.findOne({ 'user_data.sAMAccountName': user[0].sAMAccountName }).then(async u => {
                                if (u && u.last_login > new Date(user[0].pwdLastSet / 1e4 - 1.16444736e13)) {
                                    let newToken = authentication.generateNewToken(user[0])
                                    return res.json({
                                        status: true,
                                        token: newToken,
                                        message: "User verified"
                                    });
                                }
                                return res.json({
                                    status: false,
                                    message: "Your password has been changed on AD."
                                });
                            }).catch(err => {
                                return res.json({
                                    status: false,
                                    message: err.message
                                });
                            });
                        } else {
                            error = { msg: "Your ldap account credentials has been changed. Please contact your admin", isAuthenticate: false };
                            return response.authErrors(error, res);
                        }
                        // else if (user.userAccountControl == 8388608) {
                        //     error = { msg: "Your password has some issue from AD.", isAuthenticate: false };
                        //     return response.authErrors(error, res);
                        // } else if (user.userAccountControl == 16) {
                        //     error = { msg: "The account is currently locked on AD .", isAuthenticate: false };
                        //     return response.authErrors(error, res);
                        // } else if (user.userAccountControl == 2) {
                        //     error = { msg: "Your account has been disabled on AD.", isAuthenticate: false };
                        //     return response.authErrors(error, res);
                        // }
                    }
                });
            }).catch((err) => {
                error = "";
                console.log(err);
                if (err.errno == "ECONNREFUSED" || err.errno == "ETIMEOUT") {
                    error = { msg: "Not able to Connect AD.", isAuthenticate: false };
                    return res.status(500).json(error);
                }
                else {
                    error = { msg: "Invalid Username/Password.", isAuthenticate: false };
                    return response.authErrors(error, res);
                }
            });
        } else {
            // return res.status(200).json({ status: false, message: 'Token not exists.' });
            return res.status(200).json({ status: false, message: 'Session Expired.' });
        }
    } catch (error) {
        return res.status(200).json({ status: false, message: error });
    }
}

let getProduct = async (req, res) => {
    try {
        if (req.headers['token'] != '') {
            let token = authentication.verify(authentication.decrypter(req.headers['token']));
            return res.json({
                msg: "Not Working"
            });
        } else {
            console.log('Error');
        }
    } catch (error) {
        response.error(error, res);
    }
}

let getPDF = async (req, res) => {
    if (req.params.pdf_id) {
        var fileName = req.params.pdf_id + ".pdf";
        var coolpath = path.join(__dirname, '..', '..', 'public', 'pdfs', fileName);
        // let status = fs.existsSync(coolpath);
        // if (status) {
        //     var readStream = fs.createReadStream(coolpath);
        //     readStream.pipe(res);
        // } else {
        //     res.send('Not Found');
        // }
        fs.access(coolpath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log(err);
                return res.status(200).send({ status: false, result: [], message: "Not found." });
            } else {
                var readStream = fs.createReadStream(coolpath);
                readStream.pipe(res);
            }
        });
    } else {
        return res.status(200).send({ status: false, result: [], message: "Not found." });
    }
}

// let getSVG = async (req, res) => {
//     if (req.params.svg_id) {
//         var fileName = req.params.svg_id + ".svg";
//         var coolpath = path.join(__dirname, '..', '..', 'public', 'svgs', fileName);
//         fs.access(coolpath, fs.constants.F_OK, (err) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(200).send({ status: false, result: [], message: "Not found." });
//             } else {
//                 var readStream = fs.createReadStream(coolpath);
//                 res.writeHead(200, { 'content-encoding': 'gzip' });
//                 readStream.pipe(zlib.createGzip()).pipe(res);
//             }
//         });
//     } else {
//         return res.status(200).send({ status: false, result: [], message: "Not found." });
//     }
// }

let getImages = async (req, res) => {
    if (req.params.img_id) {
        var fileName = req.params.img_id + ".png";
        var coolpath = path.join(__dirname, '..', '..', 'public', 'images', fileName);
        fs.access(coolpath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log(err);
                return res.status(200).send({ status: false, result: [], message: "Not found." });
            } else {
                var readStream = fs.createReadStream(coolpath);
                res.writeHead(200, { 'content-encoding': 'gzip' });
                readStream.pipe(zlib.createGzip()).pipe(res);
            }
        });
    } else {
        return res.status(200).send({ status: false, result: [], message: "Not found." });
    }
}

// TASK-[Fake APIs]<Bishwajeet> - [End]<2019-05-21>



// TASK-[LOGIN ATTEMPTS]<Bishwajeet> - [START]<2019-08-26> -  Don't delete this code

// let updateLoginAttemptsOfUser = async (data, res) => {
//     return await loginAttempts.findOneAndUpdate({ "user_id": data }, {
//         $set: { user_id: data, loginAttempts: 0, lockUntil: 0 }
//     }, {
//             upsert: true,
//             returnNewDocument: true,
//             new: true,
//         }).catch(err => {
//             console.log(err);
//             return res.status(200).send({ status: false, result: [], 'message': err });
//         });
// }

// let getLoginAttemptData = async (id, res) => {
//     return await loginAttempts.findOne({ "user_id": id }).then(data => {
//         return loginAttemptData = data;
//     });
// }

// let incLoginAttempts = async (user_id, res) => {
//     loginAttempts.findOne({ "user_id": user_id }).then(data => {

//         // if we have a previous lock that has expired, restart at 1
//         if (data.lockUntil && data.lockUntil < Date.now()) {
//             return loginAttempts.findOneAndUpdate(user_id, {
//                 $set: { loginAttempts: 1, lockUntil: 0 }
//             },
//                 { new: true });
//         }

//         // otherwise we're incrementing
//         var updates = { $inc: { loginAttempts: 1 } };

//         // lock the account if we've reached max attempts and it's not locked already
//         if (data.loginAttempts + 1 >= process.env.MAX_LOGIN_ATTEMPTS && data.lockUntil < Date.now()) {
//             updates.$set = { lockUntil: Date.now() + Number(process.env.LOCK_TIME) };
//         }

//         return loginAttempts.findOneAndUpdate(user_id, updates, {
//             upsert: true,
//             returnNewDocument: true,
//             new: true,
//         }).catch(err => {
//             console.log(err);
//             return res.status(200).send({ status: false, result: [], 'message': err });
//         });
//     }).catch(err => {
//         return res.status(200).send({ status: false, result: [], 'message': err });
//     });
// }

// async function getUserObjId(data, res) {
//     return await user.findOne({ "user_data.userPrincipalName": data }).then(user => {
//         return user_id = user.id;
//     });
// };

// TASK-[LOGIN ATTEMPTS]<Bishwajeet> - [END]<2019-08-26> - Don't delete this code

// let generateNewToken = async (user, res) => {
//     let uuid = uuidv4();
//     let today = new Date();
//     let newDateObj = moment(today).add(15, 'm').toDate();
//     let expiryDate = newDateObj.valueOf();
//     let userData = {};
//     userData = {
//         sAMAccountName: user.sAMAccountName,
//         mail: user.mail,
//         sn: user.sn,
//         givenName: user.givenName
//     };
//     let issuedAt = new Date().valueOf();
//     let checksumObj = {
//         'uuid': uuid,
//         'expiryDate': expiryDate,
//         'userData': userData,
//         'issuedAt': issuedAt
//     };
//     let checksum = createHash(checksumObj);
//     let sortedResult = [{
//         'uuid': uuid,
//         'expiryDate': expiryDate,
//         'userData': userData,
//         'issuedAt': issuedAt,
//         'checksum': checksum
//     }];
//     return authentication.sign(sortedResult);
// }




module.exports = {
    doLogin,
    getUser,
    getProduct,
    refreshToken,
    getPDF,
    // getSVG,
    getImages,
    enableValue,
    getValueSetting,
    loginWithOkta
};

// TASK-[]<Bishwajeet> - []<2019-05-21>