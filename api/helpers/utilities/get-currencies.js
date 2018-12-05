module.exports = {


  friendlyName: 'Get currencies',


  description: 'Get Currencies From Symbol',


  inputs: {
    symbol: {
      type: 'string',
      example: 'BTC-ETH',
      description: 'Combination of Crypto-Currency.',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Currencies',
    },

  },


  fn: async function (inputs, exits) {

    // Get currencies.
    var currencies;
    // TODO
    var data = inputs.symbol.split("-");
    currencies = {
      crypto: data[0],
      currency: data[1]
    }
    // Send back the result through the success exit.
    return exits.success(currencies);

  }


};

