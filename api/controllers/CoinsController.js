/**
 * CoinsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var logger = require("./logger");

module.exports = {

  /**
   * API for getting coin list
   * Renders this api when coin list needs to be fetched
   *
   * @param <>
   *
   * @return <Coin List and coins count or error data>
   */

  getAllCoinList: async function (req, res) {
    try {
      let allCoins = await Coins
        .find({
          where: {
            deleted_at: null,
            is_active: true,
            is_fiat: false
          }
        })
        .select(['coin_name', 'coin_code', 'coin']);

      let allCoinsCount = await Coins.count({
        where: {
          deleted_at: null,
          is_active: true,
          is_fiat: false
        }
      });
      if (allCoins) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list").message,
          "data": allCoins,
          allCoinsCount
        });
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
      return;
    }
  },
  //---------------------------Web Api------------------------------
  getAllCoins: async function (req, res) {
    try {
      let {
        page,
        limit,
        data
      } = req.allParams();
      var user_id = req.user.id;

      if (data) {
        // var balanceRes = await sails.sendNativeQuery("SELECT coins.*,
        // wallets.balance, wallets.placed_balance FROM coins JOIN wallets " +     "ON
        // coins.id = wallets.coin_id WHERE wallets.user_id = " + user_id + " AND
        // (coins.coin_name LIKE '%" + data + "%' OR coins.coin_code LIKE '%" + data +
        // "%') AND coins.is_active = true AND coins.deleted_at IS NULL AND
        // wallets.deleted_" +     "at IS NULL ORDER BY wallets.balance DESC LIMIT " +
        // limit + " OFFSET " + (limit * (page - 1)));
        let balanceRes = await Coins.find({
          deleted_at: null,
          // is_active: true,
          or: [{
            coin_name: {
              contains: data
            }
          }, {
            coin_code: {
              contains: data
            }
          }]
        })
          .paginate(page - 1, parseInt(limit))
          .populate('userWallets', {
            where: {
              deleted_at: null,
              is_active: true,
              user_id: user_id
            }
          });
        for (let index = 0; index < balanceRes.length; index++) {
          const element = balanceRes[index];
          if (element.userWallets.length > 0) {
            element["balance"] = element.userWallets[0].balance,
              element["placed_balance"] = element.userWallets[0].placed_balance
            delete element.userWallets;
            balanceRes[index] = element
          }
        }
        let allCoinsCount = await Coins.count({
          where: {
            deleted_at: null,
            // is_active: true,
            or: [{
              coin_name: {
                contains: data
              }
            }, {
              coin_code: {
                contains: data
              }
            }]
          }
        });
        if (balanceRes) {
          return res.json({
            "status": 200,
            "message": sails.__("Coin list").message,
            "data": balanceRes,
            allCoinsCount
          });
        }
      } else {
        // var balanceRes = await sails.sendNativeQuery(`SELECT coins.*,
        // wallets.balance, wallets.placed_balance FROM coins LEFT JOIN wallets ON
        // coins.id = wallets.coin_id WHERE wallets.user_id = ` + user_id + ` AND
        // coins.is_active = true AND coins.deleted_at IS NULL AND wallets.deleted_at IS
        // NULL ORDER BY wallets.balance DESC LIMIT ${limit} OFFSET ${page} `);
        let balanceRes = await Coins
          .find({
            deleted_at: null,
            // is_active: true
          })
          .paginate(page - 1, parseInt(limit))
          .populate('userWallets', {
            where: {
              deleted_at: null,
              is_active: true,
              user_id: user_id
            }
          });
        for (let index = 0; index < balanceRes.length; index++) {
          const element = balanceRes[index];
          if (element.userWallets.length > 0) {
            element["balance"] = element.userWallets[0].balance,
              element["placed_balance"] = element.userWallets[0].placed_balance
            delete element.userWallets;
            balanceRes[index] = element
          }
        }
        let allCoinsCount = await Coins.count({
          where: {
            deleted_at: null,
            // is_active: true
          }
        });

        if (balanceRes) {
          return res.json({
            "status": 200,
            "message": sails.__("Coin list").message,
            "data": balanceRes,
            allCoinsCount
          });
        }
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  //Create Wallet
  createWallet: async function (req, res) {
    let {
      coin_id
    } = req.allParams();
    var requestedCoin = await Coins.find({
      id: coin_id,
      deleted_at: null,
      is_active: true
    });
    await sails
      .helpers
      .wallet
      .create(requestedCoin.coin_code);
    return res.json({
      "status": 200,
      "message": sails.__("wallet created success").message
    });
  },

  // create all wallet
  createAllWallet: async function (req, res) {
    try {
      let result = await sails
        .helpers
        .wallet
        .createAll()
        .tolerate("unkown", (err) => {
          throw err;
        });

      return res.json({
        "status": 200,
        "message": sails.__("wallet created success").message
      });
    } catch (error) {
      // await logger.error(error.message)
      if (error.raw) {
        return res
          .status(500)
          .json({
            status: 500,
            "err": error.raw.err,
            error_at: error.stack
          });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong"),
            error_at: error.stack
          });
      }
    }
  },

  // Get Coin list for conversion screen
  getCoinsForConversion: async function (req, res) {
    try {
      let coins = await Coins
        .find({
          where: {
            deleted_at: null,
            is_active: true,
            is_fiat: false,
            kraken_coin_name: {
              '!=': null
            }
          }
        })
        .select(["coin_icon", "coin_name", "coin", "min_limit"]);

      let feesDetails = await AdminSetting.findOne({
        deleted_at: null,
        slug: 'faldax_fee'
      });
      let faldaxFees = parseFloat(feesDetails.value);

      let feesDetailsKraken = await AdminSetting.findOne({
        deleted_at: null,
        slug: 'kraken_fee'
      });
      let krakenFees = parseFloat(feesDetailsKraken.value);

      return res.json({
        "status": 200,
        "message": sails.__("Coin list").message,
        "data": coins,
        'kraken_fees': krakenFees,
        'faldax_fees': faldaxFees
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  // Get Currency for perticular currency
  getCurrencyForConversion: async function (req, res) {
    try {
      let pair = await Pairs.find({
        name: {
          startsWith: req.query.crypto + '-'
        },
        deleted_at: null,
        is_active: true
      });

      let coinIds = [];
      for (let index = 0; index < pair.length; index++) {
        const element = pair[index];
        coinIds.push(element.coin_code2);
      }
      let coins = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_fiat: false,
          kraken_coin_name: {
            '!=': null
          },
          id: {
            in: coinIds
          }
        }
      }).select(["coin_icon", "coin_name", "coin"]);
      return res.json({
        "status": 200,
        "message": sails.__("Coin list").message,
        "data": coins
      });
    } catch (error) {
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getPairDetails: async function (req, res) {

    try {
      let room = req.query.room;

      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, function (err) {
              if (err) {
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
                      // console.log(error);
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error").message
                        });
                    } else {
                      let pair = await Pairs.findOne({
                        name: room,
                        is_active: true,
                        deleted_at: null
                      });
                      if (pair != undefined) {
                        return res.json({
                          status: 200,
                          data: pair,
                          "message": sails.__("Pair retrived success").message
                        });
                      } else {
                        return res
                          .status(500)
                          .json({
                            status: 500,
                            "err": sails.__("Something Wrong").message,
                            error_at: error.stack
                          });
                      }
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
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error").message
                  });
              } else {
                let pair = await Pairs.findOne({
                  name: room,
                  is_active: true,
                  deleted_at: null
                });
                if (pair != undefined) {
                  return res.json({
                    status: 200,
                    data: pair,
                    "message": sails.__("Pair retrived success").message
                  });
                } else {
                  return res
                    .status(500)
                    .json({
                      status: 500,
                      "err": sails.__("Something Wrong").message,
                      error_at: sails.__("Something Wrong").message
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
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },
  //-------------------------------CMS Api--------------------------
  getCoins: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sort_col,
        sort_order
      } = req.allParams();
      let query = " from coins WHERE deleted_at IS NULL ";
      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + "AND (LOWER(coin_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(coin_code) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query = query + " OR max_limit=" + data + " OR min_limit=" + data;
          }
          query += ")"
        }
      }
      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY id DESC ";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let coinData = await sails.sendNativeQuery("Select *" + query, [])

      coinData = coinData.rows;

      let CoinsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      CoinsCount = CoinsCount.rows[0].count;

      if (coinData) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list").message,
          "data": coinData,
          CoinsCount
        });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  create: async function (req, res) {
    req
      .file('coin_icon')
      .upload(async function (err, uploadedFiles) {
        try {
          if (uploadedFiles.length > 0) {
            var uploadIcon = await UploadFiles.upload(uploadedFiles[0].fd, 'coin/' + req.body.coin_code);

            if (req.body.coin_name && req.body.coin_code && req.body.min_limit) {
              let existingCoin = await Coins.find({
                deleted_at: null,
                or: [{
                  coin_name: req.body.coin_name
                }, {
                  coin_code: req.body.coin_code
                }]
              });
              if (existingCoin.length > 0) {
                return res
                  .status(400)
                  .json({
                    "status": 400,
                    "err": sails.__("Coin name or code already in use.").message
                  });
              }
              var coins_detail = await Coins
                .create({
                  coin_icon: 'coin/' + req.body.coin_code,
                  coin_name: req.body.coin_name,
                  coin_code: req.body.coin_code,
                  min_limit: req.body.min_limit,
                  max_limit: req.body.max_limit,
                  deposit_method: req.body.deposit_method,
                  kraken_coin_name: req.body.kraken_coin_name,
                  iserc: req.body.iserc,
                  is_active: false,
                  //wallet_address: req.body.wallet_address,
                  created_at: new Date(),
                  coin: (req.body.coin_code).toUpperCase(),
                })
                .fetch();
              var assetTierLimits = [];
              let numberOfTiers = 4
              for (let index = 0; index < numberOfTiers; index++) {
                assetTierLimits.push({
                  tier_step: index + 1,
                  coin_id: coins_detail.id
                });
              }
              await Limit.createEach(assetTierLimits);
              if (coins_detail) {
                res.json({
                  "status": 200,
                  "message": sails.__("Coin created success").message
                });
                return;
              } else {
                return res
                  .status(400)
                  .json({
                    "status": 400,
                    "err": sails.__("Something Wrong").message
                  });
              }
            } else {
              return res
                .status(400)
                .json({
                  "status": 400,
                  "err": sails.__("coin id is not sent").message
                });
            }
          } else {
            return res
              .status(400)
              .json({
                "status": 400,
                "err": sails.__("coin icon is not sent").message
              });
          }
        } catch (error) {
          // await logger.error(error.message)
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong").message,
              error_at: error.stack
            });
        }
      });
  },

  update: async function (req, res) {
    try {
      const coin_details = await Coins.findOne({
        id: req.body.coin_id
      });
      if (!coin_details) {
        return res
          .status(401)
          .json({
            status: 401,
            err: sails.__("Invalid coin").message
          });
      }
      if (req.body.coin_name) {
        let existingCoin = await Coins.find({
          deleted_at: null,
          id: {
            '!=': req.body.coin_id
          },
          coin_name: req.body.coin_name
        });
        if (existingCoin.length > 0) {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Coin name or code already in use.").message
            });
        }
      }
      var coinData = {
        id: req.body.coin_id,
        ...req.body
      }
      var updatedCoin = await Coins
        .update({
          id: req.body.coin_id
        })
        .set(req.body)
        .fetch();
      if (!updatedCoin) {
        return res.json({
          "status": 200,
          "message": sails.__("Something went wrong! could not able to update coin details").message
        });
      }
      return res.json({
        "status": 200,
        "message": sails.__("Coin details updated success").message
      });
    } catch (error) {
      // console.log('error', error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  delete: async function (req, res) {
    let {
      id
    } = req.allParams();
    if (!id) {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("coin id is not sent").message,
          error_at: sails.__("coin id is not sent").message
        });
    }
    let coinData = await Coins
      .update({
        id: id
      })
      .set({
        deleted_at: new Date()
      })
      .fetch();
    if (coinData) {
      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Coin deleted success").message
        });
    }
  },

  getCoinDetails: async function (req, res) {
    try {
      let {
        id
      } = req.allParams();

      let coin = await Coins.findOne({
        id: id
      });
      if (coin) {
        return res
          .status(200)
          .json({
            "coin": coin,
            "status": 200,
            "message": sails.__("Coin list").message
          });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getWarmWalletBalance: async function (req, res) {
    try {
      var ss = await Coins.find();
      var balance = [];
      var coinData = await Coins.find({
        select: [
          'warm_wallet_address',
          'coin_code',
          'custody_wallet_address'
        ],
        where: {
          is_active: true,
          deleted_at: null
        }
      })
        .sort('id DESC')

      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != "SUSU") {
          if (coinData[i].warm_wallet_address != null) {
            var warmWalletData = await sails
              .helpers
              .wallet
              .getWalletAddressBalance(coinData[i].warm_wallet_address, coinData[i].coin_code);
          }
          var coldWalletData
          var balanceColdWallet;
          if (coinData[i].custody_wallet_address != null) {
            coldWalletData = await sails
              .helpers
              .wallet
              .getWalletAddressBalance(coinData[i].custody_wallet_address, coinData[i].coin_code);
            balanceColdWallet = coldWalletData;
            coldWalletData = coldWalletData.receiveAddress.address
          } else {
            coldWalletData = ''
          }
          var object = {
            "balance": (warmWalletData.balance) ? (warmWalletData.balance) : (warmWalletData.balanceString),
            "coin_code": coinData[i].coin_code,
            "address": warmWalletData.receiveAddress.address,
            "cold_wallet": coldWalletData,
            "cold_wallet_balance": (balanceColdWallet.balance) ? (balanceColdWallet.balance) : balanceColdWallet.balanceString
          }
        } else {
          var walletData = await Wallet.findOne({
            where: {
              deleted_at: null,
              "wallet_id": "warm_wallet",
              coin_id: coinData[i].id
            }
          })
          var object = {
            "balance": walletData.balance,
            "coin_code": coinData[i].coin_code,
            "address": walletData.address
          }
        }
        balance.push(object);
      }


      return res
        .status(200)
        .json({
          "status": 200,
          balance
        })

    } catch (error) {
      console.log(error);
    }
  },
};
