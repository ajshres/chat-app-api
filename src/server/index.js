import express from 'express'
import bodyParser from 'body-parser'
import config from '../config/config'
import log from 'winston-logger-setup'
import routes from './routes'
import http from 'http'
import path from 'path'
import socketIO from 'socket.io'
import socketService from '../services/socketService'

let app = express()

app.set('views', path.join(__dirname, '/../../resources/views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes)

let server = http.createServer(app)

server.listen(config.port)
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof config.port === 'string'
    ? 'Pipe ' + config.port
    : 'Port ' + config.port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges', {})
      process.exit(1)
      break
    case 'EADDRINUSE':
      log.error(bind + ' is already in use', {})
      process.exit(1)
      break
    default:
      throw error
  }
})

server.on('listening', () => {
  let addr = server.address()
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  log.cnslLog.debug('Listening on ' + bind, {})
})

let io = socketIO(server)

io.on('connection', (client) => socketService(client, io))

export default app
