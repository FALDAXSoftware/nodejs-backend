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

  updateThresoldNotification: {
    schedule: '* * * * *',
    onTick: async function () {
      if (sails.config.local.CRON_STATUS == "true") {
        // Updating Thresold Value according to the latest value
        await sails.controllers.ThresoldController.addThresoldValue();

        // Checking the condition for notification
        // await sails.helpers.notification.checkTheresoldNotification();
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
};
