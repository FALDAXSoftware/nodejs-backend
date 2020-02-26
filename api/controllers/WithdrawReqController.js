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
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.destination_address) LIKE '%" + data.toLowerCase() + "%'";
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
    let withdrawReqData = await sails.sendNativeQuery("Select withdraw_request.*, (withdraw_request.amount) as amount, users.email,users.first_name,users.last_name, coins.coin_name, UPPER(coins.coin_code) as coin_code " + query, [])
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
        reason,
        faldax_fee,
        network_fee,
        actual_amount
      } = req.body;


      if (status == true) {
        var coin = await Coins.findOne({
          deleted_at: null,
          id: coin_id,
          is_active: true
        })

        var division = sails.config.local.DIVIDE_EIGHT;
        if (coin.coin_code == 'xrp' || coin.coin_code == 'txrp') {
          division = sails.config.local.DIVIDE_SIX;
        } else if (coin.coin_code == 'eth' || coin.coin_code == 'teth' || coin.iserc == true) {
          division = sails.config.local.DIVIDE_EIGHTEEN;
        }
        console.log(req.body);

        let warmWalletData = await sails
          .helpers
          .wallet
          .getWalletAddressBalance(coin.hot_receive_wallet_address, coin.coin_code);

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

              var totalAmount = parseFloat(actual_amount) + parseFloat(faldax_fee) + parseFloat(network_fee)
              //If placed balance is greater than the amount to be send
              if (wallet.placed_balance >= parseFloat(totalAmount)) {

                //Checking Coin type
                if (coin.type == 1) {

                  //Check for warm wallet minimum thresold
                  if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - totalAmount) >= 0 && (warmWalletData.balance - totalAmount) >= coin.min_thresold && (warmWalletData.balance) > (totalAmount * division)) {
                    //Execute Transaction
                    // var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });

                    if (coin.coin_code == "teth" || coin.coin_code == "eth" || coin.iserc == true) {
                      var amountValue = parseFloat(actual_amount * division).toFixed(8);
                    } else {
                      var sendAmount = parseFloat(parseFloat(actual_amount)).toFixed(8)
                      var amountValue = parseFloat(sendAmount * division).toFixed(8)
                    }

                    var getDestinationValue = await Wallet.findOne({
                      where: {
                        deleted_at: null,
                        coin_id: coin.id,
                        receive_address: destination_address,
                        is_active: true
                      }
                    });

                    if ((coin.coin_code == "xrp" || coin.coin_code == 'txrp') && getDestinationValue && getDestinationValue != undefined) {
                      var totalFeeSub = 0;
                      totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_fee / 2));
                      totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount) + parseFloat(faldax_fee)
                      var walletHistory = {
                        coin_id: wallet.coin_id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: user_id,
                        amount: parseFloat(amount) + parseFloat(faldax_fee),
                        transaction_type: 'send',
                        transaction_id: '',
                        is_executed: false,
                        is_admin: false,
                        faldax_fee: faldax_fee,
                        actual_network_fees: parseFloat(network_fee / 2).toFixed(8),
                        estimated_network_fees: parseFloat(network_fee).toFixed(8),
                        is_done: true,
                        actual_amount: amount
                      }
                      await WalletHistory.create({
                        ...walletHistory
                      });

                      var user_wallet_placed_balance = wallet.placed_balance
                      var user_wallet_balance = wallet.balance
                      var receiver_wallet_balance = getDestinationValue.balance;

                      var userBalanceUpdate = parseFloat(user_wallet_balance) - (parseFloat(amount) + parseFloat(faldax_fee) + parseFloat(network_fee / 2));
                      var userPlacedBalanceUpdate = parseFloat(user_wallet_placed_balance) - (parseFloat(amount) + parseFloat(faldax_fee) + parseFloat(network_fee / 2));
                      var receiverBalanceUpdate = parseFloat(getDestinationValue.balance) + parseFloat(amount);
                      var receiverPlacedBalanceUpdate = parseFloat(getDestinationValue.placed_balance) + parseFloat(amount);


                      await Wallet
                        .update({
                          id: wallet.id
                        })
                        .set({
                          balance: userBalanceUpdate,
                          placed_balance: userPlacedBalanceUpdate
                        });

                      await Wallet
                        .update({
                          id: getDestinationValue.id
                        })
                        .set({
                          balance: receiverBalanceUpdate,
                          placed_balance: receiverPlacedBalanceUpdate
                        });

                      var walletHistoryReceiver = {
                        coin_id: wallet.coin_id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: getDestinationValue.user_id,
                        amount: amount,
                        transaction_type: 'receive',
                        transaction_id: '',
                        is_executed: false,
                        is_admin: false,
                        faldax_fee: 0.0,
                        actual_network_fees: 0.0,
                        estimated_network_fees: parseFloat(0.0).toFixed(8),
                        is_done: true,
                        actual_amount: amount
                      }

                      await WalletHistory.create({
                        ...walletHistoryReceiver
                      });

                      var addObject = {
                        coin_id: coin.id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: user_id,
                        amount: parseFloat(amount) + parseFloat(faldax_fee),
                        transaction_type: 'send',
                        transaction_id: '',
                        is_executed: true,
                        is_admin: false,
                        faldax_fee: faldax_fee,
                        actual_network_fees: parseFloat(network_fee / 2).toFixed(8),
                        estimated_network_fees: parseFloat(network_fee).toFixed(8),
                        is_done: true,
                        actual_amount: amount,
                        sender_user_balance_before: user_wallet_balance,
                        transaction_from: sails.config.local.SEND_TO_DESTINATION
                      }

                      await TransactionTable.create({
                        ...addObject
                      });

                      var addObject = {
                        coin_id: coin.id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: getDestinationValue.user_id,
                        amount: parseFloat(amount),
                        transaction_type: 'receive',
                        transaction_id: '',
                        is_executed: true,
                        is_admin: false,
                        faldax_fee: 0.0,
                        actual_network_fees: 0.0,
                        estimated_network_fees: parseFloat(0.0).toFixed(8),
                        is_done: true,
                        actual_amount: amount,
                        sender_user_balance_before: receiver_wallet_balance,
                        transaction_from: sails.config.local.RECEIVE_TO_DESTINATION
                      }

                      await TransactionTable.create({
                        ...addObject
                      });
                      // Update Admin Faldax Wallet
                      var adminWalletDetails = await Wallet.findOne({
                        where: {
                          deleted_at: null,
                          coin_id: coin.id,
                          is_active: true,
                          user_id: 36,
                          is_admin: true
                        }
                      });

                      if (adminWalletDetails != undefined) {
                        var totalAdminFees = 0;

                        var updatedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldax_fee) + parseFloat(network_fee / 2);
                        var updatedPlacedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldax_fee) + parseFloat(network_fee / 2);
                        totalAdminFees = parseFloat(totalAdminFees) + parseFloat(faldax_fee) + parseFloat(network_fee / 2)
                        var updatedData = await Wallet
                          .update({
                            deleted_at: null,
                            coin_id: coin.id,
                            is_active: true,
                            user_id: 36,
                            is_admin: true
                          })
                          .set({
                            balance: updatedBalance,
                            placed_balance: updatedPlacedBalance
                          })
                          .fetch();
                        let walletHistoryValue = {
                          coin_id: wallet.coin_id,
                          source_address: wallet.receive_address,
                          destination_address: adminWalletDetails.receive_address,
                          user_id: 36,
                          is_admin: true,
                          amount: (totalAdminFees),
                          transaction_type: 'send',
                          transaction_id: '',
                          is_executed: false,
                          faldax_fee: faldax_fee,
                          actual_network_fees: 0.0,
                          estimated_network_fees: 0.0,
                          is_done: false,
                          actual_amount: amount
                        }

                        await WalletHistory.create({
                          ...walletHistoryValue
                        });
                      }
                      await WithdrawRequest
                        .update({
                          "id": id
                        })
                        .set({
                          "is_approve": true
                        })
                    } else {

                      // Send to hot warm wallet and make entry in diffrent table for both warm to
                      // receive and receive to destination
                      var transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.hot_receive_wallet_address, destination_address, (amountValue).toString())
                      console.log("transaction", transaction)
                      var total_payout = parseFloat(actual_amount) + parseFloat(faldax_fee)
                      console.log("total_payout", total_payout)
                      if (coin.coin_code == "teth" || coin.coin_code == "eth") {
                        network_fees = (network_fee * sails.config.local.DIVIDE_NINE)
                        var network_feesValue = parseFloat(network_fees / (sails.config.local.DIVIDE_NINE))
                      } else {
                        var network_fees = (transaction.transfer.feeString);
                        var network_feesValue = parseFloat(network_fees / (division))
                      }
                      var totalFeeSub = 0;
                      totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_feesValue)).toFixed(8)
                      totalFeeSub = parseFloat(totalFeeSub) + parseFloat(actual_amount) + parseFloat(faldax_fee)
                      console.log("totalFeeSub", totalFeeSub)

                      var adminWalletDetails = await Wallet.findOne({
                        where: {
                          deleted_at: null,
                          coin_id: coin.id,
                          is_active: true,
                          user_id: 36,
                          is_admin: true
                        }
                      });

                      if (adminWalletDetails != undefined) {
                        var totalAdminFees = 0;
                        console.log("adminWalletDetails", adminWalletDetails.balance)
                        console.log("faldaxFees", faldax_fee)
                        var updatedBalance = parseFloat(adminWalletDetails.balance) + (parseFloat(faldax_fee));
                        var updatedPlacedBalance = parseFloat(adminWalletDetails.placed_balance) + (parseFloat(faldax_fee));
                        totalAdminFees = parseFloat(totalAdminFees) + parseFloat(faldax_fee)
                        var updatedData = await Wallet
                          .update({
                            deleted_at: null,
                            coin_id: coin.id,
                            is_active: true,
                            user_id: 36,
                            is_admin: true
                          })
                          .set({
                            balance: updatedBalance,
                            placed_balance: updatedPlacedBalance
                          })
                          .fetch();
                        let walletHistoryValue = {
                          coin_id: wallet.coin_id,
                          source_address: wallet.receive_address,
                          destination_address: adminWalletDetails.receive_address,
                          user_id: 36,
                          is_admin: true,
                          amount: (totalAdminFees),
                          transaction_type: 'send',
                          transaction_id: transaction.txid,
                          is_executed: false,
                          faldax_fee: faldax_fee,
                          actual_network_fees: 0.0,
                          estimated_network_fees: 0.0,
                          is_done: false,
                          actual_amount: amount
                        }

                        await WalletHistory.create({
                          ...walletHistoryValue
                        });
                      }

                      //Here remainning entry as well as address change
                      let walletHistory = {
                        coin_id: wallet.coin_id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: user_id,
                        amount: (total_payout),
                        transaction_type: 'send',
                        transaction_id: transaction.txid,
                        is_executed: false,
                        is_admin: false,
                        faldax_fee: (parseFloat(faldax_fee)).toFixed(8),
                        actual_network_fees: network_feesValue,
                        estimated_network_fees: parseFloat(network_fee).toFixed(8),
                        is_done: false,
                        actual_amount: actual_amount
                      }

                      // Make changes in code for receive webhook and then send to receive address
                      // Entry in wallet history
                      await WalletHistory.create({
                        ...walletHistory
                      });
                      // update wallet balance
                      var user_wallet_balance = wallet.balance;
                      var data = await Wallet
                        .update({
                          id: wallet.id
                        })
                        .set({
                          balance: (wallet.balance - totalFeeSub).toFixed(8),
                          placed_balance: (wallet.placed_balance - totalFeeSub).toFixed(8)
                        });

                      // Adding the transaction details in transaction table This is entry for sending
                      // from warm wallet to hot send wallet
                      let addObject = {
                        coin_id: coin.id,
                        source_address: wallet.receive_address,
                        destination_address: destination_address,
                        user_id: user_id,
                        amount: parseFloat(amountValue / division).toFixed(8),
                        transaction_type: 'send',
                        is_executed: true,
                        transaction_id: transaction.txid,
                        faldax_fee: (parseFloat(faldax_fee)).toFixed(8),
                        actual_network_fees: network_feesValue,
                        estimated_network_fees: parseFloat(network_fee).toFixed(8),
                        is_done: false,
                        actual_amount: actual_amount,
                        sender_user_balance_before: user_wallet_balance,
                        warm_wallet_balance_before: parseFloat(warmWalletData.balance / 1e8).toFixed(sails.config.local.TOTAL_PRECISION),
                        transaction_from: sails.config.local.SEND_TO_DESTINATION
                      }

                      await TransactionTable.create({
                        ...addObject
                      });
                      await WithdrawRequest
                        .update({
                          "id": id
                        })
                        .set({
                          "is_approve": true,
                          "transaction_id": transaction.txid
                        })
                    }
                    // //This is for sending from hot send wallet to destination address let
                    // addObjectSendData = {   coin_id: coin.id,   source_address:
                    // sendWalletData.receiveAddress.address,   destination_address:
                    // destination_address,   user_id: user_id,   amount: amount,
                    // transaction_type: 'send',   is_executed: false } await
                    // TransactionTable.create({   ...addObjectSendData })

                    var walletHistoryDataValue = await WalletHistory.findOne({
                      transaction_id: transaction.txid,
                      deleted_at: null,
                      coin_id: wallet.coin_id,
                      user_id: user_id,
                    })

                    totalFeeSub = parseFloat(walletHistoryDataValue.amount);

                    var userData = await Users.findOne({
                      where: {
                        id: user_id,
                        is_active: true,
                        deleted_at: null
                      }
                    });
                    if (userData) {
                      // Send Email to the user to inform, wallet has created
                      await sails.helpers.notification.send.email("approve_withdraw_request", userData);
                    }
                    return res
                      .status(200)
                      .json({
                        status: 200,
                        message: parseFloat(totalFeeSub).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                      });
                  } else {
                    return res
                      .status(400)
                      .json({
                        status: 400,
                        message: sails.__("Insufficient Balance in warm Wallet Withdraw Request").message
                      })
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
              error_at: sails.__("Something Wrong").message
            });
        }
        var userData = await Users.findOne({
          where: {
            id: user_id,
            is_active: true,
            deleted_at: null
          }
        });
        if (userData) {
          // Send Email to the user to inform, wallet has created
          await sails.helpers.notification.send.email("disapprove_withdraw_request", userData);
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
            "message": sails.__("Insufficient Balance in warm Wallet").message,
            error_at: sails.__("Insufficient Balance in warm Wallet").message
          })
      }
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "message": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  }
};
