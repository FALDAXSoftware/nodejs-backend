const request = require('request');
module.exports = {


    friendlyName: 'Get transfer',


    description: '',


    inputs: {
        coin: {
            type: 'string',
            example: 'btc',
            description: 'Code of Coin',
            required: true
        },
        walletId: {
            type: 'string',
            example: 'qwertyuiopasdfghjklzxcvbnm',
            description: 'Id Of Bitgo Wallet',
            required: true
        }
    },


    exits: {

        success: {
            outputFriendlyName: 'Transfer',
        },
        error: {
            description: 'Something Error'
        }
    },


    fn: async function (inputs, exits) {
        const coin = await Coins.findOne({
            deleted_at: null,
            is_active: true,
            coin_code: inputs.coin
        });
        var token_value = coin.access_token_value;
        console.log("Token Value", token_value);
        var access_token_value = await sails.helpers.getDecryptData(sails.config.local[token_value]);
        request({
            url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}/transfer`,
            method: "GET",
            headers: {
                'cache-control': 'no-cache',
                Authorization: `Bearer ${access_token_value}`,
                'Content-Type': 'application/json'
            },
            json: true
        }, function (err, httpResponse, body) {
            if (err) {
                return exits.error(err);
            }
            if (body.error) {
                return exits.error(body);
            }
            return exits.success(body);
        });

    }

};
