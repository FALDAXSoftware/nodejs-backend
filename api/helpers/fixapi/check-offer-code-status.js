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
    user_id:{
      type: 'string',
      example: '1',
      description: 'UserId',
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
    
    var current_date = moment(new Date()).format("YYYY-MM-DD")
    console.log(current_date);
    var offer_code = inputs.offer_code;
    var user_id = inputs.user_id;
    var offer_object = {
      code:offer_code
    };
    var response;
    // Get Compaign offer code
    var get_campaign_offer_data = await CampaignsOffers.find( offer_object ).sort('id DESC').limit(1);
    console.log("get_campaign_offer_data",get_campaign_offer_data);
    if( get_campaign_offer_data.length == 0 ){
      response = {
        status:false,
        message:'Invalid offer code'
      }
      return exits.success(response)
    }
    // Check Campaign 
    var campaign_id = get_campaign_offer_data[0].campaign_id;
    var campaign_offer_id = get_campaign_offer_data[0].id;
    console.log("campaign_id",campaign_id);
    let campaign_object = {
      id:campaign_id
    }
    var get_campaign_data = await Campaigns.find(campaign_object).sort('id DESC').limit(1);
    console.log("get_campaign_data",get_campaign_data);
    console.log("user_id",user_id);
    if( get_campaign_data.length == 0 ){
      response = {
        status:false,
        message:'Campaign does not exist for this Offer code'
      }
      return exits.success(response)
    }

    // To check past transactions using Offer
    async function getPastTransactions( user_id=0, campaign_offer_id ){
      // Get Conversion history to check Offercode applied or not
      let get_data_object = {
        campaign_offer_id:campaign_offer_id,
        or: [{ order_status: 'filled'},{order_status: 'partially_filled'}]
      };
      if( user_id != 0 ){
        get_data_object.user_id = user_id;
      }
      let check_offercode_in_transactions = await JSTTradeHistory
          .find( get_data_object ); 
      return check_offercode_in_transactions;    
    }


    // Check type of Campaign
    if( get_campaign_data[0].usage == 1 ){
      // Check code is applied by valid user
      if( get_campaign_offer_data[0].user_id != user_id ){
        response = {
          status:false,
          message:'Sorry, Offer code is not applicable for you'
        }
        return exits.success(response)
      }
      // Get Conversion history to check Offercode applied or not // Function
      // let get_data_object = {
      //   user_id: user_id,
      //   campaign_offer_id:campaign_offer_id,
      //   or: [{ order_status: 'filled'},{order_status: 'partially_filled'}]
      // };
      // let check_offercode_in_transactions = await JSTTradeHistory
      //     .find( get_data_object ); 

      
      let check_offercode_in_transactions = getPastTransactions( user_id, campaign_offer_id );
      console.log( "check_offercode_in_transactions",check_offercode_in_transactions ); 
      if( check_offercode_in_transactions.length == 0 ){
        
      }else{
        // Check Offercode is active or not
        if( get_campaign_offer_data[0].is_active == false ){
          response = {
            status:false,
            message:'Sorry, Offer code is not active now',
            data : check_offercode_in_transactions
          }
          return exits.success(response)
        }
        // Check Offercode is expired or not
        if( moment( current_date ).isBetween(get_campaign_offer_data[0].start_date, get_campaign_offer_data[0].end_date) ){
          // Get Number of transactions and Total fees of old transactions
          let total_transactions = check_offercode_in_transactions.length;
          let offer_no_of_transactions = get_campaign_offer_data[0].no_of_transactions;
          let offer_transaction_fees = get_campaign_offer_data[0].fees_allowed;
          if( get_campaign_offer_data[0].is_default_values == true ){
            offer_no_of_transactions = get_campaign_data[0].no_of_transactions; 
            offer_transaction_fees = get_campaign_data[0].fees_allowed;
          }
          if( total_transactions >= offer_no_of_transactions ){
            response = {
              status:false,
              message:'You have already exceeded Number of transactions for this Offer',
              data : check_offercode_in_transactions
            }
            return exits.success(response)
          }
          // Check total fees 
          let all_transaction = check_offercode_in_transactions;
          var fiat_faldax_fees = 0;
          for( var ii=0; ii<(check_offercode_in_transactions.length); ii++ ){
            var side = all_transaction[ii].side;
            var coin_pair = all_transaction[ii].symbol;
            var faldax_fees_actual = all_transaction[ii].faldax_fees_actual;
            var each_coin = coin_pair.split("/");
            var query={};
            if( side == "Buy" ){
              query.coin = each_coin[0]+"/USD";
              query.ask_price ={'>':0} ;
            }else{
              query.coin = each_coin[1]+"/USD";
              query.bid_price ={'>':0};
            }
            var get_price = await PriceHistory.find({
              where: query,
            }).sort('id DESC').limit(1)

            
            let fiat_value = 0;
            if( side == "Buy" ){
              fiat_value = get_price.ask_price;
            }else{
              fiat_value = get_price.bid_price;
            }
            // calculate faldax fees in Fiat
            fiat_faldax_fees += (fiat_value * faldax_fees_actual);     
          }
          if( offer_transaction_fees <= fiat_faldax_fees ){
            response = {
              status:false,
              message:'You have already exceeded total amount of fees for this Offer',
              data : check_offercode_in_transactions
            }
            return exits.success(response)
          }
        }else{
          response = {
            status:false,
            message:'Sorry, Offer code is already expired',
            data : check_offercode_in_transactions
          }
          return exits.success(response)
        }
        

        
      }      
    }else{

    }  
    // For valid only
    response = {
      status:true,
      message:'valid'
    }
    return exits.success(response)


    return exits.success(response);
  }


};
