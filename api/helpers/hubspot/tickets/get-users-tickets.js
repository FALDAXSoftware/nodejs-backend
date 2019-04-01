const fetch = require('node-fetch');
module.exports = {


  friendlyName: 'Get users tickets',


  description: '',


  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id Of user',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Users tickets',
    },
    serverError: {
      description: 'serverError'
    }
  },


  fn: async function (inputs, exits) {

    try {
      // Get users tickets.
      var usersTickets = [];
      // TODO
      let user = await Users.findOne({ id: inputs.user_id });
      if (user) {

        if (user.hubspot_id != null) {
          fetch(sails.config.local.hubspot.url + sails.config.local.hubspot.endpoints.ticket.getUsersTicket.replace(":objectId", user.hubspot_id) + "?hapikey=" + sails.config.local.hubspot.apiKey,
            {
              method: "GET",
            })
            .then(resData => resData.json())
            .then(async function (resData) {
              let tickets = await sails.helpers.hubspot.tickets.getTicketDetails(resData.results);
              for (let index = 0; index < resData.results.length; index++) {
                const element = resData.results[index];

                usersTickets.push(tickets[element]);

              }

              return exits.success(usersTickets);
            })
            .catch(err => {
              console.log("create error", err);
              return exits.serverError();

            })
        }
      }
      // Send back the result through the success exit.
    } catch (error) {
      console.log(error);

      return exits.serverError();
    }

  }


};

