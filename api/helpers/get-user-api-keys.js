const request = require('request');
module.exports = {
  friendlyName: 'Get User API keys',
  description: '',
  inputs: {
    user_id: {
      type: 'string',
      example: '1',
      description: 'User ID',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'API key object',
    },
    error: {
      description: 'Something Error'
    }
  },


  fn: async function (inputs, exits) {
    let user_id = inputs.user_id;
    var get_data = await APIKeys.findOne({
      where: {
        deleted_at: null,
        user_id: user_id
      }
    })
    console.log("get_data",get_data)
    if( get_data ){
        return exits.success(get_data)
    }else{
        return exits.error(0);
    }
  }
};
