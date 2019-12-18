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
    },
    flag: {
      type: 'boolean',
      example: false,
      description: 'Flag',      
      defaultsTo:false
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
    console.log("user_data",user_id)
    console.log("flag",inputs.flag)

    if( inputs.flag == true ){
      var institutional_customer = 4;
      var country_code = 1;
      var account_level = 1+"-ADMIN-";
    }else{      
      var user_data = await Users.findOne({
        select: ["country", "account_tier", "account_class"],
        where: {
          id: user_id
        }
      });
      var institutional_customer = user_data.account_class;
      var country_code = 1;
      var account_level = user_data.account_tier;
    }
    
    // var institutional_customer = user_data.account_class;
    // var country_code = 1;
    // var account_level = user_data.account_tier;
    var generate_string = institutional_customer + "-" + country_code + "-" + account_level + "-" + user_id;
    return exits.success(generate_string);
  }


};
