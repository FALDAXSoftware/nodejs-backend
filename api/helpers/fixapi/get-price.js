module.exports = {
  friendlyName: 'Get JST Price',
  description: '',
  inputs: {
    coin: {
      type: 'string',
      example: 'XRP',
      description: 'coin',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Price',
    },
    error: {
      description: 'Something Error'
    }
  },

  fn: async function (inputs, exits) {
    var coin = inputs.coin + '/USD'
    var get_price = await PriceHistory.find({
      where: {
        coin: coin
      },
    }).sort('id DESC').limit(1)

    // TODO Send back the result through the success exit.
    return exits.success(get_price);
  }


};
