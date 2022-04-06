
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import WebSocket from 'websocket'
import cookieParser from 'cookie-parser'
import serverApi from './app'
import { settings } from './app.settings'
import { websocketHandler } from './websocketHandler'
import { initializeApp } from './initializeApp'

const WebSocketServer = WebSocket.server;
const app = express();
const port = 4444

initializeApp().then(() => {
  app.use(cors())
  app.use(express.text());
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser());
  app.use(serverApi);
  app.use('/', express.static(settings.appPath.staticFolder))
  app.use('/assets',  express.static(settings.appPath.assets))

  app.get('/', (req,res) => res.sendFile(settings.appPath.html))
  app.use('/*', (req, res) => { return res.redirect('/')});

  interface IAppError {
    status: number,
    message: string
  }
  app.use((err: IAppError, req: Request, res:Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
    });
  });

  const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
  })

  const weserver = new WebSocketServer({
    httpServer: server
  })

  weserver.on('request', websocketHandler )
})