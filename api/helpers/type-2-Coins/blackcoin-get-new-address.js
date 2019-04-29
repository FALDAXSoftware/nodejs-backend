var blackcoin = require('node-blackcoin');
module.exports = {

  friendlyName: 'Blackcoin get new address',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'BLK',
      description: 'coin code of coin',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      var batch = [];
      var userAddress;
      var client = new blackcoin.Client({
        host: sails.config.local.coinArray[inputs.coin_code].url,
        port: 80,
        user: sails.config.local.coinArray[inputs.coin_code].rpcuser,
        pass: sails.config.local.coinArray[inputs.coin_code].rpcpassword,
        timeout: 30000
      });

      batch.push({method: 'getnewaddress', params: ['myaccount']});

      await client.cmd(batch, function (err, address) {
        if (err) 
          return console.log(err);
        console.log('Address:', address);
        return exits.success(address);
        // userAddress = address;
      });
      // console.log("Outside Address :: ", userAddress);
    } catch (err) {
      console.log(err);
    }
  }

};
