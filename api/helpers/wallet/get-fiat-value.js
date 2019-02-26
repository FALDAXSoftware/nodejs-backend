module.exports = {

  friendlyName: 'Get fiat value',

  description: '',

  inputs: {
    currency: {
      type: 'string',
      example: 'USD',
      description: 'Fiat currency',
      required: true
    },
    amount: {
      type: 'number',
      example: 1,
      description: 'Amount to be converted',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Fiat value'
    }
  },

  fn: async function (inputs, exits) {

    // Get fiat value.
    var fiatValue;
    // TODO Send back the result through the success exit.
    fetch('https://pro-api.coinmarketcap.com/v1/tools/price-conversion?amount=' + inputs.amount + '&symbol=' + inputs.currency + 'BTC&convert=USD', {
        method: "GET",
        headers: {
          'X-CMC_PRO_API_KEY': process.env.MARKETPRICE
        }
      })
      .then(resData => resData.json())
      .then(resData => {
        fiatValue = resData;
      })

    return exits.success(fiatValue);

  }

};
