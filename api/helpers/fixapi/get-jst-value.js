module.exports = {


  friendlyName: 'Get jst value',


  description: '',


  inputs: {
    value_object: {
      type: 'json',
      example: '{}',
      description: 'JSON object for which the value needs to be obtained'
    },
  },


  exits: {

    success: {
      outputFriendlyName: 'Jst value',
    },

  },


  fn: async function (inputs, exits) {

    // Get jst value.
    var jstValue;
    // TODO
    try {
      var req_body = inputs.value_object;
      var get_faldax_fee;
      var get_network_fees;
      var feesCurrency;
      var usd_value = req_body.usd_value;
      var flag = req_body.flag;
      var priceValue = 0;
      var totalValue;
      var faldax_fee_value;
      var usd_price;
      var price_value_usd = 0;
      var original_value = 0;
      var {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies((req_body.original_pair).replace("/", '-'));
      var returnData;

      // Checking for the pair and side
      if (req_body.original_pair == req_body.order_pair) {
        // Means The part which you want to send is being editable for flag = 1
        if (flag == 1) {

          var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"));
          if (req_body.Side == 1) {
            priceValue = (1 / get_jst_price[0].ask_price);
          }

          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].ask_price)
          } else {
            var price_value = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 1) {
              price_value_usd = (1 / price_value[0].ask_price);
            }
            price_value_usd = price_value_usd * usd_value;
            totalValue = (price_value_usd * priceValue)
          }

          if (req_body.Side == 1) {
            feesCurrency = crypto;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), req_body.OrderQty, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (totalValue * ((faldax_fee.value) / 100))
            get_faldax_fee = totalValue - get_network_fees - ((totalValue * (faldax_fee.value) / 100))
            original_value = totalValue;
          }
          returnData = {
            "network_fee": get_network_fees,
            "faldax_fee": faldax_fee_value,
            "total_value": get_faldax_fee,
            "currency": feesCurrency,
            "price_usd": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? usd_price : totalValue,
            "currency_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? req_body.OrderQty : price_value_usd,
            "original_value": original_value,
            "orderQuantity": original_value
          }
        } else if (flag == 2) {
          var valueUSD
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"));
          if (req_body.Side == 1) {
            priceValue = (get_jst_price[0].ask_price);
          }
          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].ask_price)
          } else {
            var price_value = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 1) {
              price_value_usd = (1 / price_value[0].ask_price);
            }
            price_value_usd = price_value_usd * usd_value;
            totalValue = (price_value_usd * priceValue)
            var price_value1 = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            valueUSD = usd_value * (1 / price_value1[0].ask_price)
          }
          if (req_body.Side == 1) {
            feesCurrency = crypto;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), req_body.OrderQty, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (req_body.OrderQty * ((faldax_fee.value) / 100))
            get_faldax_fee = (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) ? (parseFloat(req_body.OrderQty) + parseFloat(get_network_fees) + parseFloat(((req_body.OrderQty * (faldax_fee.value) / 100)))) : (parseFloat(price_value_usd) + parseFloat(get_network_fees) + parseFloat(((price_value_usd * (faldax_fee.value) / 100))));
            original_value = req_body.OrderQty
          }
          returnData = {
            "network_fee": get_network_fees,
            "faldax_fee": faldax_fee_value,
            "total_value": get_faldax_fee,
            "currency": feesCurrency,
            "price_usd": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? usd_price : usd_value,
            "currency_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? totalValue : valueUSD,
            "original_value": original_value,
            "orderQuantity": get_faldax_fee
          }
        }
      } else if (req_body.original_pair != req_body.order_pair) {
        if (flag == 1) {
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice((req_body.original_pair), (req_body.Side == 1 ? "Buy" : "Sell"));
          if (req_body.Side == 2) {
            priceValue = (get_jst_price[0].bid_price);
          }
          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].bid_price)
          } else {
            var price_value = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 2) {
              price_value_usd = (1 / price_value[0].bid_price);
            }
            price_value_usd = price_value_usd * usd_value;
            totalValue = (price_value_usd * priceValue)
          }

          if (req_body.Side == 2) {
            feesCurrency = currency;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), req_body.OrderQty, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (totalValue * ((faldax_fee.value) / 100))
            get_faldax_fee = totalValue - get_network_fees - ((totalValue * (faldax_fee.value) / 100))
            original_value = totalValue;
          }
          returnData = {
            "network_fee": get_network_fees,
            "faldax_fee": faldax_fee_value,
            "total_value": get_faldax_fee,
            "currency": feesCurrency,
            "price_usd": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? usd_price : totalValue,
            "currency_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? req_body.OrderQty : price_value_usd,
            "original_value": original_value,
            "orderQuantity": req_body.OrderQty
          }
        } else if (flag == 2) {
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice((req_body.original_pair), (req_body.Side == 1 ? "Buy" : "Sell"));
          if (req_body.Side == 2) {
            priceValue = (1 / get_jst_price[0].bid_price);
          }

          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].bid_price)
          } else {
            var price_value = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 2) {
              price_value_usd = (1 / price_value[0].bid_price);
            }
            price_value_usd = price_value_usd * usd_value;
            totalValue = (price_value_usd * priceValue)
          }

          if (req_body.Side == 2) {
            feesCurrency = currency;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), req_body.OrderQty, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) ? parseFloat(((req_body.OrderQty * (faldax_fee.value) / 100))) : parseFloat(((price_value_usd * (faldax_fee.value) / 100)))
            get_faldax_fee = (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) ? (parseFloat(req_body.OrderQty) + parseFloat(get_network_fees) + parseFloat(((req_body.OrderQty * (faldax_fee.value) / 100)))) : (parseFloat(price_value_usd) + parseFloat(get_network_fees) + parseFloat(((price_value_usd * (faldax_fee.value) / 100))));
            original_value = totalValue;
          }
          returnData = {
            "network_fee": get_network_fees,
            "faldax_fee": faldax_fee_value,
            "total_value": get_faldax_fee,
            "currency": feesCurrency,
            "price_usd": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? usd_price : totalValue,
            "currency_value": original_value,
            "original_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? req_body.OrderQty : price_value_usd,
            "orderQuantity": get_faldax_fee
          }
        }
      }

      return exits.success(returnData);
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message);
      return exits.error(error)
    }
    // Send back the result through the success exit.
    return jstValue;

  }


};
