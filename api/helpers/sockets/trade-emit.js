module.exports = {

  friendlyName: 'Trade emit',

  description: '',

  inputs: {
    crypto: {
      type: 'string',
      example: 'BTC',
      description: 'Code of Crypto.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'ETH',
      description: 'Code of Currency.',
      required: true
    },
    userIds: {
      type: 'ref',
      required: false,
      defaultsTo: []
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    let buyBookDetails = await sails
      .helpers
      .tradding
      .buy
      .getBuyBookOrders(inputs.crypto, inputs.currency);
    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "buybookUpdate", buyBookDetails);

    let sellBookDetails = await sails
      .helpers
      .tradding
      .sell
      .getSellBookOrders(inputs.crypto, inputs.currency);
    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "sellbookUpdate", sellBookDetails);
    let tradeDetails = await sails
      .helpers
      .tradding
      .trade
      .getTradeDetails(inputs.crypto, inputs.currency, 100);
    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "tradehistoryUpdate", tradeDetails);
    let cardDate = await sails
      .helpers
      .dashboard
      .getCardData(inputs.crypto + "-" + inputs.currency);
    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "cardDataUpdate", cardDate);
    let depthChartData = await sails
      .helpers
      .chart
      .getDepthChartDetail(inputs.crypto, inputs.currency);
    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "depthChartUpdate", depthChartData);
    var cryptoInstrumentUpdate = await sails
      .helpers
      .tradding
      .getInstrumentData(inputs.currency);
    sails
      .sockets
      .broadcast(inputs.currency, "instrumentUpdate", cryptoInstrumentUpdate);
    // Get only unique user ids
    var filteredUsers = inputs
      .userIds
      .filter(function (item, pos) {
        return inputs
          .userIds
          .indexOf(item) == pos;
      });
    // Broadcast balance update for all user
    for (let index = 0; index < filteredUsers.length; index++) {
      const element = filteredUsers[index];
      let userBalanceDetails = await sails
        .helpers
        .tradding
        .getUserWalletBalance(element, inputs.currency, inputs.crypto);
      sails
        .sockets
        .broadcast(inputs.crypto + "-" + inputs.currency + "-" + element, "walletBalanceUpdate", userBalanceDetails);
    }

    sails
      .sockets
      .broadcast(inputs.crypto + "-" + inputs.currency, "orderUpdated", {
        crypto: inputs.crypto,
        currency: inputs.currency
      });
    return exits.success();
  }

};
