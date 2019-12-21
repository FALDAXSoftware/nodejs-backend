var logger = require("../../controllers/logger");
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
      var faldax_fees_actual = 0;
      var {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies((req_body.original_pair).replace("/", '-'));
      var returnData;

      async function offerApplyOrder(req_body, faldax_fee_value, limit_price, get_faldax_fee, flag) {
        var currency_pair = (req_body.Symbol).split("/");
        let calculate_offer_amount = 0;
        if (req_body.original_pair == req_body.order_pair) {
          var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Buy");
          var asset1_usd_value = asset1_value[0].ask_price;
          var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Buy");
          var asset2_usd_value = asset2_value[0].ask_price;
          calculate_offer_amount = asset1_usd_value;
        } else {
          var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Sell");
          var asset1_usd_value = asset1_value[0].bid_price;
          var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Sell");
          var asset2_usd_value = asset2_value[0].bid_price;
          calculate_offer_amount = asset2_usd_value;
        }

        var final_faldax_fees = faldax_fee_value
        var final_faldax_fees_actual = faldax_fee_value;
        faldax_fees_actual = final_faldax_fees_actual;
        limit_price = limit_price;
        var object = {};
        if (req_body.offer_code && req_body.offer_code != "") {
          let check_offer_status = await sails.helpers.fixapi.checkOfferCodeStatus(req_body.offer_code, req_body.user_id, false);
          console.log("check_offer_status", check_offer_status)
          offer_message = check_offer_status.message;
          if (check_offer_status.status == "truefalse") {

            // final_faldax_fees = 0.0;
            var current_order_faldax_fees = parseFloat(final_faldax_fees_actual) * parseFloat(calculate_offer_amount);
            console.log("current_order_faldax_fees", current_order_faldax_fees);
            console.log("check_offer_status.discount_values", check_offer_status.discount_values);
            console.log(parseFloat(check_offer_status.discount_values) < parseFloat(current_order_faldax_fees))
            if (parseFloat(check_offer_status.discount_values) < parseFloat(current_order_faldax_fees)) {
              // offer_applied = true;
              var remaining_fees_fiat = parseFloat(current_order_faldax_fees) - parseFloat(check_offer_status.discount_values);
              var final_faldax_fees_crypto = remaining_fees_fiat / calculate_offer_amount;
              final_faldax_fees = final_faldax_fees_crypto;
              var priceValue;
              if (flag == 2) {
                get_faldax_fee = parseFloat(get_faldax_fee) - parseFloat(final_faldax_fees);
                final_faldax_fees = final_faldax_fees;
                // get_faldax_fee = parseFloat(value) - parseFloat(final_faldax_fees);
                faldax_fee = final_faldax_fees
                var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), get_faldax_fee, flag);
                if (req_body.Side == 1) {
                  priceValue = (get_jst_price[0].ask_price);
                } else {
                  priceValue = (1 / get_jst_price[0].bid_price)
                }
              } else if (flag == 1) {
                var original_value = get_faldax_fee
                var total_value = original_value;
                original_value = parseFloat(original_value) + parseFloat(faldax_fee_value);
                faldax_fee = final_faldax_fees;
                orderQuantity = original_value;
                var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), original_value, flag);
                if (req_body.Side == 1) {
                  priceValue = (1 / get_jst_price[0].ask_price);
                } else {
                  priceValue = (get_jst_price[0].bid_price)
                }
              }
              console.log("priceValue", priceValue)
            } else {
              priceValue = 0;
            }
            object.priceValue = priceValue;
            object.faldax_fee = faldax_fee;
            console.log("====>>", priceValue);
            return object;
          } else if (check_offer_status.status == true) {
            // offer_applied = true;
            if (flag == 2) {
              get_faldax_fee = parseFloat(get_faldax_fee) - parseFloat(final_faldax_fees);
              final_faldax_fees = 0.0;
              // get_faldax_fee = parseFloat(value) - parseFloat(final_faldax_fees);
              faldax_fee = 0.0
              var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), get_faldax_fee, flag);
              if (req_body.Side == 1) {
                priceValue = (get_jst_price[0].ask_price);
              } else {
                priceValue = (1 / get_jst_price[0].bid_price)
              }
            } else if (flag == 1) {
              var original_value = get_faldax_fee
              var total_value = original_value;
              original_value = parseFloat(original_value) + parseFloat(faldax_fee_value);
              faldax_fee = 0.0;
              orderQuantity = original_value;
              var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), original_value, flag);
              if (req_body.Side == 1) {
                priceValue = (1 / get_jst_price[0].ask_price);
              } else {
                priceValue = (get_jst_price[0].bid_price)
              }
            }
            object.priceValue = priceValue;
            object.faldax_fee = faldax_fee;
            console.log("====>>", priceValue);
            return object;
          }
        }
      }

      // Checking for the pair and side
      if (req_body.original_pair == req_body.order_pair) {
        // Means The part which you want to send is being editable for flag = 1
        if (flag == 1) {
          var totalValue = 0;
          var priceValue = 0;
          if (usd_value) { // if USD Value has entered
            var price_value = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 1) {
              price_value_usd = (1 / price_value[0].ask_price);
            }
            price_value_usd = price_value_usd * usd_value;
            req_body.OrderQty = price_value_usd;
          }

          var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), req_body.OrderQty, flag);
          if (req_body.Side == 1) {
            priceValue = (1 / get_jst_price[0].ask_price);
          }
          totalValue = (parseFloat(req_body.OrderQty) * parseFloat(priceValue))

          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].ask_price)
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
            faldax_fees_actual = faldax_fee_value;
            get_faldax_fee = parseFloat(totalValue) - parseFloat(get_network_fees) - parseFloat((totalValue * (faldax_fee.value) / 100));
            var dataValueOne = 0;
            if (req_body.offer_code && req_body.offer_code != '') {
              dataValueOne = await offerApplyOrder(req_body, faldax_fee_value, limit_price, get_faldax_fee, flag);
              get_faldax_fee = parseFloat(get_faldax_fee) + parseFloat(faldax_fee_value);
              dataValue = dataValueOne.priceValue;
              faldax_fee = dataValueOne.faldax_fee;
            }
            faldax_fee_value = (dataValue > 0 && req_body.offer_code && req_body.offer_code != '') ? faldax_fee : faldax_fee_value;
            get_faldax_fee = (req_body.offer_code && req_body.offer_code != '') ? (parseFloat(get_faldax_fee) + parseFloat(faldax_fee)) : (get_faldax_fee);
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
            "orderQuantity": original_value,
            "faldax_fees_actual": faldax_fees_actual
          }

        } else if (flag == 2) {
          var valueUSD
          var totalValue = 0;
          var priceValue = 0;
          var price_value_usd = 0;
          if (usd_value) {
            var price_value = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 1) {
              price_value_usd = (1 / price_value[0].ask_price);
            }
            price_value_usd = price_value_usd * usd_value;
            req_body.OrderQty = price_value_usd;
          }
          var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), req_body.OrderQty, flag);
          if (req_body.Side == 1) {
            priceValue = (get_jst_price[0].ask_price);
          }

          totalValue = priceValue * req_body.OrderQty;

          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].ask_price)
          }
          if (req_body.Side == 1) {
            var qty = ((!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value))) ? ((req_body.OrderQty)) : (totalValue)
            feesCurrency = crypto;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), qty, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (req_body.OrderQty * ((faldax_fee.value) / 100))
            faldax_fees_actual = faldax_fee_value;
            get_faldax_fee = (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) ? (parseFloat(req_body.OrderQty) + parseFloat(get_network_fees) + parseFloat(((req_body.OrderQty * (faldax_fee.value) / 100)))) : (parseFloat(price_value_usd) + parseFloat(get_network_fees) + parseFloat(((price_value_usd * (faldax_fee.value) / 100))));
            original_value = get_faldax_fee
            var dataValueOne = 0;
            if (req_body.offer_code && req_body.offer_code != '') {
              dataValueOne = await offerApplyOrder(req_body, faldax_fee_value, limit_price, get_faldax_fee, flag)
              console.log("dataValueOne", dataValueOne)
              get_faldax_fee = parseFloat(get_faldax_fee) - parseFloat(faldax_fee_value);
              dataValue = dataValueOne.priceValue;
              faldax_fee = dataValueOne.faldax_fee
            }
            console.log(faldax_fee)
            console.log("((req_body.offer_code && req_body.offer_code != '') ? dataValue : priceValue)", ((req_body.offer_code && req_body.offer_code != '') ? dataValue : priceValue))
            totalValue = get_faldax_fee * ((req_body.offer_code && req_body.offer_code != '') ? dataValue : priceValue)
            faldax_fee_value = (dataValue > 0 && req_body.offer_code && req_body.offer_code != '') ? faldax_fee : faldax_fee_value;
          }

          returnData = {
            "network_fee": get_network_fees,
            "faldax_fee": faldax_fee_value,
            "total_value": get_faldax_fee,
            "currency": feesCurrency,
            "price_usd": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? usd_price : usd_value,
            "currency_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? totalValue : totalValue,
            "original_value": (usd_value == null || !usd_value || usd_value == undefined || isNaN(usd_value)) ? req_body.OrderQty : price_value_usd,
            "orderQuantity": get_faldax_fee,
            "faldax_fees_actual": faldax_fees_actual
          }
        }
      } else if (req_body.original_pair != req_body.order_pair) {
        if (flag == 1) {
          if (usd_value) {
            var price_value = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 2) {
              price_value_usd = (1 / price_value[0].bid_price);
            }
            price_value_usd = price_value_usd * usd_value;
            req_body.OrderQty = price_value_usd;
          }
          var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), req_body.OrderQty, flag);
          if (req_body.Side == 2) {
            priceValue = (get_jst_price[0].bid_price);
          }
          totalValue = (req_body.OrderQty * priceValue)
          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(crypto + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].bid_price)
          }

          if (req_body.Side == 2) {
            feesCurrency = currency;
            get_network_fees = await sails.helpers.feesCalculation(feesCurrency.toLowerCase(), totalValue, totalValue);
            var faldax_fee = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: "faldax_fee"
              }
            })
            faldax_fee_value = (totalValue * ((faldax_fee.value) / 100))
            faldax_fees_actual = faldax_fee_value;
            get_faldax_fee = totalValue - get_network_fees - ((totalValue * (faldax_fee.value) / 100))
            var dataValueOne = 0;
            if (req_body.offer_code && req_body.offer_code != '') {
              dataValueOne = await offerApplyOrder(req_body, faldax_fee_value, limit_price, get_faldax_fee, flag);
              get_faldax_fee = parseFloat(get_faldax_fee) + parseFloat(faldax_fee_value);
              dataValue = dataValueOne.priceValue;
              faldax_fee = dataValueOne.faldax_fee
            }
            get_faldax_fee = (get_faldax_fee);
            faldax_fee_value = (dataValue > 0 && req_body.offer_code && req_body.offer_code != '') ? faldax_fee : faldax_fee_value;
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
            "orderQuantity": req_body.OrderQty,
            "faldax_fees_actual": faldax_fees_actual
          }
        } else if (flag == 2) {
          if (usd_value) {
            var price_value = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            if (req_body.Side == 2) {
              price_value_usd = (1 / price_value[0].bid_price);
            }
            price_value_usd = price_value_usd * usd_value;
            req_body.OrderQty = price_value_usd;
          }
          var get_jst_price = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), req_body.OrderQty, flag);
          if (req_body.Side == 2) {
            priceValue = (1 / get_jst_price[0].bid_price);
          }
          totalValue = (req_body.OrderQty * priceValue)

          if (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) {
            totalValue = (req_body.OrderQty * priceValue);
            usd_price = await sails.helpers.fixapi.getLatestPrice(currency + '/USD', (req_body.Side == 1 ? "Buy" : "Sell"));
            usd_price = (req_body.OrderQty * usd_price[0].bid_price)
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
            faldax_fees_actual = faldax_fee_value;
            get_faldax_fee = (!usd_value || usd_value == null || usd_value <= 0 || isNaN(usd_value)) ? (parseFloat(req_body.OrderQty) + parseFloat(get_network_fees) + parseFloat(((req_body.OrderQty * (faldax_fee.value) / 100)))) : (parseFloat(price_value_usd) + parseFloat(get_network_fees) + parseFloat(((price_value_usd * (faldax_fee.value) / 100))));
            if (req_body.offer_code && req_body.offer_code != '') {
              var dataValue = await offerApplyOrder(req_body, faldax_fee_value, limit_price, get_faldax_fee, flag)
              get_faldax_fee = parseFloat(get_faldax_fee) - parseFloat(faldax_fee_value);
              dataValue = dataValueOne.priceValue;
              faldax_fee = dataValueOne.faldax_fee
            }
            totalValue = get_faldax_fee * ((req_body.offer_code && req_body.offer_code != '') ? dataValue : priceValue)
            faldax_fee_value = (dataValue > 0 && req_body.offer_code && req_body.offer_code != '') ? faldax_fee : faldax_fee_value;
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
            "orderQuantity": get_faldax_fee,
            "faldax_fees_actual": faldax_fees_actual
          }
        }
      }

      returnData.network_fee = parseFloat(returnData.network_fee).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.faldax_fee = parseFloat(returnData.faldax_fee).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.total_value = parseFloat(returnData.total_value).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.price_usd = parseFloat(returnData.price_usd).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.currency_value = parseFloat(returnData.currency_value).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.original_value = parseFloat(returnData.original_value).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.orderQuantity = parseFloat(returnData.orderQuantity).toFixed(sails.config.local.TOTAL_PRECISION);
      returnData.limit_price = parseFloat(get_jst_price[0].limit_price).toFixed(sails.config.local.TOTAL_PRECISION)
      returnData.faldax_fees_actual = parseFloat(faldax_fees_actual).toFixed(sails.config.local.TOTAL_PRECISION)

      return exits.success(returnData);
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message);
      return exits.error(error)
    }
  }


};
