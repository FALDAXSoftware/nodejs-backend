module.exports = {


  friendlyName: 'Get depth chart detail',


  description: '',


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
      outputFriendlyName: 'Depth chart detail',
    },

  },


  fn: async function (inputs, exits) {

    // Get depth chart detail.
    var depthChartDetail;
    // TODO

    var buyDetails = await buyBook.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency
      },
      sort: 'price DESC'
    })

    var sellDetails = await sellBook.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency
      },
      sort: 'price ASC'
    });

    depthChartDetail

    // Send back the result through the success exit.
    return depthChartDetail;

  }


};

