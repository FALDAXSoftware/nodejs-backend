const request = require('request');
module.exports = {
  friendlyName: 'Get Asset Fees and Limit threshold',
  description: '',
  inputs: {
    asset: {
      type: 'string',
      example: 'btc',
      description: 'Asset code',
      required: true
    },
    type: {
        type: 'string',
        example: '1',
        description: 'Fees or Limit',
        required: true
      },
  },
  exits: {
    success: {
      outputFriendlyName: 'Fees/Limit object',
    },
    error: {
      description: 'Something Error'
    }
  },


  fn: async function (inputs, exits) {
    let asset = inputs.asset;
    let type = inputs.type;
    let temp_type = '';
    var coinData = await Coins.findOne({
      where: {
        deleted_at: null,
        is_active: true,
        coin_code: asset
      }
    })
    if( asset == 'btc' || asset == 'tbtc'){
      asset = 'btc';
    }else if( asset == 'ltc' || asset == 'tltc'){
      asset = 'ltc';
    }else if( asset == 'xrp' || asset == 'txrp'){
      asset = 'xrp';
    }else if( asset == 'eth' || asset == 'teth' || coinData.iserc == true){
      asset = 'eth';
    }
    if( type == 1 ){
        temp_type = asset+'_static_fees'
    }
    if( type == 2 ){
        temp_type = asset+'_limit_wallet_transfer'
    }
    let get_data = await AdminSetting.findOne({
        where: {
          slug: temp_type,
          deleted_at: null
        }
    });
    console.log("get_data",get_data);
    if( get_data ){
        return exits.success(get_data.value)
    }else{
        return exits.error(0);
    }
  }
};
