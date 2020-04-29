module.exports = {

  friendlyName: 'Get User trade details',

  description: '',

  inputs: {
    user_id: {
      type: 'string',
      example: '1',
      description: 'User Id',
      required: true
    },
    countOnly: {
      type: 'boolean',
      example: true,
      description: 'Get only Counts',
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
    let user_id = inputs.user_id;
    let countOnly = inputs.countOnly;
    if( countOnly ){
      tradeDetails = await TradeHistory.count({
        where: {
          deleted_at: null,
          user_id: user_id
        }
      })
    }else{
      tradeDetails = await TradeHistory.find({
        where: {
          deleted_at: null,
          user_id: user_id
        }
      })
    }
    // Send back the result through the success exit.
    return exits.success(tradeDetails);

  }

};
