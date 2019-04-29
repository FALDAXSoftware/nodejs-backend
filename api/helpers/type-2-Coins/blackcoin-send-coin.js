var blackcoin = require('node-blackcoin');
module.exports = {

  friendlyName: 'Blackcoin send coin',

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
      required: false
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

      batch.push({
        method: 'sendtoaddress',
        params: [inputs.address, inputs.amount]
      });

      await client.cmd(batch, function (err, info) {
        if (err) 
          return console.log(err);
        console.log('Information:', info);
        return exits.success(info);
      });

    } catch (err) {
      console.log(err);
    }
  }

};
