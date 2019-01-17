module.exports = {

  friendlyName: 'Update',

  description: 'Update trade.',

  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'id of trade.',
      required: true
    },
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
    user_fee: {
      type: 'number',
      example: 1,
      description: 'Fee applied on users trade',
      required: true
    },
    requested_fee: {
      type: 'number',
      example: 1,
      description: 'Fees applied on requeted users trade',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    error: {
      description: 'Error'
    }

  },

  fn: async function (inputs) {

    let tradehistory = await TradeHistory
      .update({ id: inputs.id })
      .set({ user_fee: inputs.user_fee, requested_fee: inputs.requested_fee, user_coin: inputs.crypto, requested_coin: inputs.currency })
      .fetch();
    return exits.success(tradehistory);
  }

};
