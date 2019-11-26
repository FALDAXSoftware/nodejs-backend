const request = require('request');
module.exports = {
  friendlyName: 'Generate Unique Address',
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
      description: 'All done.',
    },
    error: {
      description: 'Something Error'
    }

  },

  fn: async function (inputs, exits) {
    var user_id = inputs.user_id;

    var user_data = await Users.findOne({
      select: ["country", "account_tier", "account_class"],
      where: {
        id: user_id
      }
    });

    console.log(user_data)
    var institutional_customer = user_data.account_class;
    var country_code = 1;
    var account_level = user_data.account_tier;
    var generate_string = institutional_customer + "-" + country_code + "-" + account_level + "-" + user_id;
    return exits.success(generate_string);
  }


};
