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
      var userKyc = await KYC.findOne({
        user_id: inputs.user_id
      });
      var countryData;
      var stateData;
      var response;
      var msg;
      var sendInfo;
      console.log("userKyc", userKyc)

      if (userKyc) {
        if (userKyc.direct_response != "ACCEPT" && userKyc.webhook_response != "ACCEPT") {
          response = false;
          msg = sails.__("Your KYC is under process. Please wait until KYC is approved").message;
        } else {
          countryData = await Countries.find({
            where: {
              name: userKyc.country
            }
          });

          if (countryData != undefined && countryData.length > 0) {

            if (countryData[0].legality == 1) {
              response = true;
              msg = sails.__("You are allowed to trade").message;
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
                  msg = sails.__("You are allowed to trade").message;
                } else {
                  response = false;
                  msg = sails.__("You are not allowed to trade in this regoin as your state is illegal").message;

                }
              } else {
                response = false;
                msg = sails.__("You are not allowed to trade in this regoin").message;
              }
            } else {
              response = false;
              msg = sails.__("You are not allowed to trade in this regoin as country is illegal").message;
            }
          } else {
            response = false;
            msg = sails.__("You need to complete your KYC to trade in FALDAX").message;
          }
        }
      } else {
        response = false;
        msg = sails.__("You need to complete your KYC to trade in FALDAX").message;
      }

      sendInfo = {
        response: response,
        msg: msg
      }
      return exits.success(sendInfo);
    } catch (err) {
      console.log(err);
    }
  }

};
