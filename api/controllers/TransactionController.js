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
        let { page, limit, data, t_type, start_date, end_date, user_id, sort_col, sort_order } = req.allParams();

        let query = " from wallet_history LEFT JOIN users ON wallet_history.user_id = users.id LEFT JOIN coins ON  wallet_history.coin_id = coins.id";
        let whereAppended = false;

        if ((data && data != "")) {
            if (data && data != "" && data != null) {
                query += " WHERE"
                whereAppended = true;
                query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%'" +
                    " OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%'" +
                    " OR LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%'" +
                    " OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%'";
                if (!isNaN(data)) {
                    query += " OR wallet_history.amount=" + data;
                }
                query += ")"
            }
        }

        if (t_type) {
            if (whereAppended) {
                query += " AND "
            } else {
                query += " WHERE "
            }
            whereAppended = true;
            query += "  wallet_history.transaction_type='" + t_type + "'";
        }

        if (start_date && end_date) {
            if (whereAppended) {
                query += " AND "
            } else {
                query += " WHERE "
            }

            query += " wallet_history.created_at >= '" + await sails.helpers.dateFormat(start_date) + " 00:00:00" +
                "' AND wallet_history.created_at <= '" + await sails.helpers.dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = query;

        if (sort_col && sort_order) {
            let sortVal = (sort_order == 'descend' ? 'DESC' : 'ASC');
            query += " ORDER BY " + sort_col + " " + sortVal;
        }

        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
        console.log('query transaction', query)

        let transactionData = await sails.sendNativeQuery("Select *" + query, [])

        transactionData = transactionData.rows;

        let transactionCount = await sails.sendNativeQuery("Select COUNT(wallet_history.id)" + countQuery, [])
        transactionCount = transactionCount.rows[0].count;

        if (transactionData) {
            return res.json({
                "status": 200,
                "message": sails.__("Transaction list"),
                "data": transactionData, transactionCount
            });
        }


        // if (data) {
        //     let q = { deleted_at: null };
        //     if (t_type) {
        //         q['transaction_type'] = t_type
        //     }
        //     if (start_date && end_date) {
        //         q['created_at'] = { '>=': start_date, '<=': end_date };
        //     }
        //     q['or'] = [
        //         { source_address: { contains: search } },
        //         { destination_address: { contains: search } },
        //         { amount: search },
        //         { transaction_id: search }
        //     ]

        //     let userArray = await Users.find({ email: { 'contains': search } });

        //     let idArray = [];
        //     for (let index = 0; index < userArray.length; index++) {
        //         idArray.push(userArray[index].id);
        //     }
        //     q['or'].push({ user_id: idArray });
        //     let transactionData = await Transaction.find({
        //         ...q
        //     }).sort('id ASC').paginate(page, parseInt(limit));

        //     for (let index = 0; index < transactionData.length; index++) {
        //         if (transactionData[index].user_id) {
        //             let user = await Users.findOne({ id: transactionData[index].user_id })
        //             transactionData[index].email = user.email;
        //         }
        //     }

        //     for (let index = 0; index < transactionData.length; index++) {
        //         if (transactionData[index].coin_id) {
        //             let user = await Coins.findOne({ id: transactionData[index].coin_id })
        //             transactionData[index].coin_id = user.coin_code;
        //         }
        //     }

        //     let transactionCount = await Transaction.count({
        //         user_id: idArray,
        //         ...q
        //     });

        //     if (transactionData) {
        //         return res.json({
        //             "status": 200,
        //             "message": sails.__("Transaction list"),
        //             "data": transactionData, transactionCount
        //         });
        //     }
        // } else {
        //     let q = { deleted_at: null };
        //     if (user_id) {
        //         q['user_id'] = user_id
        //     }
        //     if (t_type) {
        //         q['transaction_type'] = t_type
        //     }
        //     if (start_date && end_date) {
        //         q['created_at'] = { '>=': start_date, '<=': end_date };
        //     }

        //     let transactionData = await Transaction.find({
        //         ...q
        //     }).sort("id ASC").paginate(page, parseInt(limit));

        //     for (let index = 0; index < transactionData.length; index++) {
        //         if (transactionData[index].user_id) {
        //             let user = await Users.findOne({ id: transactionData[index].user_id })
        //             transactionData[index].email = user.email;
        //         }
        //     }

        //     for (let index = 0; index < transactionData.length; index++) {
        //         if (transactionData[index].coin_id) {
        //             let user = await Coins.findOne({ id: transactionData[index].coin_id })
        //             transactionData[index].coin_id = user.coin_code;
        //         }
        //     }

        //     let transactionCount = await Transaction.count({ ...q });

        //     if (transactionData) {
        //         return res.json({
        //             "status": 200,
        //             "message": sails.__("Transaction list"),
        //             "data": transactionData, transactionCount
        //         });
        //     }
        // }
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
