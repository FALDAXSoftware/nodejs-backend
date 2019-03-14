/**
 * TicketController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //---------------------------Web Api------------------------------
  getCoinInfo: async function (req, res) {
    var coin_code = 'STRAT';

    var getInfo = sails
      .helpers
      .type2Coins
      .stratis
      .getNewAddress(coin_code);

    console.log("Coin Info :: ", getInfo);
  }

}
