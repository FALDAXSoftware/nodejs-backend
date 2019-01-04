module.exports.cron = {
    newsUpdate: {
        schedule: '0 0 * * * *',
        onTick: async function () {
            if (sails.config.local.CRON_STATUS == true) {
                console.log("news sync call");
                var bitcoinistNews = await sails.helpers.bitcoinistNewsUpdate();
                var bitcoinNews = await sails.helpers.bitcoinNews();
                var ccnPodcast = await sails.helpers.ccnPodcast();
                var coinTelegraph = await sails.helpers.coinTelegraph();
            }
        }
    },
    KycUpdate: {
        schedule: '0 */2 * * * *',
        onTick: async function () {
            if (sails.config.local.CRON_STATUS == true) {
                console.log("cron sync call");
                var kycCron = await sails.helpers.kycCron();
            }
        }
    }
};