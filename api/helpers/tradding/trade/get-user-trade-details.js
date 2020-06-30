module.exports = {

  friendlyName: 'Get User trade details',

  description: '',

  inputs: {
    userData: {
      type: 'json',
      example: '{}',
      description: 'JSON object for which the value needs to be obtained'
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
    let userData = inputs.userData;
    let user_id = userData.id;
    let countOnly = inputs.countOnly;
    if (countOnly) {
      tradeDetails = await TradeHistory.count({
        where: {
          deleted_at: null,
          user_id: user_id
        }
      })
    } else {
      let query = `SELECT
                    SUM((CASE
                      WHEN side='Buy' THEN ((quantity)*Cast(fiat_values->>'asset_1_usd' as double precision))
                      WHEN side='Sell' THEN ((quantity*fill_price)*Cast(fiat_values->>'asset_2_usd' as double precision))
                    END)) as total_amount
                    FROM trade_history
                    WHERE (user_id=${user_id} OR requested_user_id = ${user_id}) AND deleted_at IS null`;
      let tradeData = await sails.sendNativeQuery(query, [])
      tradeData = tradeData.rows;
      tradeDetails = tradeData;
    }
    // Send back the result through the success exit.
    return exits.success(tradeDetails);

  }

};
