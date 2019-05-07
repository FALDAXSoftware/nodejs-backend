/**
 * Type2Coin Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // ---------------------------Web Api------------------------------ Get Coin

  /**
    * API for getting coin information
    * Renders this api when coin info needs to be fetched
    *
    * @param <coin_code>
    *
    * @return <Coin node Info or error data>
   */

  getCoinInfo: async function (req, res) {
    try {
      var {coin_code} = req.allParams();
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 1) {
        getInfo = await sails
          .helpers
          .type2Coins
          .stratis
          .getInfo(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 2) {
        getInfo = await sails
          .helpers
          .type2Coins
          .blackcoinGetInfo(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 5) {
        getInfo = await sails
          .helpers
          .type2Coins
          .iotaGetInfo(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 7) {
        getInfo = await sails
          .helpers
          .type2Coins
          .tetherGetInfo(coin_code);
      }

      return res.json({
        "status": 200,
        "message": sails.__("node info retrieval success"),
        "data": getInfo
      });
    } catch (err) {
      console.log(err);
    }

  },

  /**
    * API for getting coin address for user
    * Renders this api when coin address needs to be generated
    *
    * @param <coin_code>
    *
    * @return <Coin address generated or error data>
   */

  getCoinNewAddress: async function (req, res) {
    try {
      var {coin_code} = req.allParams();
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 1) {
        getInfo = await sails
          .helpers
          .type2Coins
          .stratis
          .getNewAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 2) {
        getInfo = await sails
          .helpers
          .type2Coins
          .blackcoinGetNewAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 3) {
        getInfo = await sails
          .helpers
          .type2Coins
          .neoGetNewAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 4) {
        getInfo = await sails
          .helpers
          .type2Coins
          .ethereumClassicGetAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 5) {
        getInfo = await sails
          .helpers
          .type2Coins
          .iotaGetNewAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 6) {
        getInfo = await sails
          .helpers
          .type2Coins
          .lbryGetNewAddress(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 7) {
        getInfo = await sails
          .helpers
          .type2Coins
          .tetherGetNewAddress(coin_code);
      }

      return res.json({
        "status": 200,
        "message": sails.__("address create success"),
        "data": getInfo
      });
    } catch (err) {
      console.log(err);
    }

  },

  /**
    * API for getting transaction list
    * Renders this api when coin transaction list needs to be fetched
    *
    * @param <coin_code>
    *
    * @return <Coin node transaction list or error data>
   */

  getTransactionList: async function (req, res) {
    try {
      var {coin_code} = req.allParams();
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 1) {
        getInfo = await sails
          .helpers
          .type2Coins
          .stratis
          .getTransactionList(coin_code);
      } else if (sails.config.local.coinArray[coin_code].type == 2) {}

      return res.json({
        "status": 200,
        "message": sails.__("transaction list success"),
        "data": getInfo
      });
    } catch (err) {
      console.log(err);
    }

  },

  /**
    * API for sending coin to another address
    * Renders this api when coin needs to be send to other address
    *
    * @param <coin_code, to_address, amount, message>
    *
    * @return <success message for coin sending or error>
   */

  sendCoin: async function (req, res) {
    try {
      var {coin_code, to_address, amount, message} = req.body;
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 1) {
        getInfo = await sails
          .helpers
          .type2Coins
          .stratis
          .sendFunds(coin_code, to_address, amount, message);
      } else if (sails.config.local.coinArray[coin_code].type == 2) {
        getInfo = await sails
          .helpers
          .type2Coins
          .stratis
          .blackcoinSendCoin(coin_code, to_address, amount, message);
      } else if (sails.config.local.coinArray[coin_code].type == 3) {
        getInfo = await sails
          .helpers
          .type2Coins
          .neoSendCoin(coin_code, to_address, amount, message);
      } else if (sails.config.local.coinArray[coin_code].type == 4) {
        getInfo = await sails
          .helpers
          .type2Coins
          .ethereumClassicSendFunds(coin_code, to_address, amount, message);
      } else if (sails.config.local.coinArray[coin_code].type == 6) {
        getInfo = await sails
          .helpers
          .type2Coins
          .lbryGetSendCoin(coin_code, to_address, amount, message);
      } else if (sails.config.local.coinArray[coin_code].type == 7) {
        getInfo = await sails
          .helpers
          .type2Coins
          .tetherSendCoin(coin_code, to_address, amount, message);
      }

      return res.json({
        "status": 200,
        "message": sails.__("send coin success"),
        "data": getInfo
      });
    } catch (err) {
      console.log(err);
    }
  },

  /**
    * API for listing address that has been generated
    * Renders this api when coin address list needs to be fetched
    *
    * @param <coin_code>
    *
    * @return <Coin address list generated or error data>
   */

  listAddresses: async function (req, res) {
    try {
      var {coin_code} = req.allParams();
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 3) {
        getInfo = await sails
          .helpers
          .type2Coins
          .neoListAddress(coin_code);
      }

      return res.json({"status": 200, "message": sails.__("list address success"), "data": getInfo});
    } catch (err) {
      console.log(err);
    }
  },

  /**
    * API for getting user wallet balance
    * Renders this api when user wants to fetch coin balance
    *
    * @param <coin_code, address>
    *
    * @return <User coin address balance or error data>
   */

  getAddressBalance: async function (req, res) {
    try {
      var {coin_code, address} = req.body;
      var getInfo;
      if (sails.config.local.coinArray[coin_code].type == 6) {
        getInfo = await sails
          .helpers
          .type2Coins
          .lbryGetWalletBalance(coin_code, address);
      } else if (sails.config.local.coinArray[coin_code].type == 7) {
        getInfo = await sails
          .helpers
          .type2Coins
          .tetherGetWalletBalance(coin_code, address);
      }
      return res.json({"status": 200, "message": sails.__("user address balance success"), "data": getInfo});
    } catch (err) {
      console.log(err);
    }
  }
}
