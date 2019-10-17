var bunyan = require('bunyan')
var bunyan_format = require('bunyan-format')
var fs = require('fs')
var formatOut = bunyan_format({
    outputMode: 'bunyan',
    levelInString: true
  },
  fs.createWriteStream('logs/faldax-api.log', {
    flags: 'a'
  })
)

var logger = bunyan.createLogger({
  name: 'faldax',
  stream: formatOut
})

logger._emit = (rec, noemit) => {
  console.log(rec)
  delete rec.pid
  delete rec.hostname
  rec['@timestamp'] = rec.time
  delete rec.time
  rec['@version'] = rec.v
  delete rec.v
  rec['message'] = rec.msg
  delete rec.msg
  bunyan.prototype._emit.call(logger, rec, noemit);
}



module.exports = logger
