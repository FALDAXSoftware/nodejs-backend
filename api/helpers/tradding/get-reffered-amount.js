module.exports = {

  friendlyName: 'Get reffered amount',

  description: '',

  inputs: {
    trade_object: {
      type: 'json',
      example: '{}',
      description: 'Trade History object',
      required: true
    },
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id of user executing trade',
      required: true
    },
    transaction_id: {
      type: 'string',
      example: 'dfsv23g4gbSDFG',
      description: 'Transaction Id of order executed',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Reffered amount'
    }
  },

  fn: async function (inputs, exits) {

    try {

      // Collect referral data for user according to the referral percentage
      // Here when 1 user has refference the user 2 and user 2 does the trade then user1 earns the referral according to the amount and referral percentage mentioned in it
      var referral_percentage = 0;
      var trade_object = inputs.trade_object;
      var collectedAmount = 0;
      var collectCoin;
      var coinData;
      var referralData = await Users.findOne({
        deleted_at: null,
        is_active: true,
        id: inputs.user_id
      });
      var referredUserData = await Users.findOne({
        deleted_at: null,
        is_active: true,
        id: referralData.referred_id
      });
      var addRefferalAddData = {};

      if (referredUserData !== undefined && referredUserData.referal_percentage > 0) {
        referral_percentage = parseFloat(referredUserData.referal_percentage);
      } else {
        var referal_data = await AdminSetting.findOne({
          deleted_at: null,
          slug: 'default_referral_percentage'
        });
        referral_percentage = parseFloat(referal_data.value);
      }


      if (referredUserData != undefined) {
        // if (trade_object.trade_type == 1) {
        //   if (trade_object.user_id == inputs.user_id) {
        //     if (trade_object.side == 'Buy') {
        //       collectedAmount = parseFloat(trade_object.taker_fee + (trade_object.quantity * trade_object.taker_fee * (referral_percentage / 100)))
        //       collectCoin = trade_object.settle_currency;
        //       coinData = await Coins.findOne({
        //         is_active: true,
        //         deleted_at: null,
        //         coin: trade_object.settle_currency
        //       });
        //       addRefferalAddData.coin_id = coinData.id;
        //       addRefferalAddData.amount = collectedAmount;
        //       addRefferalAddData.coin_name = collectCoin;
        //       addRefferalAddData.user_id = referredUserData.id;
        //       addRefferalAddData.referred_user_id = referralData.id;
        //       addRefferalAddData.txid = inputs.transaction_id;
        //       addRefferalAddData.is_collected = false;

        //       var addedData = await Referral.create(addRefferalAddData);
        //     } else if (trade_object.side == 'Sell') {
        //       collectedAmount = parseFloat(trade_object.taker_fee + (trade_object.fill_price * trade_object.quantity * trade_object.taker_fee * (referral_percentage / 100)))
        //       collectCoin = trade_object.currency;
        //       coinData = await Coins.findOne({
        //         is_active: true,
        //         deleted_at: null,
        //         coin: trade_object.currency
        //       });
        //       addRefferalAddData.coin_id = coinData.id;
        //       addRefferalAddData.amount = collectedAmount;
        //       addRefferalAddData.coin_name = collectCoin;
        //       addRefferalAddData.user_id = referredUserData.id;
        //       addRefferalAddData.referred_user_id = referralData.id;
        //       addRefferalAddData.txid = inputs.transaction_id;
        //       addRefferalAddData.is_collected = false;

        //       var addedData = await Referral.create(addRefferalAddData);
        //     }
        //   } else if (trade_object.requested_user_id == inputs.user_id) {
        //     if (trade_object.side == 'Buy') {
        //       collectedAmount = parseFloat(trade_object.maker_fee + (trade_object.fill_price * trade_object.quantity * trade_object.maker_fee * (referral_percentage / 100)))
        //       collectCoin = trade_object.currency;
        //       coinData = await Coins.findOne({
        //         is_active: true,
        //         deleted_at: null,
        //         coin: trade_object.currency
        //       });
        //       addRefferalAddData.coin_id = coinData.id;
        //       addRefferalAddData.amount = collectedAmount;
        //       addRefferalAddData.coin_name = collectCoin;
        //       addRefferalAddData.user_id = referredUserData.id;
        //       addRefferalAddData.referred_user_id = referralData.id;
        //       addRefferalAddData.txid = inputs.transaction_id;
        //       addRefferalAddData.is_collected = false;

        //       var addedData = await Referral.create(addRefferalAddData);

        //     } else if (trade_object.side == 'Sell') {
        //       collectedAmount = parseFloat(trade_object.maker_fee + (trade_object.quantity * trade_object.maker_fee * (referral_percentage / 100)))
        //       collectCoin = trade_object.settle_currency;
        //       coinData = await Coins.findOne({
        //         is_active: true,
        //         deleted_at: null,
        //         coin: trade_object.settle_currency
        //       });
        //       addRefferalAddData.coin_id = coinData.id;
        //       addRefferalAddData.amount = collectedAmount;
        //       addRefferalAddData.coin_name = collectCoin;
        //       addRefferalAddData.user_id = referredUserData.id;
        //       addRefferalAddData.referred_user_id = referralData.id;
        //       addRefferalAddData.txid = inputs.transaction_id;
        //       addRefferalAddData.is_collected = false;

        //       var addedData = await Referral.create(addRefferalAddData);
        //     }
        //   }
        // } else 
        if (trade_object[0].flag == 1) {
          if (trade_object[0].side == 'Buy') {
            collectedAmount = parseFloat((trade_object[0].faldax_fees * (referral_percentage / 100)))
            let {
              crypto,
              currency
            } = await sails
              .helpers
              .utilities
              .getCurrencies((trade_object[0].symbol).replace("/", '-'));
            collectCoin = crypto
            coinData = await Coins.findOne({
              is_active: true,
              deleted_at: null,
              coin: collectCoin
            });
            addRefferalAddData.coin_id = coinData.id;
            addRefferalAddData.amount = collectedAmount;
            addRefferalAddData.coin_name = collectCoin;
            addRefferalAddData.user_id = referredUserData.id;
            addRefferalAddData.referred_user_id = referralData.id;
            addRefferalAddData.txid = inputs.transaction_id;
            addRefferalAddData.is_collected = false;

            var addedData = await Referral.create(addRefferalAddData);
          } else if (trade_object[0].side == 'Sell') {
            collectedAmount = parseFloat((trade_object[0].faldax_fees * (referral_percentage / 100)))
            let {
              crypto,
              currency
            } = await sails
              .helpers
              .utilities
              .getCurrencies((trade_object[0].symbol).replace("/", '-'));
            collectCoin = currency
            coinData = await Coins.findOne({
              is_active: true,
              deleted_at: null,
              coin: collectCoin
            });
            addRefferalAddData.coin_id = coinData.id;
            addRefferalAddData.amount = collectedAmount;
            addRefferalAddData.coin_name = collectCoin;
            addRefferalAddData.user_id = referredUserData.id;
            addRefferalAddData.referred_user_id = referralData.id;
            addRefferalAddData.txid = inputs.transaction_id;
            addRefferalAddData.is_collected = false;

            var addedData = await Referral.create(addRefferalAddData);
          }
        }
        var userNotification = await UserNotification.find({
          user_id: referredUserData.id,
          deleted_at: null,
          slug: 'referal'
        });

        if (userNotification && userNotification != undefined) {
          if (userNotification.email == true || userNotification.email == "true") {
            await sails.helpers.notification.send.email("thresold_notification", referredUserData)
          }
          if (userNotification.text == true || userNotification.text == "true") {
            await sails.helpers.notification.send.text("thresold_notification", referredUserData)
          }
        }
      }
      return exits.success(1)

    } catch (err) {
      console.log(err);
    }

  }

};
