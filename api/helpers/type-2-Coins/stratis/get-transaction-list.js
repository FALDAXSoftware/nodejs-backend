module.exports = {

  friendlyName: 'Get transaction list',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'BTC',
      description: 'coin code of coin',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Transaction list'
    }
  },

  fn: async function (inputs) {

    //list Transactions
    var listTransactions;

    //Encode rpcuser and rpcpasword for authorization
    var encodeData = await sails
      .helpers
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    
    // Body Data for getting transaction
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '0',
      'method': 'listtransactions'
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
          listTransactions = resData;
        })
      // TODO Send back the result through the success exit.
      return exits.success(listTransactions);
    } catch (err) {
      console.log(err);
    }

  }

};
