const request = require('request');
module.exports = {
  friendlyName: 'Get API key User',
  description: '',
  inputs: {
    api_key: {
      type: 'string',
      example: '1',
      description: 'API Key',
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
    let api_key = inputs.api_key;
    var get_data = await APIKeys.findOne({
      where: {
        deleted_at: null,
        api_key: api_key
      }
    })
    if (get_data != undefined) {
      return exits.success(get_data)
    } else {
      console.log("INSIDE ELSE")
      return exits.success(0);
    }
  }
};
