module.exports = {

    authErrors: (error,res) => {
        let msg = 'Session Expired';

        if (error) {
            code = 401;
            if (error.msg) {
                msg = error.msg;
                code = 200;
            }
            res.status(code).send({ status: false, message: msg });
        }
        else {
            res.status(200).send({ status: false, message: 'An unexpected error occured' });
        }
    },

    result: (result, res) => {
        if (result != null) {
            res.status(200).send({ status: true, data: result, message: "Successfully loggedin." });
        }
        else {
            res.status(200).send({ status: false, message: 'The server successfully processed the request, but is not returning any content.' });
        }
    },

    error: (error, res) => {
        if (error) {
            if (error.msg) {
                msg = error.msg;
            }
            res.status(200).send({ status: false, message: msg });
        }
        else {
            res.status(200).send({ status: false, message: 'An unexpected error occured' });
        }
    }

}