var moment = require('moment');

module.exports = {

  friendlyName: 'Get trade pending detaiails',

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
      outputFriendlyName: 'Trade pending detaiails'
    }
  },

  fn: async function (inputs, exits) {

    // Get trade pending detaiails.
    var tradePendingDetails;
    // TODO
    var yesterday = moment
      .utc()
      .subtract(inputs.month, 'months')
      .format();
    var pendingOrderDetails = await PendingBook.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        user_id: inputs.user_id,
        created: {
          '>=': yesterday
        }
      },
      sort: 'id DESC'
    });

    var buyBookDetails = await buyBookDetails.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        user_id: inputs.user_id,
        is_partially_fulfilled: true,
        created: {
          '>=': yesterday
        }
      },
      sort: 'id DESC'
    });

    var pendingDetailsBuy = pendingOrderDetails.concat(buyBookDetails);

    var sellBookDetails = await sellBookDetails.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency,
        user_id: inputs.user_id,
        is_partially_fulfilled: true,
        created: {
          '>=': yesterday
        }
      },
      sort: 'id DESC'
    });

    tradePendingDetails = pendingDetailsBuy.concat(sellBookDetails);
    // Send back the result through the success exit.
    return exits.success(tradePendingDetails);

  }

};
