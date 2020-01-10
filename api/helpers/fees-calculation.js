module.exports = {

  friendlyName: 'Fees calculation',

  description: 'Calculation of the Fees for JST',


  inputs: {
    coin: {
      type: 'string',
      example: 'btc',
      description: 'symbol of the coin',
      required: true
    },
    quantity: {
      type: 'string',
      example: '1',
      description: 'Amount of the coin',
      required: false
    },
    price: {
      type: 'string',
      example: '25.25',
      description: 'Price of the coin',
      required: false
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      var coin = inputs.coin;
      var feesValue;
      if (coin == 'btc' || coin == 'tbtc') {
        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'btc_fee'
          }
        });
        feesValue = (((inputs.quantity) / (25) * data.value));
      } else if (coin == 'bch' || coin == 'tbch') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'bch_fees'
          }
        });

        feesValue = ((data.value * inputs.quantity) / inputs.price)
      } else if (coin == 'eth' || coin == 'teth') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'eth_fees'
          }
        });

        feesValue = (data.value * 21000);

      } else if (coin == 'ltc' || coin == 'tltc') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'ltc_fees'
          }
        });

        feesValue = data.value;

      } else if (coin == 'xrp' || coin == 'txrp') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'xrp_fees'
          }
        });

        feesValue = data.value
      } else if (coin == 'susu') {
        feesValue = 0.01
      }
      return exits.success(feesValue);
    } catch (err) {
      console.log(err);
    }
  }

};
