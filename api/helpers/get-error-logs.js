var bunyan = require('bunyan')
var bunyan_format = require('bunyan-format')
var fs = require('fs')

module.exports = {


  friendlyName: 'Get error logs',


  description: '',


  inputs: {
    err: {
      type: 'json',
      example: "{}",
      description: 'Error which needs to be printed',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Error logs',
    },

  },


  fn: async function (inputs) {

    // Get error logs.
    var errorLogs;
    // TODO

    try {
      console.log("INIDE THIS >>>>>>>")
      console.log(inputs.err);
      var formatOut = bunyan_format({
          outputMode: 'bunyan',
          levelInString: true
        },
        fs.createWriteStream('/Users/mansi/faldax/faldax-nodejs/logs/category12.log', {
          flags: 'a'
        })
      )

      var logger = bunyan.createLogger({
        name: 'automation',
        stream: formatOut
      })

      console.log("LOGGER >>>>>>>>>>", logger);

      console.log(logger.level())
      // console.log(rec, noemit);
      logger._emit = () => {
        console.log("DFGJSHKJF");
        // rec['@timestamp'] = rec.time
        // delete rec.time
        // rec['@version'] = rec.v
        // delete rec.v
        // rec['message'] = inputs.err;
        // delete rec.msg
        // bunyan.prototype._emit.call(logger, rec, noemit);
      }

      module.exports = logger;

      // console.log("C Value ?????????", cout);
    } catch (err) {
      console.log(err);
    }


  }


};
