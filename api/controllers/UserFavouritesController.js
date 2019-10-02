/**
 * UserLimitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');
var {
  map,
  sortBy
} = require('lodash');
var logger = require("./logger")
module.exports = {
  // ---------------------------Web Api------------------------------

  getFavourites: async function (req, res) {
    try {
      var user_id = req.user.id;
      var cardData = [];
      var favouritesData = await UserFavourites.find({
        where: {
          deleted_at: null,
          user_id: user_id
        }
      }).sort('priority', 'ASC');

      var yesterday = moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var today = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

      for (var i = 0; i < favouritesData.length; i++) {
        var total_price = 0;
        var average_price = 0;
        var flag = true;

        var price = await TradeHistory.find({
          where: {
            settle_currency: favouritesData[i].pair_to,
            currency: favouritesData[i].pair_from,
            created_at: {
              '>=': yesterday
            }
          }
        })

        if (price.length == 0) {
          average_price = 0
        } else {
          map(price, p => {
            total_price = total_price + ((p.fill_price) / (p.quantity))
          });
          average_price = total_price / price.length;
        }

        var current_price = await TradeHistory.find({
          where: {
            settle_currency: favouritesData[i].pair_to,
            currency: favouritesData[i].pair_from,
            created_at: {
              '>=': yesterday
            },
            created_at: {
              '<=': today
            }
          }
        }).sort('id', 'DESC')

        if (current_price == undefined || current_price.length == 0) {
          current_price = 0;
        } else {
          current_price = current_price[0].fill_price;
        }

        var previous_price = await TradeHistory.find({
          where: {
            settle_currency: favouritesData[i].pair_to,
            currency: favouritesData[i].pair_from,
            created_at: {
              '>=': yesterday
            },
            created_at: {
              '<=': today
            }
          }
        }).sort('id', 'ASC');

        if (previous_price == undefined || previous_price.length == 0) {
          previous_price = 0;
        } else {
          previous_price = previous_price[0].fill_price;
        }

        var diffrence = current_price - previous_price;
        var percentchange = (diffrence * 100 / previous_price);

        if (percentchange == NaN || percentchange == "-Infinity") {
          percentchange = 0;
        } else {
          percentchange = percentchange;
        }

        if (diffrence <= 0) {
          flag = false;
        } else {
          flag = true;
        }

        var tradeOrderDetails = await TradeHistory.find({
          settle_currency: favouritesData[i].pair_to,
          currency: favouritesData[i].pair_from,
          created_at: {
            '>=': yesterday
          },
          created_at: {
            '<=': today
          }
        }).sort('created_at', 'ASC');

        var card_data = {
          "pair_from": favouritesData[i].pair_from,
          "pair_to": favouritesData[i].pair_to,
          'priority': favouritesData[i].priority,
          "average_price": average_price,
          "diffrence": diffrence,
          "percentchange": percentchange,
          "flag": flag,
          "tradeChartDetails": tradeOrderDetails
        }
        cardData.push(card_data);
        // return cardData;
      }

      // await Promise.all(promises);

      return res.status(200).json({
        "status": 200,
        "message": sails.__("Favourites List Success"),
        "data": sortBy(cardData, ['priority'])
      })
    } catch (error) {
      console.log(error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }

  // -------------------------------CMS Api--------------------------
};
