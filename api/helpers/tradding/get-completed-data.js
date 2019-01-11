module.exports = {

  friendlyName: 'Get completed data',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'id of user',
      required: true
    },
    crypto: {
      type: 'string',
      example: 'ETH',
      description: 'Name of cryptocurrency',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Name of currency',
      required: true
    },
    month: {
      type: 'number',
      example: 1,
      description: 'Number of months',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Completed data'
    }
  },

  fn: async function (inputs, exits) {

    // Get completed data.
    var completedData;

    var yesterday = moment
      .utc()
      .subtract(inputs.month, 'months')
      .format();

    completedData = await TradeHistory.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        created: {
          '>=': yesterday
        }
      }
    })

    return exits.success(completedData);

  }

};
