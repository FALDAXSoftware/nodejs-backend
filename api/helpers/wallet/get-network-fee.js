const request = require('request');

module.exports = {

    friendlyName: 'Receive coin from outside.',

    description: '',

    inputs: {
        coin: {
            type: 'string',
            example: 'BTC',
            description: 'Coin name for which coin need to be received',
            required: true
        },
        amount: {
            type: 'number',
            example: 1,
            description: 'Amount which needs to be send',
            required: true
        },
        address: {
            type: 'string',
            example: "1Nijfhjsfhkskl@njkfh",
            description: 'Destination Address',
            required: true
        }
    },

    exits: {
        success: {
            description: 'All done.'
        },
        error: {
            description: 'Error.'
        }
    },

    fn: async function (inputs, exits) {

        //Getting receive address for all coins
        var coinData = await Coins.findOne({
            deleted_at: null,
            coin_code: inputs.coin,
            is_active: true
        })
        if (inputs.coin == "xrp" || inputs.coin == 'txrp') {
            var recipients = [
                {
                    "amount": (Math.trunc(inputs.amount * 1e8)).toString(),
                    "address": inputs.address
                }
            ]
        } else if (inputs.coin == "eth" || inputs.coin == 'teth' || coinData.iserc == true) {
            var recipients = [
                {
                    "amount": (Math.trunc(inputs.amount * 1e8)).toString(),
                    "address": inputs.address
                }
            ]
        } else {
            var recipients = [
                {
                    "amount": parseFloat(Math.trunc(inputs.amount * 1e8).toFixed(sails.config.local.TOTAL_PRECISION)),
                    "address": inputs.address
                }
            ]
        }

        console.log("recipients", recipients)

        if (coinData !== undefined) {
            // Getting network Fee for send coin
            var access_token_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ACCESS_TOKEN);
            request({
                url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${coinData.warm_wallet_address}/tx/build`,
                // url: 'https://test.bitgo.com/api/v2/tbtc/wallet/5daffa3e101f643404040f0ce899a78f/tx/build',
                method: "POST",
                headers: {
                    // 'cache-control': 'no-cache',
                    Authorization: `Bearer ${access_token_value}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    "recipients": recipients
                },
                json: true
            }, function (err, httpResponse, body) {
                console.log(body);
                if (err) {

                    return exits.error(err);
                }
                if (body.error) {
                    return exits.error(body);
                }
                var feeValue;
                if (inputs.coin == "eth" || inputs.coin == "teth" || coinData.iserc == true) {
                    let gasLimit = body.gasLimit;
                    let gasPrice = body.gasPrice;
                    gasPrice = parseFloat(gasPrice / sails.config.local.DIVIDE_NINE).toFixed(8);
                    feeValue = parseFloat(gasPrice) * parseFloat(gasLimit)
                } else if (inputs.coin == 'xrp' || inputs.coin == 'txrp') {
                    feeValue = body.txInfo.Fee
                } else {
                    feeValue = body.feeInfo
                }
                console.log("feeValue", feeValue);
                return exits.success(feeValue);
            });
        } else {
            return exits.success(1);
        }
    }
};
