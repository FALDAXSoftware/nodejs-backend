/**
 * PairsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //---------------------------Web Api------------------------------
  getInstrumentPair: async function (req, res) {
    let coin = req.query.coin;
    try {
      if (req.isSocket) {
        sails
          .sockets
          .join(req.socket, coin, async function (err) {
            if (err) {
              console.log('>>>err', err);
              return res
                .status(403)
                .json({status: 403, "message": "Error occured"});
            } else {
              var response = await sails
                .helpers
                .tradding
                .getInstrumentData(coin);

              console.log({response});

              return res
                .status(200)
                .json({status: 200, "message": "", data: response});
            }
          });
      } else {
        console.log('>>>IN else')
        return res
          .status(403)
          .json({status: 403, "message": "Error occured"});
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  //-------------------------------CMS Api--------------------------
  getAllPairs: async function (req, res) {
    // req.setLocale('en')
    let {page, limit, data} = req.allParams();
    if (data) {
      let pairData = await Pairs.find({
        where: {
          deleted_at: null,
          or: [
            {
              name: {
                contains: data
              }
            }, {
              coin_code1: {
                contains: data
              }
            }, {
                coin_code2: {
                  contains: data
                }
              }
            ]
        }
        })
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));
      let pairsCount = await Pairs.count({
        where: {
          deleted_at: null,
          or: [
            {
              name: {
                contains: data
              }
            }, {
              coin_code1: {
                contains: data
              }
            }, {
              coin_code2: {
                contains: data
              }
            }
          ]
        }
      });
      if (pairData) {
        return res.json({
          "status": 200,
          "message": sails.__("Pair list"),
          "data": pairData,
          pairsCount
        });
      }
    } else {
      let pairData = await Pairs
        .find({
        where: {
          deleted_at: null
        }
      })
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));

      let allCoins = await Coins.find({
        where: {
          is_active: true,
          deleted_at: null
        },
        select: ['id', 'coin_name', 'coin_code']
      });
      let pairsCount = await Pairs.count({
        where: {
          deleted_at: null
        }
      });

      if (pairData) {
        return res.json({
          "status": 200,
          "message": sails.__("Pair list"),
          "data": pairData,
          pairsCount,
          allCoins
        });
      }
    }
  },

  createPair: async function (req, res) {
    try {
      if (req.body.name && req.body.coin_code1 && req.body.coin_code1) {

        let coinID_1 = await Coins.findOne({coin_code: req.body.coin_code1});
        let coinID_2 = await Coins.findOne({coin_code: req.body.coin_code1});

        var pair_details = await Pairs
          .create({
          name: req.body.name,
          coin_code1: coinID_1.id,
          coin_code2: coinID_2.id,
          maker_fee: req.body.maker_fee,
          taker_fee: req.body.taker_fee,
          created_at: new Date()
        })
          .fetch();
        if (pair_details) {
          res.json({
            "status": 200,
            "message": sails.__('Create Pair')
          });
          return;
        } else {
          res
            .status(400)
            .json({"status": 400, "err": "not listed"});
          return;
        }
      } else {
        res
          .status(400)
          .json({"status": 400, "err": "Pair Name & coin is not sent"});
        return;
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  updatePair: async function (req, res) {
    try {
      if (req.body.id) {
        const pair_details = await Pairs.findOne({id: req.body.id});
        if (!pair_details) {
          return res
            .status(401)
            .json({err: 'invalid coin'});
        }
        var updatedPair = await Pairs
          .update({id: req.body.id})
          .set(req.body)
          .fetch();
        if (!updatedPair) {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Something Wrong")
            });
        }
        return res.json({
          "status": 200,
          "message": sails.__('Update Pair')
        });
      } else {
        return res
          .status(400)
          .json({'status': 400, 'err': 'pair id is not sent.'})
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  }
};
