//in api/workers/EmailWorker.js
/**
 * @description a worker to perform `email` job type
 * @type {Object} 
 */
var async = require('async');
module.exports = {
    //specify worker
    //job concurrency
    concurrency: 2,

    //perform sending email
    //job
    perform: function (job, context, done) {
        // var email = job.data.to;

        //send email

        //update sails model
        async
            .waterfall(
                [
                    function (next) {
                        //send email codes here
                        console.log("Test Worker Call");

                        next(null, {
                            sentAt: new Date(),
                            status: 'Ok'
                        });
                    },
                    function (deliveryStatus, next) {

                        next(null, {}, deliveryStatus);

                    },
                    function (user, deliveryStatus, next) {
                        next(null, user, deliveryStatus);
                    }
                ],
                function (error, user, deliveryStatus) {
                    if (error) {
                        done(error);
                    } else {
                        done(null, deliveryStatus);
                    }
                });
    }

};