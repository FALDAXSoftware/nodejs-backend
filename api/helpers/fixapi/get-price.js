module.exports = {
  friendlyName: 'Get JST Price',
  description: '',
  inputs: {
    coin: {
      type: 'string',
      example: 'XRP',
      description: 'coin',
      required: true
    },
    side: {
      type: 'string',
      example: 'Buy',
      description: 'Buy or Sell',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Price',
    },
    error: {
      description: 'Something Error'
    }
  },

  fn: async function (inputs, exits) {
    var coin = inputs.coin + '/USD'
    var which_price={};
    var query = {};
    query.coin = coin;
    if( inputs.side == "Buy" ){
      query.ask_price ={'>':0} ;
    }else{
      query.bid_price ={'>':0};
    }

    var get_price = await PriceHistory.find({
      where: query,
    }).sort('id DESC').limit(1)

    // TODO Send back the result through the success exit.
    return exits.success(get_price);
  }


};
