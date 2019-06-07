
const fetch = require('node-fetch');
module.exports = {


  friendlyName: 'Create',


  description: 'Create contacts.',


  inputs: {
    firstname: {
      type: 'string',
      example: 'John',
      description: 'First Name',
      required: true
    },
    lastname: {
      type: 'string',
      example: 'Doe',
      description: 'Last Name',
      required: true
    },
    email: {
      type: 'string',
      example: 'johndoe@mail.com',
      description: 'Last Name',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },
    serverError: {
      description: 'serverError'
    }
  },


  fn: async function (inputs, exits) {
    try {
      fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.contact.getByEmail.replace(":email", inputs.email) + "?hapikey=" + sails.config.local.hubspot.apiKey, {
        method: "GET",
      })
        .then(resData => resData.json())
        .then(resData => {
          if (resData.status == "error") {
            fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.contact.create + "?hapikey=" + sails.config.local.hubspot.apiKey,
              {
                method: "POST",
                body: JSON.stringify({
                  "properties": [
                    {
                      "property": "email",
                      "value": inputs.email
                    },
                    {
                      "property": "firstname",
                      "value": inputs.firstname
                    },
                    {
                      "property": "lastname",
                      "value": inputs.lastname
                    }
                  ]
                })
              })
              .then(createResData => createResData.json())
              .then(createResData => {
                if (createResData.vid) {
                  return exits.success(createResData.vid);
                } else {
                  return exits.serverError();
                }
              })
              .catch(err => {
                console.log("create error", err);
                return exits.serverError();

              })
          } else {
            return exits.success(resData.vid);
          }

        })

    } catch (error) {
      console.log("create error", error);

      return exits.serverError();
    }
  }


};

