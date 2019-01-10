module.exports = {


  friendlyName: 'Gecancel pending data',


  description: '',


  inputs: {
    side: {
      type: 'string',
      example: 'Buy/Sell',
      description: 'side for pending order',
      required: true
    },
    type: {
      type: 'string',
      example: 'Limit/Stop Limit',
      description: 'Type of order',
      required: true
    },
    id: {
      type: 'number',
      example: 1,
      description: 'Id for Order to be deleted',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    // TODO

    if(inputs.type == "Limit" && inputs.side == "Buy"){

    }

  }


};

