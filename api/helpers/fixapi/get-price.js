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
    var get_price = await PriceHistory.findOne({
      where: {
        coin: inputs.coin
      },
      sort: 'created_at DESC'
    })

    // TODO Send back the result through the success exit.
    return exits.success(get_price);
  }


};

