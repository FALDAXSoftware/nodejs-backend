const fetch = require("node-fetch");
module.exports = {


  friendlyName: 'Update',


  description: 'Update contacts.',


  inputs: {
    vid: {
      type: 'string',
      example: '1234',
      description: 'Hubspot Contact id',
      required: true
    },
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
    address: {
      type: 'string',
      example: 'Doe',
      description: 'Address',
      required: true
    },
    country: {
      type: 'string',
      example: 'Doe',
      description: 'Country',
      required: true
    },
    state: {
      type: 'string',
      example: 'Doe',
      description: 'State',
      required: true
    },
    city: {
      type: 'string',
      example: 'Doe',
      description: 'City',
      required: true
    },
    zip: {
      type: 'string',
      example: 'Doe',
      description: 'zip',
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
              "property": "firstname",
              "value": inputs.firstname
            },
            {
              "property": "lastname",
              "value": inputs.lastname
            },
            {
              "property": "address",
              "value": inputs.address
            },
            {
              "property": "country",
              "value": inputs.country
            },
            {
              "property": "city",
              "value": inputs.city
            },
            {
              "property": "state",
              "value": inputs.state
            },
            {
              "property": "zip",
              "value": inputs.zip
            },
          ]
        })
      })
      // .then(createResData => createResData.json())
      .then(createResData => {
        console.log(createResData);
        return exits.success();
      })
      .catch(err => {
        console.log("create error", err);
        return exits.serverError();

      })
  }


};

