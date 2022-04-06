
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import realTime from './realTime'
import db51 from './db51'
const app = express();
const port = 4445


app.use(cors())
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/realTime', realTime);
app.use('/db51', db51)

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

