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
    schedule: '* * * * * *',
    onTick: async function () {
      if (process.env.CRONSTATUS == true) {
        var kycCron = await sails
          .helpers
          .kycCron();

      } else {
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
  }
};