var moment = require('moment');

module.exports = {

  friendlyName: 'Get cancel details',

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
      outputFriendlyName: 'Cancel details'
    }
  },

  fn: async function (inputs, exits) {

    // Get cancel details.
    var cancelDetails;

    var yesterday = moment
      .utc()
      .subtract(inputs.month, 'months')
      .format();

    cancelDetails = await ActivityTable.find({
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
        'limit_price'
      ],
      where: {
        is_cancel: true,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        created_at: {
          '>=': yesterday
        }
      },
      sort: 'id DESC'
    });
    // TODO Send back the result through the success exit.
    return exits.success(cancelDetails);

  }

};
