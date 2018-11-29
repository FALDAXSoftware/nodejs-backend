module.exports.cron = {
    // newsUpdate: {
    //     schedule: '0 0 * * * *',
    //     onTick: async function () {
    //         var bitcoinist = await sails.helpers.bitcoinistNewsUpdate();
    //     }
    // }
    KycUpdate: {
        schedule: '0 * * * * *',
        onTick: async function () {
            console.log("cron sync call");
            // var bitcoinist = await sails.helpers.kycCron();
        }
    }
};