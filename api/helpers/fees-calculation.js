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
      console.log("coin", coin);
      if (coin == 'btc') {
        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'btc_fee'
          }
        });
        console.log("data", data);
        feesValue = (((inputs.quantity) / (25) * data.value));
        console.log("quantity >>>>>>", inputs.quantity, feesValue)
      } else if (coin == 'bch') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'bch_fees'
          }
        });

        feesValue = ((data.value * inputs.quantity) / inputs.price)
      } else if (coin == 'eth') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'eth_fees'
          }
        });

        feesValue = (data.value * 21000);

      } else if (coin == 'ltc') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'ltc_fees'
          }
        });

        feesValue = data.value;

      } else if (coin == 'xrp') {

        var data = await AdminSetting.findOne({
          where: {
            deleted_at: null,
            slug: 'xrp_fees'
          }
        });

        feesValue = data.value
      }
      console.log("feesValue", feesValue);
      return exits.success(feesValue);
    } catch (err) {
      console.log(err);
    }
  }

};
