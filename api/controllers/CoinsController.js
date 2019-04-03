/**
 * CoinsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
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
        return res.json({ "status": 200, "message": sails.__("Coin list"), "data": allCoins, allCoinsCount });
      }
    } catch (err) {
      console.log(err);

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
      let { page, limit, data } = req.allParams();
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
          or: [
            {
              coin_name: {
                contains: data
              }
            }, {
              coin_code: {
                contains: data
              }
            }
          ]
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
            or: [
              {
                coin_name: {
                  contains: data
                }
              }, {
                coin_code: {
                  contains: data
                }
              }
            ]
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
          .find({ deleted_at: null, is_active: true })
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
          return res.json({ "status": 200, "message": sails.__("Coin list"), "data": balanceRes, allCoinsCount });
        }
      }
    } catch (err) {
      return res.status(500).json({ status: 500, "err": sails.__("Something Wrong") });
    }
  },

  //Create Wallet
  createWallet: async function (req, res) {
    let { coin_id } = req.allParams();
    var requestedCoin = await Coins.find({ id: coin_id, deleted_at: null, is_active: true });
    await sails
      .helpers
      .wallet
      .create(requestedCoin.coin_code);
    return res.json({ "status": 200, "message": "wallet created" });
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

      return res.json({ "status": 200, "message": "wallet created" });
    } catch (error) {
      if (error.raw) {
        return res.status(500).json({ status: 500, "err": error.raw.err });
      } else {
        return res.status(500).json({ status: 500, "err": sails.__("Something Wrong") });
      }
    }
  },

  // Get Coin list for conversion screen
  getCoinsForConversion: async function (req, res) {
    try {
      let coins = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_fiat: false,
          kraken_coin_name: { '!=': null }
        }
      }).select(["coin_icon", "coin_name", "coin"]);
      return res.json({
        "status": 200,
        "message": sails.__("Coin list"),
        "data": coins
      });
    } catch (error) {
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
        name: { startsWith: req.query.crypto + '-' },
        deleted_at: null,
        is_active: true,
      });
      console.log("pair", req.query.crypto, pair);

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
          kraken_coin_name: { '!=': null },
          id: { in: coinIds }
        }
      }).select(["coin_icon", "coin_name", "coin"]);
      return res.json({
        "status": 200,
        "message": sails.__("Coin list"),
        "data": coins
      });
    } catch (error) {
      console.log(error);

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
          sails.sockets.leave(req.socket, prevRoom, function (err) {
            if (err) {
              return res.status(403).json({ status: 403, "message": "Error occured" });
            } else {
              sails.sockets.join(req.socket, room, async function (err) {
                if (err) {
                  return res.status(403).json({ status: 403, "message": "Error occured" });
                } else {

                  let pair = await Pairs.findOne({
                    name: room,
                    is_active: true,
                    deleted_at: null
                  });
                  return res.json({
                    status: 200,
                    data: pair,
                    "message": "Pair retrived successfully"
                  });
                }
              });
            }
          });
        } else {
          sails.sockets.join(req.socket, room, async function (err) {
            if (err) {
              return res.status(403).json({ status: 403, "message": "Error occured" });
            } else {
              let pair = await Pairs.findOne({
                name: room,
                is_active: true,
                deleted_at: null
              });
              return res.json({
                status: 200,
                data: pair,
                "message": "Pair retrived successfully"
              });
            }
          });
        }
      } else {
        return res.status(403).json({ status: 403, "message": "Error occured" });
      }
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
  getCoins: async function (req, res) {
    try {
      let { page, limit, data, sortCol, sortOrder } = req.allParams();
      let query = " from coins";
      if ((data && data != "")) {
        query += " WHERE"
        if (data && data != "" && data != null) {
          query = query + " LOWER(coin_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(coin_code) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query = query + " OR maxLimit=" + data + " OR minLimit=" + data;
          }
        }
      }
      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let coinData = await sails.sendNativeQuery("Select *" + query, [])

      coinData = coinData.rows;

      let CoinsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      CoinsCount = CoinsCount.rows[0].count;

      if (coinData) {
        return res.json({
          "status": 200, "message": sails.__("Coin list"), "data": coinData, CoinsCount
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  create: async function (req, res) {
    req
      .file('coin_icon')
      .upload(async function (err, uploadedFiles) {
        try {
          if (uploadedFiles.length > 0) {
            var uploadIcon = await UploadFiles.upload(uploadedFiles[0].fd, 'coin/' + req.body.coin_code);

            if (req.body.coin_name && req.body.coin_code && req.body.minLimit) {
              let existingCoin = await Coins.find({
                deleted_at: null,
                or: [
                  {
                    coin_name: req.body.coin_name
                  }, {
                    coin_code: req.body.coin_code
                  }
                ]
              });
              if (existingCoin.length > 0) {
                return res.status(400).json({ "status": 400, "err": "Coin name or code already in use." });
              }
              var coins_detail = await Coins
                .create({
                  coin_icon: 'faldax/coin/' + req.body.coin_code,
                  coin_name: req.body.coin_name,
                  coin_code: req.body.coin_code,
                  minLimit: req.body.minLimit,
                  maxLimit: req.body.maxLimit,
                  isERC: req.body.isERC,
                  //wallet_address: req.body.wallet_address,
                  created_at: new Date()
                })
                .fetch();
              if (coins_detail) {
                res.json({ "status": 200, "message": "Coin created successfully." });
                return;
              } else {
                return res.status(400).json({ "status": 400, "err": "Something went wrong" });
              }
            } else {
              return res.status(400).json({ "status": 400, "err": "coin id is not sent" });
            }
          } else {
            return res.status(400).json({ "status": 400, "err": "coin icon is not sent" });
          }
        } catch (error) {
          return res.status(500).json({ status: 500, "err": sails.__("Something Wrong") });
        }
      });
  },

  update: async function (req, res) {
    try {
      const coin_details = await Coins.findOne({ id: req.body.coin_id });
      if (!coin_details) {
        return res
          .status(401)
          .json({ status: 401, err: 'Invalid coin' });
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
          return res.status(400).json({ "status": 400, "err": "Coin name or code already in use." });
        }
      }
      var coinData = {
        id: req.body.coin_id,
        ...req.body
      }
      var updatedCoin = await Coins
        .update({ id: req.body.coin_id })
        .set(req.body)
        .fetch();
      if (!updatedCoin) {
        return res.json({ "status": 200, "message": "Something went wrong! could not able to update coin details" });
      }
      return res.json({ "status": 200, "message": "Coin details updated successfully" });
    } catch (error) {
      return res.status(500).json({ status: 500, "err": sails.__("Something Wrong") });
    }
  },

  delete: async function (req, res) {
    let { id } = req.allParams();
    if (!id) {
      return res.status(500).json({ "status": 500, "err": "Coin id is not sent" });
    }
    let coinData = await Coins
      .update({ id: id })
      .set({ deleted_at: new Date() })
      .fetch();
    if (coinData) {
      return res.status(200).json({ "status": 200, "message": "Coin deleted successfully" });
    }
  }
};
