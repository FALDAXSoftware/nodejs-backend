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
        let { page, limit, data } = req.allParams();

        if (data) {
            let userArray = await Users.find({
                where: {
                    deleted_at: null,
                    or: [{
                        title: { contains: data }
                    },
                    { email: { contains: data } },
                    ]
                }
            });

            let idArray = [];
            for (let index = 0; index < userArray.length; index++) {
                idArray.push(userArray[index].id);
            }

            let withdrawReqData = await WithdrawRequest.find({
                user_id: idArray
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
            let withdrawReqData = await WithdrawRequest.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            for (let index = 0; index < withdrawReqData.length; index++) {
                if (withdrawReqData[index].user_id) {
                    let user = await Users.findOne({ id: withdrawReqData[index].user_id })
                    withdrawReqData[index].maker_email = user.email;
                }
            }

            let withdrawReqCount = await WithdrawRequest.count();

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
