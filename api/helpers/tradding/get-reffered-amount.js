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

      var referral_percentage = 0;
      var trade_object = inputs.trade_object;

      var collectedAmount = 0;
      var collectCoin;
      var coinData;
      var referralData = await Users.findOne({deleted_at: null, is_active: true, id: inputs.user_id});
      var referredUserData = await Users.findOne({deleted_at: null, is_active: true, id: referralData.referred_id});
      var addRefferalAddData = {};

      if (referredUserData !== undefined) {
        referral_percentage = parseFloat(referredUserData.referal_percentage);
      } else {
        var referal_data = await AdminSetting.findOne({deleted_at: null, slug: 'default_referral_percentage'});
        referral_percentage = parseFloat(referal_data.value);
      }

      if (trade_object.user_id == inputs.user_id) {
        if (trade_object.side == 'Buy') {
          collectedAmount = parseFloat(trade_object.taker_fee + (trade_object.quantity * trade_object.taker_fee * (referral_percentage / 100)))
          collectCoin = trade_object.settle_currency;
          coinData = await Coins.findOne({is_active: true, deleted_at: null, coin: trade_object.settle_currency});
          addRefferalAddData.coin_id = coinData.id;
          addRefferalAddData.amount = collectedAmount;
          addRefferalAddData.coin_name = collectCoin;
          addRefferalAddData.user_id = referredUserData.id;
          addRefferalAddData.referred_user_id = referralData.id;
          addRefferalAddData.txid = inputs.transaction_id;
          addRefferalAddData.is_collected = false;

          var addedData = await Referral.create(addRefferalAddData);
        } else if (trade_object.side == 'Sell') {
          collectedAmount = parseFloat(trade_object.taker_fee + (trade_object.fill_price * trade_object.quantity * trade_object.taker_fee * (referral_percentage / 100)))
          collectCoin = trade_object.currency;
          coinData = await Coins.findOne({is_active: true, deleted_at: null, coin: trade_object.currency});
          addRefferalAddData.coin_id = coinData.id;
          addRefferalAddData.amount = collectedAmount;
          addRefferalAddData.coin_name = collectCoin;
          addRefferalAddData.user_id = referredUserData.id;
          addRefferalAddData.referred_user_id = referralData.id;
          addRefferalAddData.txid = inputs.transaction_id;
          addRefferalAddData.is_collected = false;

          var addedData = await Referral.create(addRefferalAddData);
        }
      } else if (trade_object.requested_user_id == inputs.user_id) {
        if (trade_object.side == 'Buy') {
          collectedAmount = parseFloat(trade_object.maker_fee + (trade_object.fill_price * trade_object.quantity * trade_object.maker_fee * (referral_percentage / 100)))
          collectCoin = trade_object.currency;
          coinData = await Coins.findOne({is_active: true, deleted_at: null, coin: trade_object.currency});
          addRefferalAddData.coin_id = coinData.id;
          addRefferalAddData.amount = collectedAmount;
          addRefferalAddData.coin_name = collectCoin;
          addRefferalAddData.user_id = referredUserData.id;
          addRefferalAddData.referred_user_id = referralData.id;
          addRefferalAddData.txid = inputs.transaction_id;
          addRefferalAddData.is_collected = false;

          var addedData = await Referral.create(addRefferalAddData);

        } else if (trade_object.side == 'Sell') {
          collectedAmount = parseFloat(trade_object.maker_fee + (trade_object.quantity * trade_object.maker_fee * (referral_percentage / 100)))
          collectCoin = trade_object.settle_currency;
          coinData = await Coins.findOne({is_active: true, deleted_at: null, coin: trade_object.settle_currency});
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

      return exits.success(1)

    } catch (err) {
      console.log(err);
    }

  }

};
