const fetch = require("node-fetch");

module.exports = {
  friendlyName: 'Update email',

  description: '',

  inputs: {
    vid: {
      type: 'string',
      example: '1234',
      description: 'Hubspot Contact id',
      required: true
    },
    email: {
      type: 'string',
      example: 'test@test.com',
      description: 'email',
      required: true
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.contact.update.replace(":vid", inputs.vid) + "?hapikey=" + sails.config.local.hubspot.apiKey,
      {
        method: "POST",
        body: JSON.stringify({
          "properties": [
            {
              "property": "email",
              "value": inputs.email
            }
          ]
        })
      })
      // .then(createResData => createResData.json())
      .then(createResData => {
        return exits.success();
      })
      .catch(err => {
        console.log("hubspot update email error", err);
        return exits.serverError();
      })
  }
};
