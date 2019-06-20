var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Send funds',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'BTC',
      description: 'coin code of coin',
      required: true
    },
    address: {
      type: 'string',
      example: 'VvKJ28dvb1Y2NpRNQz7kSvkoNbS4VQ32hb',
      description: 'Address to which it needs to be send',
      required: true
    },
    amount: {
      type: 'number',
      example: 0.1,
      description: 'amount of coin',
      required: true
    },
    message: {
      type: 'string',
      example: 'donation',
      description: 'Reason for sending coin',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {

    //Send Coin Method
    var sendedFundStatus;

    //Encode rpcuser and rpcpasword for authorization
    var encodeData = await sails
      .helpers
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    
    //Body Data for sending funds
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '0',
      'method': 'sendtoaddress',
      'params': '[' + inputs.address + ',' + inputs.amount + ',' + inputs.message + ']'
    }
    try {
      await fetch(sails.config.local.coinArray[inputs.coin_code].url, {
        method: 'POST',
        body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + encodeData
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          sendedFundStatus = resData;
        })
      // TODO Send back the result through the success exit.
      return exits.success(sendedFundStatus);
    } catch (err) {
      console.log(err);
    }
  }

};
