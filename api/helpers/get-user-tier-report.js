var moment = require('moment');
module.exports = {

    friendlyName: 'Get User Tier Report',

    description: '',

    inputs: {
        user_id: {
            type: 'string',
            example: "2",
            description: 'ID of user',
            required: true
        },
        body: {
            type: 'json',
            example: "{}",
            description: "Body JSON object",
            required: true
        }
    },

    exits: {
        success: {
            outputFriendlyName: 'New address'
        }
    },

    fn: async function (inputs, exits) {
        var user_id = inputs.user_id
        var body = inputs.body;
        var userData = await Users.findOne({
            where: {
                deleted_at: null,
                is_active: true,
                id: user_id
            }
        });

        // if (parseInt(body.tier_requested) != (parseInt(userData.account_tier) + 1)) {
        //     // console.log()
        //     // Tier Upgrade not applicable
        //     return exits.success(1)
        // }

        // Get Tier Requirement Set
        var getTierData = await Tiers.findOne({
            where: {
                deleted_at: null,
                tier_step: body.tier_requested
            }
        });

        /* Check for First Requiremnt fulfillment */
        let today = moment();
        let requirementSetFirst = getTierData.minimum_activity_thresold;

        const summaryReport = {};
        const summaryReport_Req1 = {};
        const summaryReport_Req2 = {};

        /* Check for Requirement Set 1 */
        let previousTierUpgradedOn = (userData);
        let eligibleUpgrateAge = moment(previousTierUpgradedOn.account_verified_at).add(parseInt(requirementSetFirst.Account_Age), 'days');
        let getTradeCount = await sails.helpers.tradding.trade.getUserTradeDetails(userData, true);
        let getTotalTradeInFiat = await sails.helpers.tradding.trade.getUserTradeDetails(userData, false);
        console.log("getTotalTradeInFiat", getTotalTradeInFiat)
        let req1_ageCheck = false;
        let req1_tradeCountCheck = false;
        let req1_tradeTotalFiatCheck = false;

        if (today >= eligibleUpgrateAge) { // check for age
            req1_ageCheck = true;
        }
        let ageRemaining = eligibleUpgrateAge.diff(today, 'days') // Remaining Age
        ageRemaining = today.diff(moment(previousTierUpgradedOn.account_verified_at), 'days')
        console.log("ageRemaining", ageRemaining)
        // if (ageRemaining > 0) {
        summaryReport_Req1.ageRemaining = ageRemaining;
        // } else {
        //     summaryReport_Req1.ageRemaining = Math.abs(ageRemaining)
        // }

        if (getTradeCount >= parseInt(requirementSetFirst.Minimum_Total_Transactions)) {
            req1_tradeCountCheck = true;
        }

        let tradeCountRemaining = parseInt(requirementSetFirst.Minimum_Total_Transactions) - getTradeCount;
        // if (tradeCountRemaining > 0) {
        summaryReport_Req1.tradeCountRemaining = getTradeCount;
        // } else {
        //     summaryReport_Req1.tradeCountRemaining = getTradeCount
        // }

        if ((getTotalTradeInFiat.length > 0 && getTotalTradeInFiat[0].total_amount) >= parseInt(requirementSetFirst.Minimum_Total_Value_of_All_Transactions)) {
            req1_tradeTotalFiatCheck = true;
        }
        let tradeTotalFiatRemaining = parseInt(requirementSetFirst.Minimum_Total_Value_of_All_Transactions) - (getTotalTradeInFiat[0].total_amount);
        // if (tradeTotalFiatRemaining > 0) {
        summaryReport_Req1.tradeTotalFiatRemaining = getTotalTradeInFiat[0].total_amount;
        // } else {
        //     summaryReport_Req1.tradeTotalFiatRemaining = getTotalTradeInFiat[0].total_amount;
        // }

        let requirementSetSecond = (getTierData.requirements_two);
        let getTotalWalletInFiat = await sails.helpers.wallet.getTradeUserWalletBalance(user_id);
        console.log("getTotalWalletInFiat", getTotalWalletInFiat)
        let req2_tradeWalletCheck = false;
        if ((getTotalWalletInFiat.length > 0 && getTotalWalletInFiat[0].total_balance_fiat) >= parseInt(requirementSetSecond.Total_Wallet_Balance)) {
            req2_tradeWalletCheck = true;
        }

        let userWalletFiatRemaining = parseInt(requirementSetSecond.Total_Wallet_Balance) - (getTotalWalletInFiat[0].total_balance_fiat);
        // if (userWalletFiatRemaining > 0) {
        summaryReport_Req2.userWalletFiatRemaining = getTotalWalletInFiat[0].total_balance_fiat;
        // } else {
        //     summaryReport_Req2.userWalletFiatRemaining = getTotalWalletInFiat[0].total_balance_fiat
        // }

        summaryReport["requirement_1"] = summaryReport_Req1;
        summaryReport["requirement_2"] = summaryReport_Req2;
        summaryReport.req2_tradeWalletCheck = req2_tradeWalletCheck;
        summaryReport.req1_ageCheck = req1_ageCheck;
        summaryReport.req1_tradeCountCheck = req1_tradeCountCheck;
        summaryReport.req1_tradeTotalFiatCheck = req1_tradeTotalFiatCheck
        var data = {
            summaryReport,
            getTierData
        }
        console.log(summaryReport);

        return exits.success(data)
        /* If any requirement fulfills, then allow to upgrade */
    }

};