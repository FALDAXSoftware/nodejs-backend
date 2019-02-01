var moment = require('moment');

module.exports = {

  friendlyName: 'Gecancel pending data',

  description: '',

  inputs: {
    side: {
      type: 'string',
      example: 'Buy/Sell',
      description: 'side for pending order',
      required: true
    },
    type: {
      type: 'string',
      example: 'Limit/Stop Limit',
      description: 'Type of order',
      required: true
    },
    id: {
      type: 'number',
      example: 1,
      description: 'Id for Order to be deleted',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    noBuyLimitOrder: {
      description: "no buy limit order found"
    },
    serverError: {
      description: "server error"
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      var deletePending;
      var now = moment().format();
      if (inputs.type == "Limit" && inputs.side == "Buy") {
        var pendingBookDetailsBuy = await buyBook.findOne({
          where: {
            deleted_at: null,
            id: inputs.id
          }
        });

        var fees = await sails
          .helpers
          .utilities
          .getMakerTakerFees(pendingBookDetailsBuy.settle_currency, pendingBookDetailsBuy.currency);
        var coinId = await Coins.findOne({
          where: {
            coin: pendingBookDetailsBuy.currency,
            deleted_at: null
          }
        });

        var walletDetails = await Wallet.findOne({
          where: {
            user_id: pendingBookDetailsBuy.user_id,
            coin_id: coinId.id,
            deleted_at: null
          }
        });

        var userPlacedBalance = walletDetails.placed_balance + (pendingBookDetailsBuy.price * pendingBookDetailsBuy.quantity);

        var updateWalletDetails = await Wallet
          .update({ user_id: pendingBookDetailsBuy.user_id, coin_id: coinId.id })
          .set({ placed_balance: userPlacedBalance });

        if (pendingBookDetailsBuy.length === 0) {
          // throw("No buy limit order found.")
          return exits.noBuyLimitOrder();
        }

        var activityCancel = await ActivityTable
          .update({ id: pendingBookDetailsBuy.activity_id })
          .set({ is_cancel: true });

        deletePending = await buyBook
          .update({ id: inputs.id })
          .set({ deleted_at: now })
          .fetch();

      } else if (inputs.type == "Limit" && inputs.side == "Sell") {
        var pendingBookDetailsSell = await sellBook.findOne({
          where: {
            deleted_at: null,
            id: inputs.id
          }
        });

        var fees = await sails
          .helpers
          .utilities
          .getMakerTakerFees(pendingBookDetailsSell.settle_currency, pendingBookDetailsSell.currency);

        var coinId = await Coins.findOne({
          where: {
            coin: pendingBookDetailsSell.settle_currency,
            deleted_at: null
          }
        });

        var walletDetails = await Wallet.findOne({
          where: {
            user_id: pendingBookDetailsSell.user_id,
            coin_id: coinId.id,
            deleted_at: null
          }
        });

        var userPlacedBalance = walletDetails.placed_balance + (pendingBookDetailsSell.quantity);

        var updateWalletDetails = await Wallet
          .update({ user_id: pendingBookDetailsSell.user_id, coin_id: coinId.id })
          .set({ placed_balance: userPlacedBalance });

        if (pendingBookDetailsSell.length === 0) {
          // throw("No buy limit order found.")
          return exits.noBuyLimitOrder();

        }

        var activityCancel = await ActivityTable
          .update({ id: pendingBookDetailsSell.activity_id })
          .set({ is_cancel: true });

        deletePending = await sellBook
          .update({ id: inputs.id })
          .set({ deleted_at: now })
          .fetch();

      } else {
        var pendingDetails = await PendingBook.findOne({
          where: {
            id: inputs.id,
            deleted_at: null
          }
        });

        console.log(pendingDetails);

        if (pendingDetails == undefined || pendingDetails.length == 0) {
          // throw("No pending order found.")
          return exits.noBuyLimitOrder();

        }

        deletePending = await PendingBook
          .update({ id: inputs.id })
          .set({ deleted_at: now })
          .fetch();
      }
      if (deletePending) {
        return exits.success("Deleted Successfully")
      } else {
        // throw "Server Error";
        return exits.serverError();
      }
    } catch (err) {
      console.log(err);
      return exits.serverError();
    }

  }

};
