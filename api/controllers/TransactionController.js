/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllTransactions: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, search, t_type, start_date, end_date, user_id } = req.allParams();

        if (search) {
            let q = { deleted_at: null };
            if (t_type) {
                q['transaction_type'] = t_type
            }
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }
            q['or'] = [
                { source_address: { contains: search } },
                { destination_address: { contains: search } },
                { amount: search },
                { transaction_id: search }
            ]

            let userArray = await Users.find({ email: { 'contains': search } });

            let idArray = [];
            for (let index = 0; index < userArray.length; index++) {
                idArray.push(userArray[index].id);
            }
            q['or'].push({ user_id: idArray });
            let transactionData = await Transaction.find({
                ...q
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
                ...q
            });

            if (transactionData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Transaction list"),
                    "data": transactionData, transactionCount
                });
            }
        } else {
            let q = { deleted_at: null };
            if (user_id) {
                q['user_id'] = user_id
            }
            if (t_type) {
                q['transaction_type'] = t_type
            }
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }

            let transactionData = await Transaction.find({
                ...q
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

            let transactionCount = await Transaction.count({ ...q });

            if (transactionData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Transaction list"),
                    "data": transactionData, transactionCount
                });
            }
        }
    },

    getUserTransactions: async function (req, res) {
        let { page, limit, search, start_date, end_date, user_id, t_type } = req.allParams();

        if (search) {
            let q = { deleted_at: null, user_id };
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }
            if (t_type) {
                q['transaction_type'] = t_type
            }
            q['or'] = [
                { source_address: { contains: search } },
                { destination_address: { contains: search } },
            ]

            let userArray = await Users.find({ email: { 'contains': search } });

            let idArray = [];
            for (let index = 0; index < userArray.length; index++) {
                idArray.push(userArray[index].id);
            }
            q['or'].push({ user_id: idArray });
            let userTransactionData = await Transaction.find({
                ...q
            }).sort('id ASC').paginate(page, parseInt(limit));

            for (let index = 0; index < userTransactionData.length; index++) {
                if (userTransactionData[index].user_id) {
                    let user = await Users.findOne({ id: userTransactionData[index].user_id })
                    userTransactionData[index].email = user.email;
                }
            }

            for (let index = 0; index < userTransactionData.length; index++) {
                if (userTransactionData[index].coin_id) {
                    let user = await Coins.findOne({ id: transactionData[index].coin_id })
                    userTransactionData[index].coin_id = user.coin_code;
                }
            }

            let transactionCount = await Transaction.count({
                user_id: idArray,
                ...q
            });

            if (userTransactionData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Transaction list"),
                    "data": userTransactionData, transactionCount
                });
            }
        } else {
            let q = { deleted_at: null, user_id };
            if (t_type) {
                q['transaction_type'] = t_type
            }
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }

            let userTransactionData = await Transaction.find({
                ...q
            }).sort("id ASC").paginate(page, parseInt(limit));

            for (let index = 0; index < userTransactionData.length; index++) {
                if (userTransactionData[index].user_id) {
                    let user = await Users.findOne({ id: userTransactionData[index].user_id })
                    userTransactionData[index].email = user.email;
                }
            }

            for (let index = 0; index < userTransactionData.length; index++) {
                if (userTransactionData[index].coin_id) {
                    let user = await Coins.findOne({ id: userTransactionData[index].coin_id })
                    userTransactionData[index].coin_id = user.coin_code;
                }
            }

            let transactionCount = await Transaction.count({ ...q });
            console.log('>>>>>>>>>>>>>>>>>q', ...q)

            if (userTransactionData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Transaction list"),
                    "data": userTransactionData, transactionCount
                });
            }
        }
    },
};
