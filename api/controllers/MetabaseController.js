/**
 * MetabaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger");

module.exports = {

    // Account Class Management
    getAccountClassReport: async function (req, res) {
        try {
            var dashboardValue = 18;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Account Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Account Tier Report
    getAccountTierReport: async function (req, res) {
        try {
            var dashboardValue = 35;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Account Tier Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Referral Report
    getReferralReport: async function (req, res) {
        try {
            var dashboardValue = 17;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Referral Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Assets Report
    getAssetsReport: async function (req, res) {
        try {
            var dashboardValue = 5;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Assets Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Batch And Balance Report
    getBatchBalanceReport: async function (req, res) {
        try {
            var dashboardValue = 34;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Batch Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Careers Report
    getCareerReport: async function (req, res) {
        try {
            var dashboardValue = 13;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Careers Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Country Report
    getCountryReport: async function (req, res) {
        try {
            var dashboardValue = 7;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Country Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Employee Report
    getEmployeeReport: async function (req, res) {
        try {
            var dashboardValue = 9;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Employee Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Fees Report
    getFeesReport: async function (req, res) {
        try {
            var dashboardValue = 15;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Fees Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // History Report
    getHistoryReport: async function (req, res) {
        try {
            var dashboardValue = 33;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("History Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Dashboard Report
    getDashboardReport: async function (req, res) {
        try {
            var dashboardValue = 4;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Dashboard Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // KYC Report
    getKYCReport: async function (req, res) {
        try {
            var dashboardValue = 14;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("KYC Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // News Report
    getNewsReport: async function (req, res) {
        try {
            var dashboardValue = 16;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("News Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Offers Report
    getOffersReport: async function (req, res) {
        try {
            var dashboardValue = 36;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Offers Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Pairs Report
    getPairsReport: async function (req, res) {
        try {
            var dashboardValue = 6;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Pairs Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Roles Report
    getRolesReport: async function (req, res) {
        try {
            var dashboardValue = 8;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Roles Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Transaction History Report
    getTransactionHistoryReport: async function (req, res) {
        try {
            var dashboardValue = 10;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Transaction History Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Two Factor Request History Report
    getTwoFactorRequestReport: async function (req, res) {
        try {
            var dashboardValue = 19;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Two Factor Request Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Users History Report
    getUsersReport: async function (req, res) {
        try {
            var dashboardValue = 1;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Users Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },

    // Withdraw Request History Report
    getWithdrawRequestReport: async function (req, res) {
        try {
            var dashboardValue = 12;

            var frameURL = await sails.helpers.metabaseSetup(dashboardValue)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Withdraw Request Report Success").message,
                    frameURL
                })
        } catch (error) {
            // console.log(error);
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                });
        }
    },
};
