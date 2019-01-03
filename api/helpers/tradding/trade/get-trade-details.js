module.exports = {

  friendlyName: 'Get trade details',

  description: '',

  inputs: {
    settle_currency: {
      type: 'string',
      example: 'ETH',
      description: 'Name of cryptocurrency.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Name of currency.',
      required: true
    },
    limit: {
      type: 'number',
      example: 1,
      description: 'No of records needed',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Trade details'
    }
  },

  fn: async function (inputs, exits) {

    // Get trade details.
    var tradeDetails;
    // TODO

    console.log(inputs);

    tradeDetails = await TradeHistory.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.settle_currency,
        currency: inputs.currency
      },
      sort: 'id DESC',
      limit: inputs.limit
    })

    // Send back the result through the success exit.
    return exits.success(tradeDetails);

  }

};
