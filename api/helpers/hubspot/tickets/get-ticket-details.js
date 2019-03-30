const fetch = require('node-fetch');
module.exports = {


  friendlyName: 'Get ticket details',


  description: '',


  inputs: {
    ids: {
      type: 'ref',
      required: true,
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Ticket details',
    },
    serverError: {
      description: 'serverError'
    }
  },


  fn: async function (inputs, exits) {

    // Get ticket details.
    var ticketDetails;
    // TODO
    console.log(inputs.ids);
    fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.ticket.getTicketsById + "?hapikey=" + sails.config.local.hubspot.apiKey + "&properties=subject&properties=created_by&properties=status&properties=content",
      {
        method: "POST",
        body: JSON.stringify({
          "ids": [...inputs.ids]
        }),
        headers: {
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded",
        }
      })
      .then(resData => resData.json())
      .then(resData => {
        console.log("-----------", resData);

        return exits.success(resData);
      })
      .catch(err => {
        console.log("create error", err);
        return exits.serverError();

      })
    // Send back the result through the success exit.
    return ticketDetails;

  }


};

