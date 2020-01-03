/**
 * WithdrawReqController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var BitGoJS = require('bitgo');
var logger = require('./logger')

module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllWithdrawReq: async function (req, res) {
    // req.setLocale('en')
    let {
      page,
      limit,
      data,
      t_type,
      start_date,
      end_date,
      user_id,
      sort_col,
      sort_order
    } = req.allParams();

    let query = " from withdraw_request LEFT JOIN users ON withdraw_request.user_id = users.id LEFT JOIN coins ON withdraw_request.coin_id = coins.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR withdraw_request.amount=" + data;
        }
        query += ")"
      }
    }

    if (user_id) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += " withdraw_request.user_id=" + user_id
    }

    if (t_type && t_type != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      if (t_type == "null") {
        query += " withdraw_request.is_approve IS NULL";
      } else {
        query += " withdraw_request.is_approve=" + t_type;
      }
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " withdraw_request.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND withdraw_request.created_at <= '" + await sails
          .helpers
          .dateFormat(end_date) + " 23:59:59'";
    }

    countQuery = query;

    if (sort_col && sort_order) {
      let sortVal = (sort_order == 'descend' ?
        'DESC' :
        'ASC');
      query += " ORDER BY " + sort_col + " " + sortVal;
    } else {
      query += " ORDER BY withdraw_request.id DESC";
    }

    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

    let withdrawReqData = await sails.sendNativeQuery("Select withdraw_request.*, users.email, coins.coin_name " + query, [])
    withdrawReqData = withdrawReqData.rows;

    let withdrawReqCount = await sails.sendNativeQuery("Select COUNT(withdraw_request.id)" + countQuery, [])
    withdrawReqCount = withdrawReqCount.rows[0].count;

    if (withdrawReqData) {
      return res.json({
        "status": 200,
        "message": sails.__("Withdraw Request list").message,
        "data": withdrawReqData,
        withdrawReqCount
      });
    }
  },

  approveDisapproveRequest: async function (req, res) {
    try {
      var {
        status,
        id,
        amount,
        destination_address,
        coin_id,
        user_id,
        reason
      } = req.body;

      if (status == true) {
        var coin = await Coins.findOne({
          deleted_at: null,
          id: coin_id,
          is_active: true
        })

        let warmWalletData = await sails
          .helpers
          .wallet
          .getWalletAddressBalance(coin.warm_wallet_address, coin.coin_code);

        let sendWalletData = await sails
          .helpers
          .wallet
          .getWalletAddressBalance(coin.hot_send_wallet_address, coin.coin_code);

        if (coin) {
          var wallet = await Wallet.findOne({
            deleted_at: null,
            user_id: user_id,
            coin_id: coin.id,
            is_active: true
          });

          var userData = await Users.findOne({
            where: {
              id: user_id,
              deleted_at: null
            }
          })

          if (userData != undefined) {

            //Checking if wallet data is found or not
            if (wallet) {

              //If placed balance is greater than the amount to be send
              if (wallet.placed_balance >= parseFloat(amount)) {

                //Checking Coin type
                if (coin.type == 1) {

                  //Check for warm wallet minimum thresold
                  if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - amount) >= coin.min_thresold) {
                    //Execute Transaction
                    // var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });


                    // Send to hot warm wallet and make entry in diffrent table for both warm to
                    // receive and receive to destination
                    let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, sendWalletData.receiveAddress.address, amount * 1e8)
                    //Here remainning entry as well as address change
                    let walletHistory = {
                      coin_id: wallet.coin_id,
                      source_address: sendWalletData.receiveAddress.address,
                      destination_address: destination_address,
                      user_id: user_id,
                      amount: amount,
                      transaction_type: 'send',
                      transaction_id: transaction.id,
                      is_executed: false,
                      is_approve: true
                    }

                    // Make changes in code for receive webhook and then send to receive address
                    // Entry in wallet history
                    await WalletHistory.create({
                      ...walletHistory
                    });
                    // update wallet balance
                    await Wallet
                      .update({
                        id: wallet.id
                      })
                      .set({
                        balance: wallet.balance - amount,
                        placed_balance: wallet.placed_balance - amount
                      });

                    // Adding the transaction details in transaction table This is entry for sending
                    // from warm wallet to hot send wallet
                    let addObject = {
                      coin_id: coin.id,
                      source_address: warmWalletData.receiveAddress.address,
                      destination_address: sendWalletData.receiveAddress.address,
                      user_id: user_id,
                      amount: amount,
                      transaction_type: 'send',
                      is_executed: true
                    }

                    await TransactionTable.create({
                      ...addObject
                    });

                    // //This is for sending from hot send wallet to destination address let
                    // addObjectSendData = {   coin_id: coin.id,   source_address:
                    // sendWalletData.receiveAddress.address,   destination_address:
                    // destination_address,   user_id: user_id,   amount: amount,
                    // transaction_type: 'send',   is_executed: false } await
                    // TransactionTable.create({   ...addObjectSendData });

                    return res
                      .json
                      .status(200)({
                        status: 200,
                        message: sails.__("Token send success").message
                      });
                  }
                }
              } else {
                return res
                  .status(400)
                  .json({
                    status: 400,
                    message: sails.__("Insufficent balance wallet user").message
                  });
              }
            } else {
              return res
                .status(400)
                .json({
                  status: 400,
                  message: sails.__("Wallet Not Found").message
                });
            }
          } else {
            return res
              .status(400)
              .json({
                status: 400,
                message: sails.__("User has been deleted, So funds cannot be transferred").message
              });
          }
        } else {
          return res
            .status(400)
            .json({
              status: 400,
              message: sails.__("Coin not found").message
            });
        }
      } else if (status == false) {
        var withdrawLimitData = await WithdrawRequest
          .update({
            id: id
          })
          .set({
            is_approve: false,
            reason
          })
          .fetch();

        if (!withdrawLimitData) {
          return res
            .status(500)
            .json({
              status: 500,
              "message": sails.__("Something Wrong").message,
              error_at:sails.__("Something Wrong").message
            });
        }
        return res
          .status(200)
          .json({
            status: 200,
            "message": sails.__("Withdraw Request Cancel").message
          })
      }
    } catch (error) {
      console.log("errr", error);

      if (error.name == "ImplementationError") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Insufficient Balance in warm Wallet").message,
            error_at:sails.__("Insufficient Balance in warm Wallet").message
          })
      }
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "message": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  }
};
