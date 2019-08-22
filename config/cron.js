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
        await sails.helpers.utilities.updateCurrencyConversionData();
      }
    }
  },

  // updateConversionValue: {
  //   schedule: '0 * * * * *',
  //   onTick: async function () {
  //     if (sails.config.local.CRON_STATUS == "true") {
  //       await sails.helpers.kraken.getOrderBook();
  //     }
  //   }
  // }
};
