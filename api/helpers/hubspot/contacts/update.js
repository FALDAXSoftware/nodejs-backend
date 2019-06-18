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
      defaultsTo: ''
    },
    country: {
      type: 'string',
      example: 'Doe',
      description: 'Country',
      defaultsTo: ''
    },
    state: {
      type: 'string',
      example: 'Doe',
      description: 'State',
      defaultsTo: ''
    },
    city: {
      type: 'string',
      example: 'Doe',
      description: 'City',
      defaultsTo: ''
    },
    zip: {
      type: 'string',
      example: 'Doe',
      description: 'zip',
      defaultsTo: ''
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let properties = [
      {
        "property": "firstname",
        "value": inputs.firstname
      },
      {
        "property": "lastname",
        "value": inputs.lastname
      }
    ];
    if (inputs.address != "") {
      properties.push({
        "property": "address",
        "value": inputs.address
      });
    }
    if (inputs.country != "") {
      properties.push({
        "property": "country",
        "value": inputs.country
      });
    }
    if (inputs.city != "") {
      properties.push({
        "property": "city",
        "value": inputs.city
      });
    }
    if (inputs.state != "") {
      properties.push({
        "property": "state",
        "value": inputs.state
      });
    }
    if (inputs.zip != "") {
      properties.push({
        "property": "zip",
        "value": inputs.zip
      });
    }
    fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.contact.update.replace(":vid", inputs.vid) + "?hapikey=" + sails.config.local.hubspot.apiKey,
      {
        method: "POST",
        body: JSON.stringify({
          "properties": properties
        })
      })
      // .then(createResData => createResData.json())
      .then(createResData => {
        return exits.success();
      })
      .catch(err => {
        console.log("create error", err);
        return exits.serverError();

      })
  }


};

