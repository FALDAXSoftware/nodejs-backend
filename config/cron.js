var simplex = require('../api/controllers/SimplexController');
module.exports.cron = {
  newsUpdate: {
    schedule: '0 0 * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        var bitcoinistNews = await sails
          .helpers
          .bitcoinistNewsUpdate();
        var bitcoinNews = await sails
          .helpers
          .bitcoinNews();
        // var ccnPodcast = await sails
        //   .helpers
        //   .ccnPodcast();
        var coinTelegraph = await sails
          .helpers
          .coinTelegraph();
      }
    }
  },
  KycUpdate: {
    schedule: '0 */2 * * * *',
    onTick: async function () {

      if (sails.config.local.CRON_STATUS == "true") {
        console.log('>>>>>>>>>>IF', sails.config.local.CRON_STATUS)
        var kycCron = await sails
          .helpers
          .kycCron();

      } else {
        //  console.log('>>>>>>>>>>ELSE', process.env.CRONSTATUS, sails.config.local.CRON_STATUS)
      }
    }
  },
  stopLimitExecution: {
    schedule: '0 * * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        var stopExecution = await sails
          .helpers
          .tradding
          .executeStopLimit();
      }
    }
  },
  updateCurrencyConversion: {
    schedule: '0 0 * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        // await sails.helpers.utilities.updateCurrencyConversionData();
      }
    }
  },

  updateThresoldNotification: {
    schedule: '* * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {

        // Checking the condition for notification
        await sails.helpers.notification.checkTheresoldNotification();
      }
    }
  },

  // checkThresoldNotificationValue: {
  //   schedule: '* * * * *',
  //   onTick: async function () {
  //     if (sails.config.local.CRON_STATUS == "true") {

  //     }
  //   }
  // }

  // updateConversionValue: {
  //   schedule: '0 * * * * *',
  //   onTick: async function () {
  //     if (sails.config.local.CRON_STATUS == "true") {
  //       await sails.helpers.kraken.getOrderBook();
  //     }
  //   }
  // }

  updateSimplexPaymentStatus: {
    schedule: '* * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        await simplex.checkPaymentStatus();
      }
    }
  },

  updateJSTPrice: {
    schedule: '* * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        // Updating Thresold Value according to the latest value
        await sails.helpers.fixapi.getMarketPrice("XRP/USD");
        await sails.helpers.fixapi.getMarketPrice("BTC/USD");
        await sails.helpers.fixapi.getMarketPrice("LTC/USD");
        await sails.helpers.fixapi.getMarketPrice("ETH/USD");
        await sails.helpers.fixapi.getMarketPrice("BCH/USD");
        await sails.helpers.fixapi.getMarketPrice("ETH/BTC");
        await sails.helpers.fixapi.getMarketPrice("LTC/BTC");
        await sails.helpers.fixapi.getMarketPrice("XRP/BTC");
        await sails.helpers.fixapi.getMarketPrice("LTC/ETH");
        await sails.helpers.fixapi.getMarketPrice("XRP/ETH");

        // Checking the condition for notification
        // await sails.helpers.notification.checkTheresoldNotification();
      }
    }
  },

  //Add Coinmarket data every minute
  // addPriceFromCoinmarketData: {
  //   schedule: '* * * * *',
  //   onTick: async function () {
  //     var fetch = require('node-fetch')

  //     if (sails.config.local.CRON_STATUS == "true") {
  //       var call = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=USD&start=1&limit=20', {
  //           method: "GET",
  //           headers: {
  //             'X-CMC_PRO_API_KEY': sails.config.local.COIN_MARKET_CAP_API
  //           }
  //         })
  //         // console.log("call",call.json());
  //         var response =await call.json();
  //         var resData = response.data;
  //         // console.log("resData",resData);
  //         // .then(resData => resData.json())
  //         // .then(resData => {
  //         //   console.log("data",resData);
  //         //   // Store data
  //         //   for( var i=0;i<resData.length;i++){
  //         //     let price_object = {
  //         //       coin:resData[i].symbol,
  //         //       price:resData[i].quote.USD.price,
  //         //       market_cap:resData[i].quote.USD.market_cap,
  //         //       percent_change_1h:resData[i].quote.USD.percent_change_1h,
  //         //       percent_change_24h:resData[i].quote.USD.percent_change_24h,
  //         //       percent_change_7d:resData[i].quote.USD.percent_change_7d,
  //         //       volume_24h:resData[i].quote.USD.volume_24h
  //         //     };
  //         //     let accountClass = TempCoinmarketcap.create(price_object);
  //         //   }

  //         //   // 
  //         //   // return exits.success(resData);
  //         // });


  //     for( var i=0;i<resData.length;i++){
  //       let price_object = {
  //         coin:resData[i].symbol,
  //         price:resData[i].quote.USD.price,
  //         market_cap:resData[i].quote.USD.market_cap,
  //         percent_change_1h:resData[i].quote.USD.percent_change_1h,
  //         percent_change_24h:resData[i].quote.USD.percent_change_24h,
  //         percent_change_7d:resData[i].quote.USD.percent_change_7d,
  //         volume_24h:resData[i].quote.USD.volume_24h
  //       };
  //       // console.log("price_object",price_object);
  //       let accountClass = await TempCoinmarketcap.create(price_object);
  //     }
  //     }
  //   }
  // }
};
