var blackcoin = require('node-blackcoin');
module.exports = {

  friendlyName: 'Blackcoin get info',

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

      batch.push({method: 'getinfo'});

      await client.cmd(batch, function (err, info) {
        if (err) 
          return console.log(err);
        console.log('Information:', info);
        return exits.success(info);
        // userAddress = address;
      });
      // console.log("Outside Address :: ", userAddress);
    } catch (err) {
      console.log(err);
    }
  }

};
