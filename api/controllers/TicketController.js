/**
 * TicketController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var https = require('https');

module.exports = {
  //---------------------------Web Api------------------------------
  getAllTickets: async function (req, res) {
    https.request('https://api.hubapi.com/crm-objects/v1/objects/tickets/paged?hapikey=e2032f87-8de' +
      '8-4e18-8f16-f4210e714245&properties=subject&properties=content&properties=hs_pip' +
      'eline&properties=hs_pipeline_stage',
      function (response) {
        var responseData = '';
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
          responseData += chunk;
        });

        response.once('error', function (err) {
          // Some error handling here, e.g.:
          res.serverError(err);
        });

        response.on('end', function () {
          try {
            // response available as `responseData` in `yourview`
            return res.json({
              "status": 200,
              "message": sails.__("Ticket list").message,
              "data": JSON.parse(responseData)
            });
          } catch (e) {
            sails
              .log
              .warn('Could not parse response from options.hostname: ' + e);
          }

          res.view('yourview');
        });
      }).end()
  },

  getAllTicketByID: async function (req, res) {
    https.request('https://api.hubapi.com/crm-objects/v1/objects/tickets/5426890?hapikey=e2032f87-8' +
      'de8-4e18-8f16-f4210e714245&properties=subject&properties=content&properties=crea' +
      'ted_by&properties=hs_pipeline&properties=hs_pipeline_stage&properties=contact',
      function (response) {
        var responseData = '';
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
          responseData += chunk;
        });

        response.once('error', function (err) {
          // Some error handling here, e.g.:
          res.serverError(err);
        });

        response.on('end', function () {
          try {
            // response available as `responseData` in `yourview`
            return res.json({
              "status": 200,
              "message": sails.__("Ticket list").message,
              "data": JSON.parse(responseData)
            });
          } catch (e) {
            sails
              .log
              .warn('Could not parse response from options.hostname: ' + e);
          }

          res.view('yourview');
        });
      }).end()
  }
}
