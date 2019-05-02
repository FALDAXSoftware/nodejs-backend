var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var Accounts = require('web3-eth-accounts');
module.exports = {

  friendlyName: 'Ethereum classic get address',

  description: 'Ethereum Classic method for account creation',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'ETC',
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
      var accounts = null;
      var web3 = null;

      //Gas price value
      var gasPriceGwei = 41;

      //Maximum gas amount to be paid
      var gasLimit = 52000;

      //Providing the web3 providers for ethereum classic
      web3 = new Web3(new Web3.providers.HttpProvider(sails.config.local.coinArray[inputs.coin_code].url));

      //Ethereum classic account creation
      var data = await web3
        .eth
        .accounts
        .create()

      // Here we need to store the private key which would be available by
      // data.privateKey
      return exits.success(data.address);
    } catch (err) {
      console.log(err);
    }
  }

};
