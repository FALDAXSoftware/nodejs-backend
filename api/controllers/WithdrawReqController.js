/**
 * WithdrawReqController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllWithdrawReq: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data, start_date, end_date, t_type } = req.allParams();

        if (data) {
            let q = {
                deleted_at: null,
            }
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }
            if (t_type) {
                q['is_approve'] = t_type == 'true' ? true : false;
            }

            let userArray = await Users.find({
                where: {
                    or: [
                        { email: { contains: data } }
                    ],
                }
            });

            let idArray = [];
            for (let index = 0; index < userArray.length; index++) {
                idArray.push(userArray[index].id);
            }

            let withdrawReqData = await WithdrawRequest.find({
                ...q,
                or: [
                    { user_id: { 'in': idArray } },
                    { source_address: { contains: data } },
                    { destination_address: { contains: data } },
                ]
            }).sort('id ASC').paginate(page, parseInt(limit));

            for (let index = 0; index < withdrawReqData.length; index++) {
                if (withdrawReqData[index].user_id) {
                    let user = await Users.findOne({ id: withdrawReqData[index].user_id })
                    withdrawReqData[index].maker_email = user.email;
                }
            }

            let withdrawReqCount = await WithdrawRequest.count({
                user_id: idArray,
            });
            if (withdrawReqData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Withdraw Request list"),
                    "data": withdrawReqData, withdrawReqCount
                });
            }
        } else {
            let q = {
                deleted_at: null,
            }
            if (t_type) {
                q['is_approve'] = t_type == 'true' ? true : false;
            }
            if (start_date && end_date) {
                q['created_at'] = { '>=': start_date, '<=': end_date };
            }

            let withdrawReqData = await WithdrawRequest.find({
                where: {
                    ...q
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            for (let index = 0; index < withdrawReqData.length; index++) {
                if (withdrawReqData[index].user_id) {
                    let user = await Users.findOne({ id: withdrawReqData[index].user_id })
                    withdrawReqData[index].maker_email = user.email;
                }
            }

            let withdrawReqCount = await WithdrawRequest.count({ ...q });

            if (withdrawReqData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Withdraw Request list"),
                    "data": withdrawReqData, withdrawReqCount
                });
            }
        }
    },
};
