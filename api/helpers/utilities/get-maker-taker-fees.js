module.exports = {


  friendlyName: 'Get maker taker fees',


  description: 'Get maker taker fees',


  inputs: {
    crypto: {
      type: 'string',
      example: 'BTC',
      description: 'Code of Crypto.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'ETH',
      description: 'Code of Currency.',
      required: true
    },
  },


  exits: {
    success: {
      outputFriendlyName: 'Maker taker fees',
    },

  },


  fn: async function (inputs, exits) {

    // Get maker taker fees.
    var makerTakerFees = {};
    // TODO
    let coin1 = await Coins.findOne({
      coin: inputs.crypto,
      deleted_at: null
    });
    let coin2 = await Coins.findOne({
      coin: inputs.currency,
      deleted_at: null
    });

    if (coin1 && coin2) {
      let pair = await Pairs.findOne({
        coin_code1: coin1.id,
        coin_code2: coin2.id,
        deleted_at: null
      });

      if (pair) {
        makerTakerFees = {
          makerFee: pair.maker_fee,
          takerFee: pair.taker_fee
        }
      }
    }
    // Send back the result through the success exit.
    return exits.success(makerTakerFees);

  }


};

