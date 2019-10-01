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
          "message": sails.__("Coin list"),
          "data": allCoins,
          allCoinsCount
        });
      }
    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            is_active: true,
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
            is_active: true,
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
            "message": sails.__("Coin list"),
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
            is_active: true
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
            is_active: true
          }
        });

        if (balanceRes) {
          return res.json({
            "status": 200,
            "message": sails.__("Coin list"),
            "data": balanceRes,
            allCoinsCount
          });
        }
      }
    } catch (err) {
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
      "message": sails.__("wallet created success")
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
        "message": sails.__("wallet created success")
      });
    } catch (error) {
      await logger.error(error.message)
      if (error.raw) {
        return res
          .status(500)
          .json({
            status: 500,
            "err": error.raw.err
          });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
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
        "message": sails.__("Coin list"),
        "data": coins,
        'kraken_fees': krakenFees,
        'faldax_fees': faldaxFees
      });
    } catch (error) {
      await logger.error(error.message)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
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
        "message": sails.__("Coin list"),
        "data": coins
      });
    } catch (error) {
      await logger.error(error.message)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
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
                    "message": sails.__("error")
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      console.log(err);
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error")
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
                          "message": sails.__("Pair retrived success")
                        });
                      } else {
                        return res
                          .status(500)
                          .json({
                            status: 500,
                            "err": sails.__("Something Wrong")
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
                let pair = await Pairs.findOne({
                  name: room,
                  is_active: true,
                  deleted_at: null
                });
                if (pair != undefined) {
                  return res.json({
                    status: 200,
                    data: pair,
                    "message": sails.__("Pair retrived success")
                  });
                } else {
                  return res
                    .status(500)
                    .json({
                      status: 500,
                      "err": sails.__("Something Wrong")
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
    } catch (error) {
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
        query += " ORDER BY id ASC ";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let coinData = await sails.sendNativeQuery("Select *" + query, [])

      coinData = coinData.rows;

      let CoinsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      CoinsCount = CoinsCount.rows[0].count;

      if (coinData) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list"),
          "data": coinData,
          CoinsCount
        });
      }
    } catch (err) {
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
                    "err": sails.__("Coin name or code already in use.")
                  });
              }
              var coins_detail = await Coins
                .create({
                  coin_icon: 'faldax/coin/' + req.body.coin_code,
                  coin_name: req.body.coin_name,
                  coin_code: req.body.coin_code,
                  min_limit: req.body.min_limit,
                  max_limit: req.body.max_limit,
                  deposit_method: req.body.deposit_method,
                  kraken_coin_name: req.body.kraken_coin_name,
                  isERC: req.body.isERC,
                  //wallet_address: req.body.wallet_address,
                  created_at: new Date()
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
                  "message": sails.__("Coin created success")
                });
                return;
              } else {
                return res
                  .status(400)
                  .json({
                    "status": 400,
                    "err": sails.__("Something Wrong")
                  });
              }
            } else {
              return res
                .status(400)
                .json({
                  "status": 400,
                  "err": sails.__("coin id is not sent")
                });
            }
          } else {
            return res
              .status(400)
              .json({
                "status": 400,
                "err": sails.__("coin icon is not sent")
              });
          }
        } catch (error) {
          await logger.error(error.message)
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
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
            err: sails.__("Invalid coin")
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
              "err": sails.__("Coin name or code already in use.")
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
          "message": sails.__("Something went wrong! could not able to update coin details")
        });
      }
      return res.json({
        "status": 200,
        "message": sails.__("Coin details updated success")
      });
    } catch (error) {
      console.log('error', error)
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
          "err": sails.__("coin id is not sent")
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
          "message": sails.__("Coin deleted success")
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
            "message": sails.__("Coin list")
          });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (error) {
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
