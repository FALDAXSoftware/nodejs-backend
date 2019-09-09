var blackcoin = require('node-blackcoin');
module.exports = {

  friendlyName: 'Blackcoin get transaction',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'BTC',
      description: 'coin code of coin',
      required: true
    },
    transaction_id: {
      type: 'string',
      example: '6e48a33c6d18dd09d71ead0f607954d19ec2fa486c28dd6722a674330fdaf289',
      description: 'Address to which it needs to be send',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs) {
    try {
      var batch = [];
      var userAddress;

      //Blackcoin npm package connection
      var client = new blackcoin.Client({
        host: sails.config.local.coinArray[inputs.coin_code].url,
        port: 80,
        user: sails.config.local.coinArray[inputs.coin_code].rpcuser,
        pass: sails.config.local.coinArray[inputs.coin_code].rpcpassword,
        timeout: 30000
      });

      //Get Transaction for provided hash
      batch.push({
        method: 'gettransaction',
        params: [inputs.transaction_id]
      });

      await client.cmd(batch, function (err, info) {
        if (err)
          return console.log(err);
        return exits.success(info);
      });

    } catch (err) {
      console.log(err);
    }
  }

};
