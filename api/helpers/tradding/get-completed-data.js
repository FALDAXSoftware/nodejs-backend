var moment = require('moment');

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

    // Get Trade completed data for particular user and pair
    completedData = await TradeHistory.find({
      select: [
        'id',
        'fix_quantity',
        'quantity',
        'fill_price',
        'side',
        'order_type',
        'symbol',
        'created_at',
        'deleted_at',
        'limit_price',
        'settle_currency',
        'currency'
      ],
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        created_at: {
          '>=': yesterday
        },
        or: [{
          user_id: inputs.user_id
        }, {
          requested_user_id: inputs.user_id
        }]
      },
      sort: 'id DESC'
    })

    return exits.success(completedData);

  }

};
