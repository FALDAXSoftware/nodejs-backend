const request = require('request');
module.exports = {
  friendlyName: 'Get Market Snapshot Price',
  description: '',
  inputs: {
    symbol: {
      type: 'string',
      example: 'XRP/BTC',
      description: 'Symbol of Pair',
      required: true
    },side: {
      type: 'string',
      example: 'Buy',
      description: 'Buy or Sell',
      required: true
    },order_quantity: {
      type: 'string',
      example: '10',
      description: 'Buy or Sell',
      required: true
    },flag: {
      type: 'string',
      example: '1',
      description: 'Flag for which asset is editable',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Price',
    },
    error: {
      description: 'Something Error'
    }
  },
  //Response

  /*
  {
    "TargetSubID": null,
    "MDReqID": "1024",
    "Symbol": "XRP/BTC",
    "Product": 4,
    "MaturityDate": null,
    "MDEntries": [
        {
            "MDEntryType": "0",
            "MDEntryPx": 0.00002997,
            "Currency": "XRP",
            "MDEntrySize": 67759.0,
            "QuoteCondition": "A",
            "MinQty": null,
            "MDEntryID": null,
            "NumberOfOrders": null
        },
      ]
    }
  */

  fn: async function (inputs, exits) {
    var md_entry_type = (inputs.side == "Buy" ? 1 : 0 );
    request({
      url: 'http://3.19.249.13:8080/Market/GetQuoteSnapshot?symbol='+inputs.symbol+'&mdEntyType='+md_entry_type,
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      // body: {
      //   symbol: inputs.symbol
      // },
      json: true
    }, async function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      console.log("body",body);
      // Add data in table
      let object_data = {
        symbol:body.Symbol,
        target_sub_id:body.TargetSubID,
        md_req_id:body.MDReqID,
        product:body.Product,
        maturity_date:body.MaturityDate,
        md_entries:{MDEntries:body.MDEntries},
        limit_price:0.0
      };
      await MarketSnapshotPrices.create( object_data );
      let ask_price = bid_size = limit_price=  0.0;
      let response_data = [{
        coin:body.Symbol,
        ask_price:0.0,
        ask_size:0.0,
        bid_price:0.0,
        bid_size:0.0,
      }]
      var total=0.0;
      var MDEntries = body.MDEntries;
      var total_sell=0.0;
      var calculate_quantity = 0.0;
      if( MDEntries.length > 0 ){
        
        for(var i=0; i<MDEntries.length;i++){
          if( inputs.side == "Buy" ){
            if( MDEntries[i].MDEntryType == 1 || MDEntries[i].MDEntryType == "1"  ){
              if( inputs.flag == 1 || inputs.flag == "1"){ // BTC Editable
                if( i == 0){
                  calculate_quantity = parseFloat(inputs.order_quantity)/MDEntries[i].MDEntryPx;
                }              
                total_sell = calculate_quantity - parseFloat(MDEntries[i].MDEntrySize); 
                total += parseFloat(MDEntries[i].MDEntrySize);
                if( total > calculate_quantity ){  
                // if( parseFloat(MDEntries[i].MDEntrySize) > parseFloat(inputs.order_quantity) ){
                  response_data[0].ask_price = MDEntries[i].MDEntryPx;
                  response_data[0].limit_price = MDEntries[i].MDEntryPx;
                  break;
                }
              }else{
                total += parseFloat(MDEntries[i].MDEntrySize);
                // if( parseFloat(MDEntries[i].MDEntrySize) > parseFloat(inputs.order_quantity) ){
                if( total > parseFloat(inputs.order_quantity) ){  
                  response_data[0].ask_price = MDEntries[i].MDEntryPx;
                  response_data[0].limit_price = MDEntries[i].MDEntryPx;
                  break;
                }
              }
              
            }
          }
          if( inputs.side == "Sell" ){
            if( MDEntries[i].MDEntryType == 0 || MDEntries[i].MDEntryType == "0"  ){
              if( inputs.flag == 2 || inputs.flag == "2"){ // BTC Editable
                if( i == 0){
                  calculate_quantity = parseFloat(inputs.order_quantity)/MDEntries[i].MDEntryPx;
                }              
                total_sell = calculate_quantity - parseFloat(MDEntries[i].MDEntrySize); 
                total += parseFloat(MDEntries[i].MDEntrySize);
                if( total > calculate_quantity ){  
                // if( parseFloat(MDEntries[i].MDEntrySize) > parseFloat(inputs.order_quantity) ){
                  response_data[0].bid_price = MDEntries[i].MDEntryPx;
                  response_data[0].limit_price = MDEntries[i].MDEntryPx;
                  break;
                }
              }else{
                total += parseFloat(MDEntries[i].MDEntrySize);
                // if( parseFloat(MDEntries[i].MDEntrySize) > parseFloat(inputs.order_quantity) ){
                if( total > parseFloat(inputs.order_quantity) ){  
                  response_data[0].bid_price = MDEntries[i].MDEntryPx;
                  response_data[0].limit_price = MDEntries[i].MDEntryPx;
                  break;
                }
              }
              
              
            }
          }
        }
      }
      console.log("response_data",response_data);
      //ends

      return exits.success(response_data);
    });

  }


};

