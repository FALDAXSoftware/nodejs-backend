module.exports = {

  friendlyName: 'User trade checking',

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
    try {
      var country;
      var userKyc = await KYC.findOne({user_id: inputs.user_id});
      var countryData;
      var stateData;
      var response;

      if (userKyc) {
        countryData = await Countries.find({
          where: {
            name: userKyc.country
          }
        });

        if (countryData != undefined) {
          if (countryData[0].legality == 1) {
            response = true;
          } else if (countryData[0].legality == 4) {
            stateData = await State.findOne({
              where: {
                deleted_at: null,
                name: userKyc.state
              }
            });
            if (stateData != undefined) {
              if (stateData.legality == 1) {
                response = true;
              } else {
                response = false;
              }
            }
          } else {
            response = false;
          }
        }
      }
      return exits.success(response);
    } catch (err) {
      console.log(err);
    }
  }

};
