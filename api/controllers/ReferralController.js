module.exports = {

  //Get Referred user amount
  collectReferral: async function (req, res) {
    try {
      var user_id = req.user.id;
      var collectUserData = [];
      var collectedRequestedUserData = [];
      var collectUserDataBTC = 0;
      var collectUserDataBCH = 0;
      var collectUserDataBSV = 0;
      var collectUserDataDASH = 0;
      var collectUserDataETH = 0;
      var collectUserDataLTC = 0;
      var collectUserDataXLM = 0;
      var collectUserDataXRP = 0;
      var collectUserDataZEC = 0;
      var collectFundData = [];
      var m = 0;
      var n = 0;

      var userData = await Users.find({deleted_at: null, is_active: true, referred_id: user_id});
      console.log(userData);
      var data = await Users.findOne({deleted_at: null, is_active: true, id: user_id});
      for (var i = 0; i < userData.length; i++) {
        var tradeHistoryUserData = await TradeHistory.find({deleted_at: null, is_collected: false, user_id: userData[i].id});
        for (var j = 0; j < tradeHistoryUserData.length; j++) {
          if (tradeHistoryUserData[j].side === 'Sell') {
            collectUserData[m] = tradeHistoryUserData[j];
            collectUserData[m].taker_fees = collectUserData[m].taker_fee + (((collectUserData[m].fill_price * collectUserData[m].quantity) * (collectUserData[m].taker_fees / 100)) * (((data.referal_percentage)) / 100));
            await TradeHistory
              .update({id: tradeHistoryUserData[j].id})
              .set({'taker_fees': collectUserData[j].taker_fees, 'is_collected': true});
            collectUserData[m].takercoin = collectUserData[m].currency;
          } else {
            collectUserData[m] = tradeHistoryUserData[j];
            collectUserData[m].taker_fees = ((collectUserData[m].quantity * (collectUserData[m].taker_fee / 100)) * ((data.referal_percentage) / 100));
            await TradeHistory
              .update({id: tradeHistoryUserData[j].id})
              .set({'taker_fees': collectUserData[m].taker_fees, 'is_collected': true})
              .fetch();
            collectUserData[m].takercoin = collectUserData[m].settle_currency;
            console.log(collectUserData[m])
          }
          m++;
        }

        var tradeHistoryRequestedData = await TradeHistory.find({deleted_at: null, is_collected: false, requested_user_id: userData[i].id});
        for (var k = 0; k < tradeHistoryRequestedData; k++) {
          if (tradeHistoryRequestedData[k].side === 'Buy') {
            collectedRequestedUserData[n] = tradeHistoryRequestedData[k];
            collectedRequestedUserData[n].maker_fees = ((collectedRequestedUserData[n].maker_fee / 100) * (collectedRequestedUserData[n].quantity * collectedRequestedUserData[n].fill_price) * ((data.referal_percentage) / 100));
            await TradeHistory
              .update({id: tradeHistoryRequestedData[k].id})
              .set({'maker_fees': collectedRequestedUserData[n].maker_fees, 'is_collected': true});
            collectedRequestedUserData[n].makercoin = collectedRequestedUserData[n].currency;
            collectedRequestedUserData[n].side = 'Sell';
          } else {
            collectedRequestedUserData[n] = tradeHistoryRequestedData[k];
            collectedRequestedUserData[n].maker_fees = ((collectedRequestedUserData[n].maker_fee / 100) * (collectedRequestedUserData[n].quantity) * ((data.referal_percentage) / 100));
            await TradeHistory
              .update({id: tradeHistoryRequestedData[k].id})
              .set({'maker_fees': collectedRequestedUserData[n].maker_fees, 'is_collected': true});
            collectedRequestedUserData[n].makercoin = collectedRequestedUserData[n].settle_currency;
            collectedRequestedUserData[n].side = 'Buy';
          }
          n++;
        }
      }

      if (collectUserData.length > 0) {
        for (i = 0; i < collectUserData.length; i++) {
          for (j = 0; j <= i; j++) {
            if (collectUserData[j].takercoin == collectUserData[i].takercoin) {
              console.log(collectUserData[i].taker_fees);
              collectUserData[i].totalTakerFees = collectUserData[i].totalTakerFees + collectUserData[i].taker_fees
            } else {
              console.log(collectUserData[i].taker_fees);
              collectUserData[i].totalTakerFees = collectUserData[i].taker_fees;
            }
          }

          if (collectUserData[i].takercoin == 'BTC') {
            collectUserDataBTC = collectUserDataBTC + collectUserData[i].taker_fees
          } else if (collectUserData[i].takercoin == 'BCH') {
            collectUserDataBCH = collectUserDataBCH + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'ETH') {
            collectUserDataETH = collectUserDataETH + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'XRP') {
            collectUserDataXRP = collectUserDataXRP + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'LTC') {
            collectUserDataLTC = collectUserDataLTC + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'DASH') {
            collectUserDataDASH = collectUserDataDASH + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'ZEC') {
            collectUserDataZEC = collectUserDataZEC + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'XLM') {
            collectUserDataXLM = collectUserDataXLM + collectUserData[i].taker_fees;
          } else if (collectUserData[i].takercoin == 'BSV') {
            collectUserDataBSV = collectUserDataBSV + collectUserData[i].taker_fees;
          }
        }
      }

      if (collectedRequestedUserData.length > 0) {
        for (i = 0; i < collectedRequestedUserData.length; i++) {
          for (j = 0; j <= i; j++) {
            if (collectedRequestedUserData[j].makercoin == collectedRequestedUserData[i].makercoin) {
              collectedRequestedUserData[i].totalTakerFees = collectedRequestedUserData[i].totalTakerFees + collectedRequestedUserData[i].maker_fees
            } else {
              collectedRequestedUserData[i].totalTakerFees = collectedRequestedUserData[i].maker_fees;
            }
          }
          if (collectedRequestedUserData[i].makercoin == 'BTC') {
            collectUserDataBTC = collectUserDataBTC + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].makercoin == 'BCH') {
            collectUserDataBCH = collectUserDataBCH + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].makercoin == 'ETH') {
            collectUserDataETH = collectUserDataETH + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].makercoin == 'XRP') {
            collectUserDataXRP = collectUserDataXRP + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].makercoin == 'LTC') {
            collectUserDataLTC = collectUserDataLTC + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].takercoin == 'DASH') {
            collectUserDataDASH = collectUserDataDASH + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].takercoin == 'ZEC') {
            collectUserDataZEC = collectUserDataZEC + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].takercoin == 'XLM') {
            collectUserDataXLM = collectUserDataXLM + collectedRequestedUserData[i].maker_fees;
          } else if (collectedRequestedUserData[i].takercoin == 'BSV') {
            collectUserDataBSV = collectUserDataBSV + collectedRequestedUserData[i].maker_fees;
          }
        }
      }

      if (collectUserDataBCH == undefined) {
        collectUserDataBCH = 0;
        collectFundData.push('BCH : ' + collectUserDataBCH);
      } else {
        collectFundData.push('BCH : ' + collectUserDataBCH);
      }
      if (collectUserDataBTC === undefined) {
        collectUserDataBTC = 0;
        collectFundData.push('BTC : ' + collectUserDataBTC);
      } else {
        collectFundData.push('BTC : ' + collectUserDataBTC);
      }
      if (collectUserDataETH === undefined) {
        collectUserDataETH = 0;
        collectFundData.push('ETH : ' + collectUserDataETH);
      } else {
        collectFundData.push('ETH : ' + collectUserDataETH);
      }
      if (collectUserDataXRP == undefined) {
        collectUserDataXRP = 0;
        collectFundData.push('XRP : ' + collectUserDataXRP);
      } else {
        collectFundData.push('XRP : ' + collectUserDataXRP);
      }
      if (collectUserDataLTC === undefined) {
        collectUserDataLTC = 0;
        collectFundData.push('LTC : ' + collectUserDataLTC);
      } else {
        collectFundData.push('LTC : ' + collectUserDataLTC);
      }
      if (collectUserDataDASH === undefined) {
        collectUserDataDASH = 0;
        collectFundData.push('DASH : ' + collectUserDataDASH);
      } else {
        collectFundData.push('DASH : ' + collectUserDataDASH);
      }
      if (collectUserDataZEC == undefined) {
        collectUserDataZEC = 0;
        collectFundData.push('ZEC : ' + collectUserDataZEC);
      } else {
        collectFundData.push('ZEC : ' + collectUserDataZEC);
      }
      if (collectUserDataXLM === undefined) {
        collectUserDataXLM = 0;
        collectFundData.push('XLM : ' + collectUserDataXLM);
      } else {
        collectFundData.push('XLM : ' + collectUserDataXLM);
      }
      if (collectUserDataBSV === undefined) {
        collectUserDataBSV = 0;
        collectFundData.push('BSV : ' + collectUserDataBSV);
      } else {
        collectFundData.push('BSV : ' + collectUserDataBSV);
      }

      console.log(collectFundData);

      for (var y = 0; y < collectFundData.length; y++) {
        if (y == 0) {
          var collect_data = await Referral.findOne({user_id: user_id, coin_name: 'BCH', deleted_at: null});
          console.log(collect_data);
          var dataCoin = await Coins.findOne({coin: 'BCH', deleted_at: null});
          console.log(dataCoin);
          var walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null, user_id: user_id});
          console.log(walletData);
          if (collect_data == undefined) {
            var insertReferralData = await Referral
              .create({coin_name: 'BCH', amount: collectUserDataBCH, user_id: user_id, coin_id: dataCoin.id})
              .fetch();
            console.log(insertReferralData.amount);
            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (insertReferralData.amount + collectUserDataBCH)),
                placed_balance: (walletData.placed_balance + (insertReferralData.amount + collectUserDataBCH))
              })
          } else {
            var collectedData = await Referral
              .update({id: collect_data.id})
              .set({
                amount: (collect_data.amount + collectUserDataBCH)
              })
              .fetch();

            console.log(collectedData[0].amount);

            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (collectedData[0].amount + collectUserDataBCH)),
                placed_balance: (walletData.placed_balance + (collectedData[0].amount + collectUserDataBCH))
              })
          }
        } else if (y == 1) {
          var collect_data = await Referral.findOne({user_id: user_id, coin_name: 'BTC', deleted_at: null});
          var dataCoin = await Coins.findOne({coin: 'BTC', deleted_at: null});
          var walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null, user_id: user_id});
          if (collect_data == undefined) {
            var insertReferralData = await Referral
              .create({coin_name: 'BTC', amount: collectUserDataBTC, user_id: user_id, coin_id: dataCoin.id})
              .fetch();
            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (insertReferralData.amount + collectUserDataBTC)),
                placed_balance: (walletData.placed_balance + (insertReferralData.amount + collectUserDataBTC))
              })
          } else {

            var collectedData = await Referral
              .update({id: collect_data.id})
              .set({
                amount: (collect_data.amount + collectUserDataBTC)
              })
              .fetch();

            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (collectedData[0].amount + collectUserDataBTC)),
                placed_balance: (walletData.placed_balance + (collectedData[0].amount + collectUserDataBTC))
              })
          }
        } else if (y == 2) {
          var collect_data = await Referral.findOne({user_id: user_id, coin_name: 'ETH', deleted_at: null});
          console.log(collect_data);
          console.log(collectUserDataETH);
          var dataCoin = await Coins.findOne({coin: 'ETH', deleted_at: null});
          var walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null, user_id: user_id});
          if (collect_data == undefined) {
            var insertReferralData = await Referral
              .create({coin_name: 'ETH', amount: collectUserDataETH, user_id: user_id, coin_id: dataCoin.id})
              .fetch();
            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (insertReferralData.amount + collectUserDataETH)),
                placed_balance: (walletData.placed_balance + (insertReferralData.amount + collectUserDataETH))
              })
          } else {
            var collectedData = await Referral
              .update({id: collect_data.id})
              .set({
                amount: (collect_data.amount + collectUserDataETH)
              })
              .fetch();

            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (collectedData[0].amount + collectUserDataETH)),
                placed_balance: (walletData.placed_balance + (collectedData[0].amount + collectUserDataETH))
              })
          }
        } else if (y == 3) {
          var collect_data = await Referral.findOne({user_id: user_id, coin_name: 'XRP', deleted_at: null});
          var dataCoin = await Coins.findOne({coin: 'XRP', deleted_at: null});
          var walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null, user_id: user_id});
          if (collect_data == undefined) {
            var insertReferralData = await Referral
              .create({coin_name: 'XRP', amount: collectUserDataXRP, user_id: user_id, coin_id: dataCoin.id})
              .fetch();
            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (insertReferralData.amount + collectUserDataXRP)),
                placed_balance: (walletData.placed_balance + (insertReferralData.amount + collectUserDataXRP))
              })
          } else {
            var collectedData = await Referral
              .update({id: collect_data.id})
              .set({
                amount: (collect_data.amount + collectUserDataXRP)
              })
              .fetch();

            var updateBalance = await Wallet
              .update({id: walletData.id})
              .set({
                balance: (walletData.balance + (collectedData[0].amount + collectUserDataXRP)),
                placed_balance: (walletData.placed_balance + (collectedData[0].amount + collectUserDataXRP))
              })
          }
          // } else if (y == 4) {   var collect_data = await Referral.findOne({user_id:
          // user_id, coin_name: 'LTC', deleted_at: null});   var dataCoin = await
          // Coins.findOne({coin: 'LTC', deleted_at: null});   var walletData = await
          // Wallet.findOne({coin_id: dataCoin.id, deleted_at: null, user_id: user_id});
          // if (collect_data == undefined) {     var insertReferralData = await Referral
          // .create({coin_name: 'LTC', amount: collectUserDataLTC, user_id: user_id,
          // coin_id: dataCoin.id})       .fetch();     var updateBalance = await Wallet
          // .update({id: walletData.id})       .set({         balance:
          // (walletData.balance + (insertReferralData.amount + collectUserDataLTC)),
          // placed_balance: (walletData.placed_balance + (insertReferralData.amount +
          // collectUserDataLTC))       })   } else {     var collectedData = await
          // Referral       .update({id: collect_data.id})       .set({         amount:
          // (collect_data.amount + collectUserDataLTC)       })       .fetch();     var
          // updateBalance = await Wallet       .update({id: walletData.id})       .set({
          // balance: (walletData.balance + (collectedData.amount + collectUserDataLTC)),
          // placed_balance: (walletData.placed_balance + (collectedData.amount +
          // collectUserDataLTC))       })   } } else if (y == 5) {   var collect_data =
          // await Referral.findOne({user_id: user_id, coin_name: 'DASH', deleted_at:
          // null});   var dataCoin = await Coins.findOne({coin: 'DASH', deleted_at:
          // null});   var walletData = await Wallet.findOne({coin_id: dataCoin.id,
          // deleted_at: null, user_id: user_id});   if (collect_data == undefined) { var
          // insertReferralData = await Referral .create({coin_name: 'DASH', amount:
          // collectUserDataDASH, user_id: user_id, coin_id: dataCoin.id})       .fetch();
          //     var updateBalance = await Wallet .update({id: walletData.id}) .set({
          // balance: (walletData.balance + (insertReferralData.amount +
          // collectUserDataDASH)), placed_balance: (walletData.placed_balance +
          // (insertReferralData.amount + collectUserDataDASH))       })   } else { var
          // collectedData = await Referral       .update({id: collect_data.id}) .set({
          // amount: (collect_data.amount + collectUserDataDASH)       }) .fetch(); var
          // updateBalance = await Wallet       .update({id: walletData.id}) .set({
          // balance: (walletData.balance + (collectedData.amount + collectUserDataDASH)),
          //         placed_balance: (walletData.placed_balance + (collectedData.amount +
          // collectUserDataDASH)) })   } } else if (y == 6) { var collect_data = await
          // Referral.findOne({user_id: user_id, coin_name: 'ZEC', deleted_at: null}); var
          // dataCoin = await Coins.findOne({coin: 'ZEC', deleted_at: null});   var
          // walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null,
          // user_id: user_id});   if (collect_data == undefined) {     var
          // insertReferralData = await Referral .create({coin_name: 'ZEC', amount:
          // collectUserDataZEC, user_id: user_id, coin_id: dataCoin.id}) .fetch(); var
          // updateBalance = await Wallet     .update({id: walletData.id}) .set({ balance:
          // (walletData.balance + (insertReferralData.amount + collectUserDataZEC)),
          // placed_balance: (walletData.placed_balance + (insertReferralData.amount +
          // collectUserDataZEC))       })   } else {     var collectedData = await
          // Referral       .update({id: collect_data.id}) .set({   amount:
          // (collect_data.amount + collectUserDataZEC)       })    .fetch();  var
          // updateBalance = await Wallet       .update({id: walletData.id}) .set({
          // balance: (walletData.balance + (collectedData.amount + collectUserDataZEC)),
          // placed_balance: (walletData.placed_balance + (collectedData.amount +
          // collectUserDataZEC))   })   } } else if (y == 7) { var collect_data = await
          // Referral.findOne({user_id: user_id, coin_name: 'XLM', deleted_at: null}); var
          // dataCoin = await Coins.findOne({coin: 'XLM', deleted_at: null});   var
          // walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null,
          // user_id: user_id});   if (collect_data == undefined) {     var
          // insertReferralData = await Referral .create({coin_name: 'XLM', amount:
          // collectUserDataXLM, user_id: user_id, coin_id: dataCoin.id}) .fetch(); var
          // updateBalance = await Wallet     .update({id: walletData.id}) .set({ balance:
          // (walletData.balance + (insertReferralData.amount + collectUserDataXLM)),
          // placed_balance: (walletData.placed_balance + (insertReferralData.amount +
          // collectUserDataXLM))       })   } else {     var collectedData = await
          // Referral       .update({id: collect_data.id}) .set({   amount:
          // (collect_data.amount + collectUserDataXLM)       })    .fetch();  var
          // updateBalance = await Wallet       .update({id: walletData.id}) .set({
          // balance: (walletData.balance + (collectedData.amount + collectUserDataXLM)),
          // placed_balance: (walletData.placed_balance + (collectedData.amount +
          // collectUserDataXLM))   })   } } else if (y == 8) { var collect_data = await
          // Referral.findOne({user_id: user_id, coin_name: 'BSV', deleted_at: null}); var
          // dataCoin = await Coins.findOne({coin: 'BSV', deleted_at: null});   var
          // walletData = await Wallet.findOne({coin_id: dataCoin.id, deleted_at: null,
          // user_id: user_id});   if (collect_data == undefined) {     var
          // insertReferralData = await Referral .create({coin_name: 'BSV', amount:
          // collectUserDataBSV, user_id: user_id, coin_id: dataCoin.id}) .fetch(); var
          // updateBalance = await Wallet     .update({id: walletData.id}) .set({ balance:
          // (walletData.balance + (insertReferralData.amount + collectUserDataBSV)),
          // placed_balance: (walletData.placed_balance + (insertReferralData.amount +
          // collectUserDataBSV))       })   } else {     var collectedData = await
          // Referral       .update({id: collect_data.id}) .set({   amount:
          // (collect_data.amount + collectUserDataBSV)       })    .fetch();  var
          // updateBalance = await Wallet       .update({id: walletData.id}) .set({
          // balance: (walletData.balance + (collectedData.amount + collectUserDataBSV)),
          // placed_balance: (walletData.placed_balance + (collectedData.amount +
          // collectUserDataBSV))   })   } }
        }
      }

      return res.json({
        "status": 200,
        "message": sails.__("Referral amount collect"),
        "data": collectFundData
      });

    } catch (err) {
      console.log("Error in referral :: ", err);
    }
  },

  getUserReferredAmounts: async function (req, res) {
    try {
      let {id} = req.allParams();

      let referredAmountData = await referral.find({user_id: id})
      let userData = await Users.find({id: id})

      if (referredAmountData) {
        return res.json({
          "status": 200,
          "message": sails.__("Referral Amount Data"),
          "data": referredAmountData,
          userData
        });
      }
    } catch (err) {
      console.log('>>>err', err)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
