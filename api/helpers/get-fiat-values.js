module.exports = {

    friendlyName: 'KYC Upload',
    description: 'KYc Documents Upload API',
    inputs: {
        coin: {
            type: 'string',
            required: true,
            example: "BTC",
            description: "Coin Symbol"
        }
    },

    exits: {

        success: {
            outputFriendlyName: 'Get Transaction ID',
        },

    },

    fn: async function (inputs, exits) {
        var coin = inputs.coin
        var fiatSql = `SELECT json(quote->'USD'->'price') as asset_1_usd, json(quote->'EUR'->'price') as asset_1_eur, 
                        json(quote->'INR'->'price') as asset_1_inr, symbol 
                        FROM currency_conversion
                        WHERE deleted_at IS NULL AND (symbol LIKE '%${coin}%')`
        var fiatValue = await sails.sendNativeQuery(fiatSql);
        fiatValue = fiatValue.rows
        console.log("fiatValue", fiatValue)
        var object = {
            "asset_1_usd": (fiatValue.length > 0) ? (fiatValue[0].asset_1_usd) : (0.0),
            "asset_1_eur": (fiatValue.length > 0) ? (fiatValue[0].asset_1_eur) : (0.0),
            "asset_1_inr": (fiatValue.length > 0) ? (fiatValue[0].asset_1_inr) : (0.0)
        }
        return exits.success(object)
    }
}