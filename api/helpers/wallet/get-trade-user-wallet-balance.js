module.exports = {

  friendlyName: 'Get Trade user wallet balance',

  description: '',

  inputs: {
    user_id: {
      type: 'string',
      example: '1',
      description: 'User id',
      required: true
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'Fiat value'
    }
  },

  fn: async function (inputs, exits) {
    let user_id = inputs.user_id;
    /* Get Current price of Currency */
    let query = `SELECT sum(w.balance* cast(cc.quote::json->'USD' ->> 'price' as double precision)) as total_balance_fiat
                FROM wallets w
                INNER JOIN currency_conversion cc
                ON w.coin_id=cc.coin_id
                WHERE w.user_id=${user_id} AND w.deleted_at is null`;
    let tradeData = await sails.sendNativeQuery(query, [])
    tradeData = tradeData.rows;
    tradeDetails = tradeData;
    return exits.success(tradeDetails);

  }

};
