module.exports = {

  friendlyName: 'Collect referal',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 83,
      description: 'User Id for which referal needs to be collected',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {

    var collectFundData = [];
    var collectUserData = [];
    var collectRequestedData = [];
    var userCollect = 0;
    var requestedUserCollect = 0;
    var collectUserDataBTC = 0;
    var collectUserDataBCH = 0;
    var collectUserDataETH = 0;
    var collectUserDataXRP = 0;
    var collectUserDataDASH = 0;
    var collectUserDataLTC = 0;
    var collectUserDataZEC = 0;
    var collectUserDataXLM = 0
    var collectUserDataBSV = 0

    try {
      var data = await Users.find({
        where: {
          deleted_at: null,
          referred_id: inputs.user_id
        },
        sort: 'id DESC'
      });

      var userData = await Users.find({
        where: {
          deleted_at: null,
          id: inputs.user_id
        },
        sort: 'id DESC'
      })

      
    } catch (err) {
      console.log(err);
    }
  }

};
