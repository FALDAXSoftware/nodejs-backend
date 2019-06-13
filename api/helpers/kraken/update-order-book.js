module.exports = {


  friendlyName: 'Update order book',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let pairs = await pairs.find({
      deleted_at: null,
      is_active: true
    });
    for (let index = 0; index < pairs.length; index++) {
      const element = pairs[index];
      await sails.helpers.kraken.getOrderBook(element.symbol, element.kraken_pair);
    }
    exits.success();
  }


};

