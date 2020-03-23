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
        await sails.helpers.fixapi.getMarketPrice("XRPUSD",0);
        await sails.helpers.fixapi.getMarketPrice("XRPUSD",1);
        await sails.helpers.fixapi.getMarketPrice("BTCUSD",0);
        await sails.helpers.fixapi.getMarketPrice("BTCUSD",1);
        await sails.helpers.fixapi.getMarketPrice("LTCUSD",0);
        await sails.helpers.fixapi.getMarketPrice("LTCUSD",1);
        await sails.helpers.fixapi.getMarketPrice("ETHUSD",0);
        await sails.helpers.fixapi.getMarketPrice("ETHUSD",1);
        await sails.helpers.fixapi.getMarketPrice("BCHUSD",0);
        await sails.helpers.fixapi.getMarketPrice("BCHUSD",1);
        await sails.helpers.fixapi.getMarketPrice("ETHBTC",0);
        await sails.helpers.fixapi.getMarketPrice("ETHBTC",1);
        await sails.helpers.fixapi.getMarketPrice("LTCBTC",0);
        await sails.helpers.fixapi.getMarketPrice("LTCBTC",1);
        await sails.helpers.fixapi.getMarketPrice("XRPBTC",0);
        await sails.helpers.fixapi.getMarketPrice("XRPBTC",1);
        // await sails.helpers.fixapi.getMarketPrice("LTCETH");
        // await sails.helpers.fixapi.getMarketPrice("XRPETH");

        // Checking the condition for notification
        // await sails.helpers.notification.checkTheresoldNotification();
      }
    }
  },

  //Add Coinmarket data every minute
  addPriceFromCoinmarketData: {
    schedule: '* * * * *',
    onTick: async function () {
      var fetch = require('node-fetch')

      if (sails.config.local.CRON_STATUS == "true") {
        var call = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=USD&start=1&limit=20', {
          method: "GET",
          headers: {
            'X-CMC_PRO_API_KEY': sails.config.local.COIN_MARKET_CAP_API
          }
        })
        console.log("call", call.json());
        console.log("resData", resData);
        call.then(resData => resData.json())
          .then(resData => {
            console.log("data", resData);
            // Store data
            for (var i = 0; i < resData.length; i++) {
              let price_object = {
                coin: resData[i].symbol,
                price: resData[i].quote.USD.price,
                market_cap: resData[i].quote.USD.market_cap,
                percent_change_1h: resData[i].quote.USD.percent_change_1h,
                percent_change_24h: resData[i].quote.USD.percent_change_24h,
                percent_change_7d: resData[i].quote.USD.percent_change_7d,
                volume_24h: resData[i].quote.USD.volume_24h
              };
              let accountClass = TempCoinmarketcap.create(price_object);
            }


            return exits.success(resData);
          });


        for (var i = 0; i < resData.length; i++) {
          let price_object = {
            coin: resData[i].symbol,
            price: resData[i].quote.USD.price,
            market_cap: resData[i].quote.USD.market_cap,
            percent_change_1h: resData[i].quote.USD.percent_change_1h,
            percent_change_24h: resData[i].quote.USD.percent_change_24h,
            percent_change_7d: resData[i].quote.USD.percent_change_7d,
            volume_24h: resData[i].quote.USD.volume_24h
          };
          // console.log("price_object",price_object);
          let accountClass = await TempCoinmarketcap.create(price_object);
        }
      }
    }
  },
  //  test: {
  //   schedule: '* * * * *',
  //   onTick: async function () {
  //     var get_data = await EmailTemplate.find();
  //     for( var i=0;i<get_data.length;i++){
  //       let content = {};
  //       content['en']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "English"
  //       }
  //       content['ja']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "Japanese"
  //       }
  //       content['es']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "Spanish"
  //       }
  //       content['uk']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "Ukrainian"
  //       }
  //       content['ru']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "Russia"
  //       }
  //       content['zh']={
  //         subject : get_data[i].name,
  //         content : get_data[i].content,
  //         note : get_data[i].note,
  //         language : "Mandarin"
  //       }

  //       console.log(content);
  //       await EmailTemplate.
  //       update({
  //         id: get_data[i].id
  //       })
  //       .set({
  //         "all_content": content
  //       });
  //     }
  //   }
  // }
  //  test: {
  //   schedule: '56 15 * * *',
  //   onTick: async function () {
  //     let get_eth = await Coins.findOne({coin_code:"eth", is_active:true,deleted_at:null});
  //     console.log(get_eth);
  //     let get_eth_wallet_data = await Wallet.find({coin_id:get_eth.id,is_active:true,deleted_at:null});
  //     console.log(get_eth_wallet_data);
  //     let get_erc_assets = await Coins.find({iserc:true, is_active:true,deleted_at:null});
  //     for( var i=0;i<get_eth_wallet_data.length;i++){
  //       for( var j=0;j<get_erc_assets.length;j++){
  //         let check_existing_erc = await Wallet.findOne({coin_id:get_erc_assets[j].id,is_active:true,deleted_at:null,user_id:get_eth_wallet_data[i].user_id});
  //         if( check_existing_erc == undefined ){
  //           var walletCode = await Wallet
  //             .create({
  //               user_id: get_eth_wallet_data[i].user_id,
  //               deleted_at: null,
  //               coin_id: get_erc_assets[j].id,
  //               wallet_id: 'wallet',
  //               is_active: true,
  //               balance: 0.0,
  //               placed_balance: 0.0,
  //               address_label: get_eth_wallet_data[i].address_label,
  //               send_address:get_eth_wallet_data[i].send_address,
  //               receive_address:get_eth_wallet_data[i].receive_address,
  //               is_admin: false
  //             }).fetch();
  //         }else{
  //           if( get_eth_wallet_data[i].send_address != null && get_eth_wallet_data[i].receive_address != null ){
  //             await Wallet
  //             .update({
  //               id: check_existing_erc.id
  //             })
  //             .set({
  //               send_address:get_eth_wallet_data[i].send_address,
  //               receive_address:get_eth_wallet_data[i].receive_address
  //             })
  //           }

  //         }
  //       }
  //     }
  //   }
  // }
};
