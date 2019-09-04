/**
 * TradeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');

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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
        "message": sails.__("Order Success")
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No more limit order Buy")
          });
      }
      if (error.message == "serverError") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
        "message": sails.__("Order Success")
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      console.log(error)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No more limit order Sell")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
          "message": sails.__("Order added Success")
        });
      } else if (limit_sell_response.side == "Sell" && limit_sell_response.is_partially_fulfilled == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order Partially Fulfilled and Successfully added to Sell book")
        });
      } else {
        return res.json({
          "status": 200,
          "message": sails.__("Order Success")
        });
      }
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      if (error.code == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.code == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }
      if (error.code == "invalidQuantity") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Invalid Quantity")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
          "message": sails.__("Order added Success")
        });
      } else if (limit_buy_response.side == "Buy" && limit_buy_response.is_partially_fulfilled == true) {
        return res.json({
          "status": 200,
          "message": sails.__("Order Partially Fulfilled and Successfully added to Buy book")
        });
      } else {
        return res.json({
          "status": 200,
          "message": sails.__("Order Success")
        });
      }
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      if (error.code == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.code == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }
      if (error.code == "invalidQuantity") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Invalid Quantity")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
        "message": sails.__("Order Palce Success")
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("Create Currency Wallet")
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
            "message": sails.__("Create Crypto Wallet")
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
      //         "message": sails.__("Please enter OTP to continue")
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
      //         "message": sails.__("invalid otp")
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
        "message": sails.__("Order Palce Success")
      });
      // } else {
      //   // Whatever the response of user trade checking
      //   res.json({
      //     "status": 200,
      //     "message": sails.__(geo_fencing_data.msg)
      //   });
      // }
    } catch (error) {
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
        "message": sails.__("Order Success")
      });
    } catch (error) {
      if (error.message == "noBuyLimitOrder") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No Pending order")
          });
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
      let user_history_data = await sails
        .helpers
        .tradding
        .getUserTradeHistory(data);
      res.json({
        "status": 200,
        "message": sails.__("Order Success"),
        "data": user_history_data
      });
    } catch (error) {
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Coin not found")
          });
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Insufficent balance")
          });
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
                  "message": sails.__("error")
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
                  "message": sails.__("User Balance Success")
                });
              }
            }
          });
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error")
          });
      }
    } catch (err) {
      console.log('>>>', err)
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
    // console.log("Inside this method ::::: ", room);
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
                    "message": sails.__("error")
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
                          "message": sails.__("error")
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
                          "message": "Trade data retrived successfully."
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
                    "message": sails.__("error")
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
                    "message": sails.__("Trade retrieve success")
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
            "message": sails.__("error")
          });
      }
    } catch (err) {
      console.log('>>>', err)
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
                    "message": sails.__("error")
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
                          "message": sails.__("error")
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
                          "message": sails.__("User Trade Success")
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
                    "message": sails.__("error")
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
                    "message": sails.__("User Trade Success")
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
            "message": sails.__("error")
          });
      }
    } catch (err) {
      console.log('>>>', err)
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
                    "message": sails.__("error")
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      return res
                        .status(500)
                        .json({
                          status: 500,
                          "err": sails.__("Something Wrong")
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
                        "message": sails.__("Depth Chart retrieved success")
                      });
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
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
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
                  "message": sails.__("Depth Chart retrieved success")
                });
              }
            });
        }
      } else {}
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
        sort_order
      } = req.allParams();

      let query = " from trade_history LEFT JOIN users ON trade_history.user_id = users.id LEFT JOIN users as requested_user ON trade_history.requested_user_id = requested_user.id";
      let whereAppended = false;

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query += " WHERE"
          whereAppended = true;
          query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(requested_user.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(trade_history.symbol) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query += " OR quantity=" + data + " OR fill_price=" + data + " OR maker_fee=" + data + " OR taker_fee=" + data
          }
          query += ")"
        }
      }

      if (user_id) {
        query += whereAppended ?
          " AND " :
          " WHERE ";
        whereAppended = true;
        query += " trade_history.user_id=" + user_id
      }

      if (t_type) {
        query += whereAppended ?
          " AND " :
          " WHERE ";

        whereAppended = true;
        query += "  trade_history.side='" + t_type + "'";
      }

      if (start_date && end_date) {
        query += whereAppended ?
          " AND " :
          " WHERE ";

        query += " trade_history.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND trade_history.created_at <= '" + await sails
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

      let tradeData = await sails.sendNativeQuery("Select trade_history.id,trade_history.requested_user_id,trade_history.user_id,tr" +
        "ade_history.symbol,trade_history.currency,trade_history.settle_currency,trade_hi" +
        "story.side,trade_history.quantity,trade_history.fill_price, trade_history.price, trade_history.maker_" +
        "fee, trade_history.taker_fee, trade_history.stop_price, trade_history.limit_price, users.email, requested_user.email as reqested_user" +
        "_email, trade_history.created_at" + query, [])

      tradeData = tradeData.rows;

      let tradeCount = await sails.sendNativeQuery("Select COUNT(trade_history.id)" + countQuery, [])
      tradeCount = tradeCount.rows[0].count;

      if (tradeData) {
        return res.json({
          "status": 200,
          "message": sails.__("Trade list"),
          "data": tradeData,
          tradeCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
