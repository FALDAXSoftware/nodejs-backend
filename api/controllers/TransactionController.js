/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllTransactions: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();

        if (data) {
            let userArray = await Users.find({ email: { 'contains': data } });

            let idArray = [];
            for (let index = 0; index < userArray.length; index++) {
                idArray.push(userArray[index].id);
            }

            let transactionData = await Transaction.find({
                user_id: idArray
            }).sort('id ASC').paginate(page, parseInt(limit));

            for (let index = 0; index < transactionData.length; index++) {
                if (transactionData[index].user_id) {
                    let user = await Users.findOne({ id: transactionData[index].user_id })
                    transactionData[index].email = user.email;
                }
            }

            for (let index = 0; index < transactionData.length; index++) {
                if (transactionData[index].coin_id) {
                    let user = await Coins.findOne({ id: transactionData[index].coin_id })
                    transactionData[index].coin_id = user.coin_code;
                }
            }

            let transactionCount = await Transaction.count({
                user_id: idArray,
            });
            if (transactionData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Transaction list"),
                    "data": transactionData, transactionCount
                });
            }
        } else {
            let transactionData = await Transaction.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            for (let index = 0; index < transactionData.length; index++) {
                if (transactionData[index].user_id) {
                    let user = await Users.findOne({ id: transactionData[index].user_id })
                    transactionData[index].email = user.email;
                }
            }

            for (let index = 0; index < transactionData.length; index++) {
                if (transactionData[index].coin_id) {
                    let user = await Coins.findOne({ id: transactionData[index].coin_id })
                    transactionData[index].coin_id = user.coin_code;
                }
            }

            let transactionCount = await Transaction.count();

            if (transactionData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Transaction list"),
                    "data": transactionData, transactionCount
                });
            }
        }
    },
};
