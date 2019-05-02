var Tx = require('ethereumjs-tx');
//var Web3 = require('web3');
//var Accounts = require('web3-eth-accounts');
module.exports = {

  friendlyName: 'Ethereum classic send funds',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'ETC',
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
      var accounts = null;
      // var web3 = null;
      // var tokenContract = null;
      // var gasPriceGwei = 41;
      // var gasLimit = 52000;
      // web3 = new Web3(new Web3.providers.HttpProvider(sails.config.local.coinArray[inputs.coin_code].url));
      // // Fetching from address from database Converting amount of tokens in big number
      // var tokens = web3
      //   .utils
      //   .toWei(inputs.amount.toString(), 'ether')

      // console.log(tokens);

      // web3
      //   .eth
      //   .sendTransaction({ from: '0xFC8D2a662AEc4C2115506e19aE25473dCdc2fBa3', to: inputs.address, value: tokens })
      //   .on('transactionHash', function (hash) {
      //     console.log(hash)
      //     return exits.success(hash);
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     return exits.success(err);
      //   })

    } catch (err) {
      console.log(err);
    }
  }

};
