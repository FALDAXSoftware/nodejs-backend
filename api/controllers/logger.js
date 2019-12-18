var bunyan = require('bunyan')
const name = 'faldax-backend'

const configs = {
  src: true,
  name,
  streams: []
}

const stream = require('gelf-stream').forBunyan(
  'graylog-udp.graylog.svc.cluster.local',
  12201
)
configs.streams.push({
  type: 'raw',
  stream: stream,
  level: 'info'
})
configs.streams.push({
  type: 'stream',
  stream: process.stderr,
  level: 'error'
})

const logger = bunyan.createLogger(configs)

module.exports = logger
