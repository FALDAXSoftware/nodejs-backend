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
        .select(['coin_name', 'coin_code','coin']);

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
      if (data) {
        var balanceRes = await sails.sendNativeQuery("SELECT coins.*, wallets.balance, wallets.placed_balance FROM coins LEFT JOIN wal" +
          "lets ON coins.id = wallets.coin_id WHERE (coins.coin_name LIKE '%" + data + "%' OR coins.coin_code LIKE '%" + data + "%') AND coins.is_active = true AND coins.deleted_at IS NULL ORDER BY wallets.bal" +
          "ance DESC LIMIT " + limit + " OFFSET " + (limit * (page - 1)));

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
        var balanceRes = await sails.sendNativeQuery(`SELECT coins.*, wallets.balance, wallets.placed_balance FROM coins LEFT JOIN wallets ON coins.id = wallets.coin_id WHERE coins.is_active = true AND coins.deleted_at IS NULL ORDER BY wallets.balance DESC LIMIT ${limit} OFFSET ${page} `);

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
      console.log('>>>>err', err);
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
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
          console.log("unkown------");
          throw err;
        });
      console.log("result", result);

      return res.json({ "status": 200, "message": "wallet created" });
    } catch (error) {
      // console.log("error", error);
      if (error.raw) {
        return res
          .status(500)
          .json({ status: 500, "err": error.raw.err });
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

  //-------------------------------CMS Api--------------------------
  getCoins: async function (req, res) {
    // req.setLocale('en')
    let { page, limit, data } = req.allParams();
    if (data) {
      let coinsData = await Coins.find({
        where: {
          deleted_at: null,
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
      })
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));
      let CoinsCount = await Coins.count({
        where: {
          deleted_at: null,
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
      if (coinsData) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list"),
          "data": coinsData,
          CoinsCount
        });
      }
    } else {
      let coinsData = await Coins
        .find({
          where: {
            deleted_at: null
          }
        })
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));
      let CoinsCount = await Coins.count({
        where: {
          deleted_at: null
        }
      });
      if (coinsData) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list"),
          "data": coinsData,
          CoinsCount
        });
      }
    }
  },

  create: async function (req, res) {
    req
      .file('coin_icon')
      .upload(async function (err, uploadedFiles) {
        try {
          if (uploadedFiles.length > 0) {
            var uploadIcon = await UploadFiles.upload(uploadedFiles[0].fd, 'coin/' + req.body.coin_code);

            if (req.body.coin_name && req.body.coin_code && req.body.limit && req.body.wallet_address) {
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
                res
                  .status(400)
                  .json({ "status": 400, "err": "Coin name or code already in use." });
                return;
              }
              var coins_detail = await Coins
                .create({
                  coin_icon: 'faldax/coin/' + req.body.coin_code,
                  coin_name: req.body.coin_name,
                  coin_code: req.body.coin_code,
                  limit: req.body.limit,
                  wallet_address: req.body.wallet_address,
                  created_at: new Date()
                })
                .fetch();
              if (coins_detail) {
                //Send verification email in before create
                res.json({ "status": 200, "message": "Coin created successfully." });
                return;
              } else {
                res
                  .status(400)
                  .json({ "status": 400, "err": "Something went wrong" });
                return;
              }
            } else {
              res
                .status(400)
                .json({ "status": 400, "err": "coin id is not sent" });
              return;
            }
          } else {
            res
              .status(400)
              .json({ "status": 400, "err": "coin icon is not sent" });
            return;
          }
        } catch (error) {
          res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
            });
          return;
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
          res
            .status(400)
            .json({ "status": 400, "err": "Coin name or code already in use." });
          return;
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
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  delete: async function (req, res) {
    let { id } = req.allParams();
    if (!id) {
      res
        .status(500)
        .json({ "status": 500, "err": "Coin id is not sent" });
      return;
    }
    let coinData = await Coins
      .update({ id: id })
      .set({ deleted_at: new Date() })
      .fetch();
    if (coinData) {
      return res
        .status(200)
        .json({ "status": 200, "message": "Coin deleted successfully" });
    }
  }
};
