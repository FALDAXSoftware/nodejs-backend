/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = async function (req, res, next) {

    var token;

    try {
        console.log('RWEQ LOG??????????????????????????', req);
        if (req.headers && req.headers.authorization) {
            var parts = req.headers.authorization.split(' ');
            if (parts.length == 2) {
                var scheme = parts[0],
                    credentials = parts[1];

                if (/^Bearer$/i.test(scheme)) {
                    token = credentials;
                }
            } else {
                return res.status(403).json({ status: 403, err: 'Invalid Authorization token' });
            }
        } else if (req.param('token')) {
            token = req.param('token');
            // We delete the token from param to not mess with blueprints
            delete req.query.token;
        } else if (req.isSocket) {
            console.log("Socket connected");
            if (req.socket.handshake.headers.authorization) {
                var parts = req.socket.handshake.headers.authorization.split(' ');
                if (parts.length == 2) {
                    var scheme = parts[0],
                        credentials = parts[1];

                    if (/^Bearer$/i.test(scheme)) {
                        token = credentials;
                    }
                } else {
                    return res.status(403).json({ status: 403, err: 'Invalid Authorization token' });
                }
            } else {
                return res.status(401).json({ status: 401, err: 'No Authorization header was found' });
            }
        }
        else {
            return res.status(401).json({ status: 401, err: 'No Authorization header was found' });
        }

        var verifyData = await sails.helpers.jwtVerify(token);
        if (verifyData) {
            req.user = verifyData;
            next();
        }
    } catch (error) {
        return res.status(403).json({ status: 403, err: 'Unauthorized Access' });
    }
};
