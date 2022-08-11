import app from './app.js'
import pino from 'pino'
import { statSync, mkdirSync } from 'fs'

//Check logs folder and create
try {
  statSync('logs');
} catch (err) {
  if (err.code === 'ENOENT') {
    mkdirSync('logs')
  }
 }

 //pino Log obj 
const log = {
  name: "desafio_cashback",
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  file: 'logs/info.log'
}

//TODO if needed, use https://getpino.io/#/docs/help?id=log-rotation https://github.com/logrotate/logrotate to rotate logs

//pino-pretty options for dev
const prettyOptions = {
  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l Z',
  ignore: 'pid,hostname'
}

//dev pretty log to stdout and file
if (process.env.NODE_ENV != 'production') {
  delete log.file
  log.level = 'debug'
  log.transport = {
    targets: [{
      target: 'pino-pretty',
      options: prettyOptions
    }, {
      target: 'pino-pretty',
      options: {
        ...prettyOptions,
        destination: './logs/debug.log',
        colorize: false,
      }
    }]
  }
}

const server = await app({
  logger: log
})

const ADDRESS = process.env.ADDRESS || "0.0.0.0"
const PORT = process.env.PORT || 3000

try {
  server.listen({ port: PORT, address: ADDRESS })
} catch (err) {
  server.log.error(err)
  process.exit(1)
}