/**
 * TradeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
var logger = require('../controllers/logger')

module.exports = {
  //---------------------------Web Api------------------------------

  /**
   * Market Sell Order
   * Renders page for user to place order for market sell
   *
   * @param <symbol, side, order type and order quantity>
   *
   * @return <Success message for successfully fulfilled or error>
   */
  marketSell: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity
      } = req.allParams();
      orderQuantity = parseFloat(orderQuantity);
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }


      //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Market Sell Order for order execution
      let market_sell_response = await sails
        .helpers
        .tradding
        .marketSell(symbol, user_id, side, order_type, orderQuantity)
        .tolerate("coinNotFound", () => {
          throw new Error("coinNotFound");
        })
        .tolerate("serverError", () => {
          throw new Error("serverError");
        })
        .tolerate("insufficientBalance", () => {
          throw new Error("insufficientBalance");
        })
        .tolerate("orderBookEmpty", () => {
          throw new Error("orderBookEmpty");
        });
      res.json({
        "status": 200,
        "message": sails.__("Order Success").message
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // await logger.error(error.message)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No more limit order Buy").message,
            error_at:error.stack
          });
      }
      if (error.message == "serverError") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong").message,
            error_at:error.stack
          });
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Market Buy Order
   * Renders page for user to place order for market buy
   *
   * @param <symbol, side, order type and order quantity>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  marketBuy: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity
      } = req.allParams();
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }

      // //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      //Security Feature for 2 factor
      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Market Buy Order for order execution
      let market_buy_response = await sails
        .helpers
        .tradding
        .marketBuy(symbol, user_id, side, order_type, orderQuantity)
        .tolerate("coinNotFound", () => {
          throw new Error("coinNotFound");
        })
        .tolerate("serverError", () => {
          throw new Error("serverError");
        })
        .tolerate("insufficientBalance", () => {
          throw new Error("insufficientBalance");
        })
        .tolerate("orderBookEmpty", () => {
          throw new Error("orderBookEmpty");
        });
      res.json({
        "status": 200,
        "message": sails.__("Order Success").message
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // console.log(error)
      // await logger.error(error.message)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No more limit order Sell").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Limit Sell Order
   * Renders page for user to place order for limit sell
   *
   * @param <symbol, side, order type and order quantity, Limit Price>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  limitSell: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price
      } = req.allParams();
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }

      //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      //Security Feature for 2 factor
      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Limit Sell Order for order execution
      let limit_sell_response = await sails
        .helpers
        .tradding
        .limitSell(symbol, user_id, side, order_type, orderQuantity, limit_price);
      if (limit_sell_response.side == "Sell" && limit_sell_response.is_partially_fulfilled == true && limit_sell_response.added == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order added Success").message
        });
      } else if (limit_sell_response.side == "Sell" && limit_sell_response.is_partially_fulfilled == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order Partially Fulfilled and Successfully added to Sell book").message
        });
      } else {
        return res.json({
          "status": 200,
          "message": sails.__("Order Success").message
        });
      }
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // await logger.error(error.message)
      if (error.code == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.code == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }
      if (error.code == "invalidQuantity") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Invalid Quantity").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Limit Buy Order
   * Renders page for user to place order for limit buy
   *
   * @param <symbol, side, order type and order quantity, Limit Price>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  limitBuy: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price
      } = req.allParams();
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }

      //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      //Security Feature for 2 factor
      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Limit Buy Order for order execution
      let limit_buy_response = await sails
        .helpers
        .tradding
        .limitBuy(symbol, user_id, side, order_type, orderQuantity, limit_price)
        .tolerate('invalidQuantity', () => {
          throw new Error("invalidQuantity");
        })
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });;
      if (limit_buy_response.side == "Buy" && limit_buy_response.is_partially_fulfilled == true && limit_buy_response.added == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order added Success").message
        });
      } else if (limit_buy_response.side == "Buy" && limit_buy_response.is_partially_fulfilled == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order Partially Fulfilled and Successfully added to Buy book").message
        });
      } else {
        return res.json({
          "status": 200,
          "message": sails.__("Order Success").message
        });
      }
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // await logger.error(error.message)
      if (error.code == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.code == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }
      if (error.code == "invalidQuantity") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Invalid Quantity").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Stop Limit Buy Order
   * Renders page for user to place order for stop limit buy
   *
   * @param <symbol, side, order type and order quantity, Limit Price, Stop Price>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  stopLimitBuy: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price,
        stop_price
      } = req.allParams();
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }

      //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      //Security Feature for 2 factor
      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Stop Limit Sell Order for order execution
      let stop_limit_buy_response = await sails
        .helpers
        .tradding
        .stopLimitBuyAddPending(symbol, user_id, side, order_type, orderQuantity, limit_price, stop_price)
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });
      res.json({
        "status": 200,
        "message": sails.__("Order Palce Success").message
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // await logger.error(error.message)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Stop Limit Sell Order
   * Renders page for user to place order for stop limit Sell
   *
   * @param <symbol, side, order type and order quantity, Limit Price, Stop Price>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  stopLimitSell: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price,
        stop_price
      } = req.allParams();
      let user_id = req.user.id;

      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError")
        });

      let coinValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: currency
      })

      let walletCurrency = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: coinValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCurrency == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Currency Wallet").message
          })
      }

      let cryptoValue = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: crypto
      })

      let walletCrypto = await Wallet.findOne({
        where: {
          deleted_at: null,
          coin_id: cryptoValue.id,
          is_active: true,
          user_id: user_id
        }
      });

      if (walletCrypto == undefined) {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("Create Crypto Wallet").message
          })
      }

      //Checking whether user can trade in the area selected in the KYC
      // var geo_fencing_data = await sails
      //   .helpers
      //   .userTradeChecking(user_id);

      //Security Feature for 2 factor
      // var userData = await Users.findOne({
      //   deleted_at: null,
      //   id: user_id,
      //   is_active: true
      // });

      // if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
      //   if (!req.body.otp) {
      //     return res
      //       .status(202)
      //       .json({
      //         "status": 202,
      //         "message": sails.__("Please enter OTP to continue").message
      //       });
      //   }

      //   let verified = speakeasy
      //     .totp
      //     .verify({
      //       secret: userData.twofactor_secret,
      //       encoding: 'base32',
      //       token: req.body.otp,
      //       window: 2
      //     });

      //   if (!verified) {
      //     return res
      //       .status(402)
      //       .json({
      //         "status": 402,
      //         "message": sails.__("invalid otp").message
      //       });
      //   }
      // }

      // If user is allowed to trade in his region
      // if (geo_fencing_data.response == true) {
      // Stop Limit Buy Order for order execution
      let stop_limit_sell_response = await sails
        .helpers
        .tradding
        .stopLimitSellAddPending(symbol, user_id, side, order_type, orderQuantity, limit_price, stop_price)
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });
      res.json({
        "status": 200,
        "message": sails.__("Order Palce Success").message
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg).message
      //   });
      // }
    } catch (error) {
      // await logger.error(error.message)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Method for fetching orders from pending book
   *
   * Renders execution for order already placed in pending book
   *
   * @param
   *
   * @return <Success message for successfully fulfilled or error>
   */

  stopLimitExecute: async function (req, res) {

    // As stop limit order are initially added in the pending book they need to be checked everytime order executes if price is reached or not. So this function is for that execution
    await sails
      .helpers
      .tradding
      .executeStopLimit();
    res.end();
  },

  /**
   * Cancel Pending order of limit or stop limit
   *
   * Renders page for user to cancel order that has already been placed
   *
   * @param <side, order type and order id>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  cancelPendingOrder: async function (req, res) {
    try {
      let {
        side,
        id,
        order_type
      } = req.allParams();
      let user_id = req.user.id;
      let cancel_pending_data = await sails
        .helpers
        .tradding
        .pending
        .cancelPendingData(side, order_type, id)
        .tolerate('noBuyLimitOrder', () => {
          throw new Error("noBuyLimitOrder");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });
      res.json({
        "status": 200,
        "message": sails.__("Order Success").message
      });
    } catch (error) {
      // await logger.error(error.message)
      if (error.message == "noBuyLimitOrder") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No Pending order").message,
            error_at:error.stack
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Getting User wise trade history
   * Renders page for user when user tries to see the history
   *
   * @param <symbol, side, From Date, To Date, User Id>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  getUserHistory: async function (req, res) {
    try {
      var data = req.allParams();
      let user_id = req.user.id;
      data.user_id = user_id;
      var user_history_data;
      if (data.trade_type == 1) {
        var user_history_data1 = await sails
          .helpers
          .fixapi
          .getUserJstTradeHistory(data);

        var user_history_data = []
        for (var i = 0; i < user_history_data1.length; i++) {
          if (Object.keys(user_history_data1[i].execution_report).length > 0) {
            user_history_data.push(user_history_data1[i])
          }
        }

        return res.json({
          "status": 200,
          "message": sails.__("Order Success").message,
          "data": user_history_data
        });
      } else if (data.trade_type == 2) { // Simplex
        user_history_data = await sails
          .helpers
          .simplex
          .getUserSimplexHistory(data);
      } else if (data.trade_type == 3) { // JST
        user_history_data = await sails
          .helpers
          .tradding
          .getUserTradeHistory(data);
      }
      return res.json({
        "status": 200,
        "message": sails.__("Order Success").message,
        "data": user_history_data
      });
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found").message,
            error_at:error.stack
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance").message,
            error_at:error.stack
          });
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Socket API
   * Get User Wallet Balance
   * Renders page for user at trade screen to get balance
   *
   * @param <room=symbol, userid>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  getUserWallet: async function (req, res) {

    var room = req.query.room;

    try {
      var user_id = parseInt(req.query.userId);

      if (req.isSocket) {
        sails
          .sockets
          .join(req.socket, room + '-' + user_id, async function (err) {
            if (err) {
              return res
                .status(403)
                .json({
                  status: 403,
                  "message": sails.__("error").message
                });
            } else {
              let {
                crypto,
                currency
              } = await sails
                .helpers
                .utilities
                .getCurrencies(room);

              let userBalanceDetails = await sails
                .helpers
                .tradding
                .getUserWalletBalance(user_id, currency, crypto);

              if (userBalanceDetails) {
                return res.json({
                  status: 200,
                  data: userBalanceDetails,
                  "message": sails.__("User Balance Success").message
                });
              }
            }
          });
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error").message
          });
      }
    } catch (error) {
      // console.log('>>>', error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Socket API
   * Get all trade Trade History on trade page
   * Renders page for user at trade screen to get trade history
   *
   * @param <room=symbol, previous room ,userid>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  getAllTradeHistory: async function (req, res) {
    var room = req.query.room;
    try {
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, async function (leaveErr) {
              if (leaveErr) {
                // console.log('>>>leaveErr', leaveErr);
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error").message
                        });
                    } else {
                      let {
                        crypto,
                        currency
                      } = await sails
                        .helpers
                        .utilities
                        .getCurrencies(room);

                      let tradeDetails = await sails
                        .helpers
                        .tradding
                        .trade
                        .getTradeDetails(crypto, currency, 100);

                      if (tradeDetails) {
                        return res.json({
                          status: 200,
                          data: tradeDetails,
                          "message": sails.__("Trade data retrived successfully.").message
                        });
                      }
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room, async function (err) {
              if (err) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                let {
                  crypto,
                  currency
                } = await sails
                  .helpers
                  .utilities
                  .getCurrencies(room);

                let tradeDetails = await sails
                  .helpers
                  .tradding
                  .trade
                  .getTradeDetails(crypto, currency, 100);

                if (tradeDetails) {
                  return res.json({
                    status: 200,
                    data: tradeDetails,
                    "message": sails.__("Trade retrieve success").message
                  });
                }
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error").message
          });
      }
    } catch (error) {
      // console.log('>>>', error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Socket API
   * Get User particular trade history for completed, pending and cancelled
   * Renders page for user at trade screen to get user's trade that has been completed or pending or cancelled
   *
   * @param <room=symbol, userid, month, filter type>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  getUserTradeHistory: async function (req, res) {
    var room = req.query.room;
    var user_id = req.user.id;
    var month = req.query.month;
    var filter_type = req.query.filter_type;

    try {
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom + '-' + user_id, async function (leaveErr) {
              if (leaveErr) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room + '-' + user_id, async function (err) {
                    if (err) {
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error").message
                        });
                    } else {
                      if (month == undefined) {
                        month = 0;
                      }
                      let {
                        crypto,
                        currency
                      } = await sails
                        .helpers
                        .utilities
                        .getCurrencies(room);
                      var userTradeDetails;

                      if (filter_type == 1) {
                        userTradeDetails = await sails
                          .helpers
                          .tradding
                          .getCompletedData(user_id, crypto, currency, month);
                      } else if (filter_type == 2) {
                        userTradeDetails = await sails
                          .helpers
                          .tradding
                          .pending
                          .getTradePendingDetails(user_id, crypto, currency, month);
                      } else if (filter_type == 3) {
                        userTradeDetails = await sails
                          .helpers
                          .tradding
                          .getCancelDetails(user_id, crypto, currency, month);
                      }
                      if (userTradeDetails) {
                        return res.json({
                          status: 200,
                          data: userTradeDetails,
                          "message": sails.__("User Trade Success").message
                        });
                      }
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room + '-' + user_id, async function (err) {
              if (err) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                let {
                  crypto,
                  currency
                } = await sails
                  .helpers
                  .utilities
                  .getCurrencies(room);
                var userTradeDetails;
                if (filter_type == 1) {
                  userTradeDetails = await sails
                    .helpers
                    .tradding
                    .getCompletedData(user_id, crypto, currency, month);
                } else if (filter_type == 2) {
                  userTradeDetails = await sails
                    .helpers
                    .tradding
                    .pending
                    .getTradePendingDetails(user_id, crypto, currency, month);
                } else if (filter_type == 3) {
                  userTradeDetails = await sails
                    .helpers
                    .tradding
                    .getCancelDetails(user_id, crypto, currency, month);
                }

                if (userTradeDetails) {
                  return res.json({
                    status: 200,
                    data: userTradeDetails,
                    "message": sails.__("User Trade Success").message
                  });
                }
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error").message
          });
      }
    } catch (error) {
      // console.log('>>>', error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * Socket API
   * Get Depth Chart
   * Renders page for user at trade screen to get depth chart
   *
   * @param <room=symbol, Previous Room ,userid>
   *
   * @return <Success message for successfully fulfilled or error>
   */

  getDepthchartData: async function (req, res) {
    var room = req.query.room;
    try {
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, async function (leaveErr) {
              if (leaveErr) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (error) {
                    if (error) {
                      return res
                        .status(500)
                        .json({
                          status: 500,
                          "err": sails.__("Something Wrong").message,
                          error_at:error.stack
                        });
                    } else {
                      let {
                        crypto,
                        currency
                      } = await sails
                        .helpers
                        .utilities
                        .getCurrencies(room);
                      let data = await sails
                        .helpers
                        .chart
                        .getDepthChartDetail(crypto, currency);
                      return res.json({
                        status: 200,
                        data: data,
                        "message": sails.__("Depth Chart retrieved success").message
                      });
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room, async function (error) {
              if (error) {
                return res
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at:error.stack
                  });
              } else {
                let {
                  crypto,
                  currency
                } = await sails
                  .helpers
                  .utilities
                  .getCurrencies(room);
                let data = await sails
                  .helpers
                  .chart
                  .getDepthChartDetail(crypto, currency);
                return res.json({
                  status: 200,
                  data: data,
                  "message": sails.__("Depth Chart retrieved success").message
                });
              }
            });
        }
      } else { }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },
  //-------------------------------CMS Api--------------------------
  getAllTrades: async function (req, res) {
    // req.setLocale('en')
    try {
      let {
        page,
        limit,
        data,
        user_id,
        t_type,
        start_date,
        end_date,
        sort_col,
        sort_order,
        trade_type,
        simplex_payment_status
      } = req.allParams();

      var tradeCount;
      var tradeData;

      if (trade_type == 1) {
        let query = " from jst_trade_history LEFT JOIN users ON jst_trade_history.user_id = users.id ";
        let whereAppended = false;

        if ((data && data != "")) {
          if (data && data != "" && data != null) {
            query += " WHERE"
            whereAppended = true;
            query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.symbol) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.order_id) LIKE '%" + data.toLowerCase() + "%'";
            if (!isNaN(data)) {
              query += " OR quantity=" + data + " OR fill_price=" + data
            }
            query += ")"
          }
        }

        if (user_id) {
          query += whereAppended ?
            " AND " :
            " WHERE ";
          whereAppended = true;
          query += " jst_trade_history.user_id=" + user_id
        }

        if (t_type) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          whereAppended = true;
          query += "  jst_trade_history.side='" + t_type + "'";
        }

        if (start_date && end_date) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          query += " jst_trade_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND jst_trade_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }
        countQuery = query;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY " + sort_col + " " + sortVal;
        } else {
          query += " ORDER BY jst_trade_history.created_at desc ";
        }

        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        tradeData = await sails.sendNativeQuery("Select jst_trade_history.id,jst_trade_history.user_id,jst_tr" +
          "ade_history.symbol,jst_trade_history.currency, jst_trade_history.offer_code ,jst_trade_history.order_status,jst_trade_history.settle_currency,jst_trade_hi" +
          "story.side,jst_trade_history.quantity,jst_trade_history.fill_price,jst_trade_history.is_partially_filled, jst_trade_history.price," +
          " users.email, jst_trade_history.created_at, jst_trade_history.execution_report,jst_trade_history.faldax_fees, jst_trade_history.network_fees ,jst_trade_history.order_id, jst_trade_history.buy_currency_amount, jst_trade_history.sell_currency_amount, jst_trade_history.faldax_fees_actual, jst_trade_history.difference_faldax_commission, jst_trade_history.offer_applied, jst_trade_history.limit_price, jst_trade_history.asset1_usd_value, jst_trade_history.asset2_usd_value" + query, [])

        tradeData = tradeData.rows;

        tradeCount = await sails.sendNativeQuery("Select COUNT(jst_trade_history.id)" + countQuery, [])
        tradeCount = tradeCount.rows[0].count;

      } else if (trade_type == 2) { // Simplex
        let query = " from simplex_trade_history LEFT JOIN users ON simplex_trade_history.user_id = users.id";
        let whereAppended = false;
        query += " WHERE simplex_trade_history.is_processed = true"
        whereAppended = true
        if ((data && data != "")) {
          if (data && data != "" && data != null) {
            whereAppended = true;
            query += " AND"
            query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(simplex_trade_history.symbol) LIKE '%" + data.toLowerCase() + "%' OR simplex_trade_history.payment_id LIKE '%" + data + "%' OR simplex_trade_history.quote_id LIKE '%" + data + "%' OR simplex_trade_history.address LIKE '%" + data.toLowerCase() + " %'";
            if (!isNaN(data)) {
              query += " OR simplex_trade_history.quantity = '" + data + "' OR simplex_trade_history.fill_price = '" + data + "'"
            }
            query += ")"
          }
        }

        if (user_id) {
          query += whereAppended ?
            " AND " :
            " WHERE ";
          whereAppended = true;
          query += " simplex_trade_history.user_id=" + user_id
        }

        if (simplex_payment_status) {
          query += whereAppended ?
            " AND " :
            " WHERE ";
          whereAppended = true;
          query += " simplex_trade_history.simplex_payment_status=" + simplex_payment_status
        }

        if (t_type) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          whereAppended = true;
          query += "  simplex_trade_history.side='" + t_type + "'";
        }

        if (start_date && end_date) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          query += " simplex_trade_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND simplex_trade_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }
        countQuery = query;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY " + sort_col + " " + sortVal;
        }

        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        tradeData = await sails.sendNativeQuery("Select users.email, simplex_trade_history.*" + query, [])

        tradeData = tradeData.rows;

        tradeCount = await sails.sendNativeQuery("Select COUNT(simplex_trade_history.id)" + countQuery, [])
        tradeCount = tradeCount.rows[0].count;
      } else if (trade_type == 3) { // JST
        let query = " FROM jst_trade_history LEFT JOIN users ON jst_trade_history.user_id = users.id";
        let whereAppended = false;

        if ((data && data != "")) {
          if (data && data != "" && data != null) {
            query += " WHERE"
            whereAppended = true;
            query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.symbol) LIKE '%" + data.toLowerCase() + "%'";
            if (!isNaN(data)) {
              query += " OR quantity=" + data + " OR fill_price=" + data
            }
            query += ")"
          }
        }

        if (user_id) {
          query += whereAppended ?
            " AND " :
            " WHERE ";
          whereAppended = true;
          query += " jst_trade_history.user_id=" + user_id
        }

        if (t_type) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          whereAppended = true;
          query += "  jst_trade_history.side='" + t_type + "'";
        }

        if (start_date && end_date) {
          query += whereAppended ?
            " AND " :
            " WHERE ";

          query += " jst_trade_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND jst_trade_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }
        countQuery = query;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY " + sort_col + " " + sortVal;
        }

        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        tradeData = await sails.sendNativeQuery(`Select jst_trade_history.*,users.email` + query, [])

        tradeData = tradeData.rows;

        tradeCount = await sails.sendNativeQuery("Select COUNT(jst_trade_history.id)" + countQuery, [])
        tradeCount = tradeCount.rows[0].count;
      }
      if (tradeData) {
        return res.json({
          "status": 200,
          "message": sails.__("Trade list").message,
          "data": tradeData,
          tradeCount
        });
      }
    } catch (error) {
      // console.log(error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  //get all pending book orders
  getAllPendingOrders: async function (req, res) {
    try {
      let {
        user_id,
        page,
        limit,
        search
      } = req.allParams();

      var pendingOrderDetails = await PendingBook.find({
        where: {
          deleted_at: null,
          user_id
        },
        sort: 'id DESC'
      });

      var buyBookDetails = await BuyBook.find({
        where: {
          deleted_at: null,
          user_id,
          is_partially_fulfilled: true
        },
        sort: 'id DESC'
      });

      // Select c.coin_code, c.coin, w.balance, w.send_address, w.receive_address,
      //   (sum(th.user_fee) + sum(th.requested_fee)) as Fee
      // from pending_book
      // LEFT JOIN buy_book buy
      // ON buy.user_id = pending_book.user_id
      // LEFT JOIN sell_book sell
      // ON sell.user_id = pending_book.user_id
      // WHERE pending_book.deleted_at IS NULL AND buy.is_partially_fulfilled = TRUE
      // GROUP BY c.coin, c.coin_code, w.send_address, w.receive_address, w.balance

      var pendingDetailsBuy = pendingOrderDetails.concat(buyBookDetails);

      var sellBookDetails = await SellBook.find({
        select: [
          'id',
          'fix_quantity',
          'quantity',
          'fill_price',
          'side',
          'order_type',
          'symbol',
          'created_at',
          'deleted_at',
          'limit_price'
        ],
        where: {
          deleted_at: null,
          user_id,
          is_partially_fulfilled: true
        },
        sort: 'id DESC'
      }).paginate(parseInt(page) - 1, parseInt(limit));

      let pendingDataCount = await SellBook.count({
        deleted_at: null,
        user_id,
        is_partially_fulfilled: true
      });

      tradePendingDetails = pendingDetailsBuy.concat(sellBookDetails);

      if (tradePendingDetails) {
        return res.json({
          "status": 200,
          "message": sails.__("Pending Orders List").message,
          "data": tradePendingDetails,
          pendingDataCount
        });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
    //Last Query
    //   SELECT *
    // FROM pending_book
    // LEFT JOIN buy_book
    // ON pending_book.user_id = CAST(buy_book.user_id as character varying)
    // WHERE pending_book.user_id='80' AND pending_book.deleted_at IS NULL AND buy_book.deleted_at IS NULL
    // GROUP BY pending_book.id, buy_book.id
  },

  //get all cancel book orders
  getAllCancelledOrders: async function (req, res) {
    try {
      let {
        user_id,
        page,
        limit,
        data,
        sort_col,
        sort_order
      } = req.allParams();
      let query = " from activity_table WHERE is_cancel=true AND user_id='" + user_id + "' ";
      let whereAppended = false;
      if ((data && data != "")) {
        whereAppended = true;
        if (data && data != "" && data != null) {
          query += "AND (LOWER(symbol) LIKE '%" + data.toLowerCase() + "%')";
          if (!isNaN(data)) {
            query += " OR (limit_price=" + data + " OR fill_price=" + data + " OR quantity=" + data + ")";
          }
        }
      }

      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY id ASC";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      let cancelDetails = await sails.sendNativeQuery("Select *" + query, [])

      cancelDetails = cancelDetails.rows;

      let cancelledOrderCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      cancelledOrderCount = cancelledOrderCount.rows[0].count;

      if (cancelDetails) {
        return res.json({
          "status": 200,
          "message": sails.__("Cancel Orders List").message,
          "data": cancelDetails,
          cancelledOrderCount
        });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  }
};
