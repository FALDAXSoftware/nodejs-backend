const request = require('request');
module.exports = {
  friendlyName: 'Buy Order',
  description: '',
  inputs: {
    order_object: {
      type: 'json',
      example: '{}',
      description: 'Unique identifier for the order assigned by the customer'
    },
    // HandlInst: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Instructions for handling the order',
    //   required: true
    // },
    // Symbol: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Currency pair for the order',
    //   required: true
    // },
    // Side: {
    //   type: 'string',
    //   example: '112',
    //   description: '1 (Buy): The customer buys Currency (#15). 2 (Sell): The customer sells Currency (#15).',
    //   required: true
    // },
    // OrderQty: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Order quantity. Must be a positive number',
    //   required: true
    // },
    // OrdType: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Type of order',
    //   required: true
    // },
    // Currency: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Identifies currency used for prices',
    //   required: true
    // },
    // ExecInst: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Specifies the liquidity that should be used for executing the order.',
    //   required: true
    // },
    // TimeInForce: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Specifies how long the order remains in effect',
    //   required: true
    // },
    // SecurityType: {
    //   type: 'string',
    //   example: '112',
    //   description: 'Indicates type of security',
    //   required: true
    // },
    // Product: {
    //   type: 'string',
    //   example: '112',
    //   description: 'The asset class',
    //   required: true
    // }
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
    console.log("inputs.order_object", inputs.order_object)
    request({
      url: sails.config.local.JST_ORDER_URL + '/api/Order/CreateOrder',
      method: "POST",
      headers: {
        // 'cache-control': 'no-cache',
        // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: (inputs.order_object),
      json: true
    }, async function (err, httpResponse, body) {
      console.log("err", err);
      if (err || body == null) {
        var data = {
          status: 0,
          data: body
        }
        return exits.error(data);
      }
      // if (body.error) {
      //   return exits.error(body);
      // }


      if (body.ExecType == "F" || body.ExecType == "4") {
        var data = {
          status: 1,
          data: body
        }
        // return exits.error(data);
      } else {
        var data = {
          status: 0,
          data: body
        }
      }

      return exits.success(data);
    });

  }


};
