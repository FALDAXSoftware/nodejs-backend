module.exports = {

  friendlyName: 'User legality checking',

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
      var userData = await Users.findOne({
        id: inputs.user_id
      });
      var countryData;
      var stateData;
      var response;
      var msg;
      var sendInfo;

      countryData = await Countries.findOne({
        where: {
          name: userData.country
        }
      });

      if (countryData != undefined) {
        if (countryData.legality == 1) {
          response = true;
          msg = sails.__("You are allowed to trade").message;
        } else if (countryData.legality == 4) {
          stateData = await State.findOne({
            where: {
              deleted_at: null,
              name: userData.state,
              country_id: countryData.id
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
        msg = sails.__("You are not allowed to trade in this regoin as country is illegal").message;
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
