module.exports = {
  friendlyName: 'Check Offercode Status',
  description: '',
  inputs: {
    offer_code: {
      type: 'string',
      example: 'TEST10',
      description: 'offercode',
      required: true
    },
    user_id: {
      type: 'string',
      example: '1',
      description: 'UserId',
      required: true
    },
    check_only: {
      type: 'boolean',
      example: true,
      description: 'check_only',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Offers',
    },
    error: {
      description: 'Something Error'
    }
  },

  fn: async function (inputs, exits) {
    const moment = require('moment');
    var error_message = sails.__("Campaign Offer invalid").message;

    var current_date = formatTime();
    // var current_date = moment(new Date()).format();

    // console.log(current_date);
    var offer_code = inputs.offer_code;
    var user_id = inputs.user_id;
    // console.log("user_id",user_id);
    var offer_object = {
      code: offer_code,
      is_active: true
    };
    var response = {};
    // Get Compaign offer code
    var get_campaign_offer_data = await CampaignsOffers.find(offer_object).sort('id DESC').limit(1);
    // console.log("get_campaign_offer_data",get_campaign_offer_data);
    if (get_campaign_offer_data.length == 0) {
      response.status = false;
      response.message = error_message;
      return exits.success(response)
    }
    // Check Campaign
    var campaign_id = get_campaign_offer_data[0].campaign_id;
    var campaign_offer_id = get_campaign_offer_data[0].id;
    // console.log("campaign_id",campaign_id);
    let campaign_object = {
      id: campaign_id,
      is_active: true
    }
    var get_campaign_data = await Campaigns.find(campaign_object).sort('id DESC').limit(1);
    get_campaign_offer_data[0].campaign_data = get_campaign_data[0];
    response.data = get_campaign_offer_data[0];
    // console.log("response", response);
    // console.log("get_campaign_data",get_campaign_data);
    let store_offercode_history;
    if (inputs.check_only) { // To store User attempts
      let history_object = {
        code: offer_code,
        user_id: user_id,
        campaign_id: campaign_id,
        campaign_offer_id: campaign_offer_id
      };
      store_offercode_history = await UsersCampaignsHistory.create(history_object).fetch();
      // console.log("store_offercode_history",store_offercode_history);
    }


    if (get_campaign_data.length == 0) {
      response.status = false;
      response.message = error_message;
      return exits.success(response)
    }

    let total_fees_allowed = get_campaign_offer_data[0].fees_allowed;
    let total_transaction_allowed = get_campaign_offer_data[0].no_of_transactions;
    if (get_campaign_offer_data[0].is_default_values) {
      total_fees_allowed = get_campaign_data[0].fees_allowed;
      total_transaction_allowed = get_campaign_data[0].no_of_transactions;
    }
    var success_message = `Success! up to $${total_fees_allowed} total in FALDAX Transaction Fees are waived for your next ${total_transaction_allowed} Transactions!`;
    // var success_message = __('Campaign Offer valid %s', total_fees_allowed);
    // To make in UTC with 0
    function formatTime(datetime = '') {
      var m = moment();
      if (datetime != '') {
        m = moment(datetime).utcOffset(0);
      }
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      // m.toISOString()
      m.format()
      return m;
    }
    // To check past transactions using Offer
    async function getPastTransactions(user_id = 0, campaign_id, campaign_offer_id) {
      // Get Conversion history to check Offercode applied or not
      let get_data_object = {
        campaign_id: campaign_id,
        campaign_offer_id: campaign_offer_id,
        or: [{ order_status: 'filled' }, { order_status: 'partially_filled' }]
      };
      if (user_id != 0) {
        get_data_object.user_id = user_id;
      }
      // console.log("get_data_object", get_data_object);
      let check_offercode_in_transactions = await JSTTradeHistory
        .find(get_data_object);
      return check_offercode_in_transactions;
    }
    // To Check if Offercode active or not
    async function checkOffercodeStatus(get_campaign_offer_data, is_multiple = false) {
      // Check Offercode is active or not
      if (is_multiple == false && get_campaign_offer_data[0].is_active == false) {
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      }
      if (is_multiple == true && get_campaign_offer_data[0].campaign_data.is_active == false) {
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      }
    }

    // To check validity of Offercode
    async function checkValidityOfOffercode(get_campaign_data, get_campaign_offer_data, is_multiple) {
      // console.log("current_date", current_date);
      // console.log("is_multiple", is_multiple);
      if (is_multiple == false) {
        // console.log(moment( current_date ));
        // console.log(moment( get_campaign_offer_data[0].start_date ));
        // console.log(moment( get_campaign_offer_data[0].end_date ));
        if (moment(current_date).isBetween(moment(get_campaign_offer_data[0].start_date), moment(get_campaign_offer_data[0].end_date), null, '[]')) {
        } else {
          response.status = false;
          response.message = error_message;
          return exits.success(response)
        }
      }

      if (is_multiple == true) {
        // console.log(moment( current_date ));
        // console.log(moment( get_campaign_offer_data[0].campaign_data.start_date ));
        // console.log(moment( get_campaign_offer_data[0].campaign_data.end_date ));
        if (moment(current_date).isBetween(moment(get_campaign_data[0].start_date), moment(get_campaign_data[0].end_date), null, '[]') && moment(current_date).isBetween(moment(get_campaign_offer_data[0].start_date), moment(get_campaign_offer_data[0].end_date), null, '[]')) {
        } else {
          response.status = false;
          response.message = error_message;
          return exits.success(response)
        }
      }

      // if (moment(current_date).isBetween(moment(get_campaign_data[0].start_date), moment(get_campaign_data[0].end_date), null, '[]') && moment(current_date).isBetween(moment(get_campaign_offer_data[0].start_date), moment(get_campaign_offer_data[0].end_date), null, '[]')) {
      // } else {
      //   response.status = false;
      //   response.message = error_message;
      //   return exits.success(response)
      // }
    }

    // Check number of Transactions
    async function checkNumberOfTransaction(get_campaign_offer_data, check_offercode_in_transactions) {
      let total_transactions = check_offercode_in_transactions.length;
      let offer_no_of_transactions = get_campaign_offer_data[0].no_of_transactions;
      // let offer_transaction_fees = get_campaign_offer_data[0].fees_allowed;
      if (get_campaign_offer_data[0].is_default_values == true) {
        offer_no_of_transactions = get_campaign_data[0].no_of_transactions;
      }
      // console.log("offer_no_of_transactions",offer_no_of_transactions);
      // console.log("total_transactions",total_transactions);
      if (total_transactions >= offer_no_of_transactions) {
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      }
    }

    // Check total fees already deducted using Offer
    async function checkTotalFeesDeducted(get_campaign_offer_data, check_offercode_in_transactions) {
      let offer_transaction_fees = get_campaign_offer_data[0].fees_allowed;

      if (get_campaign_offer_data[0].is_default_values == true) {
        offer_transaction_fees = get_campaign_data[0].fees_allowed;
      }

      // Check total fees
      let all_transaction = check_offercode_in_transactions;
      var fiat_faldax_fees = 0;
      for (var ii = 0; ii < (check_offercode_in_transactions.length); ii++) {
        var side = all_transaction[ii].side;
        var coin_pair = all_transaction[ii].symbol;
        var faldax_fees_actual = all_transaction[ii].faldax_fees_actual;
        var each_coin = coin_pair.split("/");
        var query = {};
        if (side == "Buy") {
          query.coin = each_coin[0] + "USD";
          query.ask_price = { '>': 0 };
        } else {
          query.coin = each_coin[1] + "USD";
          query.bid_price = { '>': 0 };
        }
        var get_price = await PriceHistory.find({
          where: query,
        }).sort('id DESC').limit(1)


        let fiat_value = 0;
        if (side == "Buy") {
          fiat_value = get_price[0].ask_price;
        } else {
          fiat_value = get_price[0].bid_price;
        }
        // console.log("Transaction#", all_transaction[ii].order_id);
        // console.log("Fiat_value", fiat_value);
        // console.log("faldax_fees_actual", faldax_fees_actual);
        // console.log("fiat_faldax_fees", fiat_faldax_fees);
        // calculate faldax fees in Fiat
        fiat_faldax_fees += (fiat_value * faldax_fees_actual);

      }

      // console.log("offer_transaction_fees", offer_transaction_fees);
      // console.log("Total fiat_faldax_fees", fiat_faldax_fees);

      if (parseFloat(offer_transaction_fees) <= parseFloat(fiat_faldax_fees)) {
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      } else {
        var remaining_fees = parseFloat(offer_transaction_fees) - parseFloat(fiat_faldax_fees); // Remaining fees in Fiat
        // console.log("remaining_fees", remaining_fees);
        if (remaining_fees > 0) {
          response.status = "truefalse";
          response.discount_values = remaining_fees;
          response.fiat_faldax_fees = fiat_faldax_fees;
          // response.message = `You will get $${remaining_fees} as discount in your fees` ;

          response.message = success_message;
          return exits.success(response)
        }
      }
    }
    // To check if offercode is not of Same Campaign
    async function checkOffercodeCampaign(usage, user_id, campaign_id, campaign_offer_id, store_offercode_history, get_campaign_offer_data) {
      // console.log("Entered......");

      let get_data_object = {
        campaign_id: campaign_id,
        or: [{ order_status: 'filled' }, { order_status: 'partially_filled' }]
      };
      if (user_id != 0) {
        get_data_object.user_id = user_id;
      }
      let check_offercode_campaign;
      if (usage == 1) {
        check_offercode_campaign = await CampaignsOffers.find({ campaign_id: campaign_id, user_id: user_id }).sort('id DESC').limit(1);
      } else {
        check_offercode_campaign = await JSTTradeHistory
          .find(get_data_object).sort("id DESC").limit(1);
      }

      // console.log("usage",usage);
      // console.log("inputs.check_only",inputs.check_only);
      // console.log("check_offercode_campaign.length",check_offercode_campaign.length);
      // console.log("check_offercode_campaign[0]",check_offercode_campaign[0]);
      // console.log("campaign_id",campaign_id);
      // console.log("get_campaign_offer_data",get_campaign_offer_data);
      // console.log("user_id",user_id);

      if (usage == 0 && check_offercode_campaign.length > 0 && check_offercode_campaign[0].campaign_offer_id != campaign_offer_id) {
        if (inputs.check_only) {
          await UsersCampaignsHistory.updateOne({ id: store_offercode_history.id }).set({ wrong_attempted: true });
        }
        response.status = false;
        response.message = error_message;
        return exits.success(response)
        // }else if(usage == 1 && check_offercode_campaign.length > 0 && (check_offercode_campaign[0].campaign_offer_id != campaign_offer_id) && check_offercode_campaign[0].user_id != user_id  ){
      } else if (usage == 1 && check_offercode_campaign.length > 0 && (check_offercode_campaign[0].campaign_id == campaign_id) && get_campaign_offer_data[0].user_id != user_id) {
        if (inputs.check_only) {
          await UsersCampaignsHistory.updateOne({ id: store_offercode_history.id }).set({ wrong_attempted: true });
        }
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      } else if (usage == 1 && get_campaign_offer_data[0].user_id != user_id) {
        response.status = false;
        response.message = error_message;
        return exits.success(response)
      }
    }
    // Check type of Campaign
    if (get_campaign_data[0].usage == 1) {

      // Get Conversion history to check Offercode applied or not // Function
      let check_offercode_in_transactions = await getPastTransactions(user_id, campaign_id, campaign_offer_id);
      let check_offercode_same_campaign = await checkOffercodeCampaign(1, user_id, campaign_id, campaign_offer_id, store_offercode_history, get_campaign_offer_data);
      if (check_offercode_in_transactions.length == 0) {
        // Check validity of Code
        let check_offer_validity = await checkValidityOfOffercode(get_campaign_data, get_campaign_offer_data, false);
        // No block of code
        let check_offer_status = await checkOffercodeStatus(get_campaign_offer_data);
      } else {
        // Check Offercode is expired or not
        let check_offer_validity = await checkValidityOfOffercode(get_campaign_data, get_campaign_offer_data, false);
        // Check Offercode is active or not // Function
        let check_offer_status = await checkOffercodeStatus(get_campaign_offer_data);
        // Get Number of transactions and Total fees of old transactions
        let check_total_transaction = await checkNumberOfTransaction(get_campaign_offer_data, check_offercode_in_transactions);

        let check_total_fees = await checkTotalFeesDeducted(get_campaign_offer_data, check_offercode_in_transactions);
      }
    } else { // If Multiple usage
      let check_offercode_in_transactions = await getPastTransactions(user_id, campaign_id, campaign_offer_id);
      // console.log( "check_offercode_in_transactions",check_offercode_in_transactions );
      // console.log("check_offercode_in_transactions.length",check_offercode_in_transactions.length);
      let check_offercode_same_campaign = await checkOffercodeCampaign(0, user_id, campaign_id, campaign_offer_id, store_offercode_history, get_campaign_offer_data);
      if (check_offercode_in_transactions.length == 0) {
        let check_offer_validity = await checkValidityOfOffercode(get_campaign_data, get_campaign_offer_data, true);
        // No block of code
        let check_offer_status = await checkOffercodeStatus(get_campaign_offer_data, true);
      } else {
        let check_offer_validity = await checkValidityOfOffercode(get_campaign_data, get_campaign_offer_data, true);
        // let check_offercode_same_campaign = await checkOffercodeCampaign(user_id, campaign_id, campaign_offer_id);
        let check_offer_status = await checkOffercodeStatus(get_campaign_offer_data, true);
        let check_total_transaction = await checkNumberOfTransaction(get_campaign_offer_data, check_offercode_in_transactions);
        let check_total_fees = await checkTotalFeesDeducted(get_campaign_offer_data, check_offercode_in_transactions);
        // console.log("check_total_fees",check_total_fees);
      }

    }
    // For valid only
    // let total_fees_allowed = get_campaign_data[0].fees_allowed;
    // let total_transaction_allowed = get_campaign_data[0].no_of_transactions;
    // if( get_campaign_offer_data[0].is_default_values ){
    //   total_fees_allowed = get_campaign_data[0].fees_allowed;
    //   total_transaction_allowed = get_campaign_data[0].no_of_transactions;
    // }

    get_campaign_offer_data[0].campaign_data = get_campaign_data[0];
    response = {
      status: true,
      message: success_message,
      data: get_campaign_offer_data[0]
    }
    return exits.success(response)

  }


};
