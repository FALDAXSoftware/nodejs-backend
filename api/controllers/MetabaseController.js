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
                    "message": sails.__("Account Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Account Tier Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Referral Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Assets Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Batch Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Careers Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Country Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Employee Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Fees Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("History Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Dashboard Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("KYC Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("News Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Offers Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Pairs Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Roles Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Transaction History Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Two Factor Request Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Users Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                    "message": sails.__("Withdraw Request Report Success"),
                    frameURL
                })
        } catch (error) {
            console.log(error);
            await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },
};
