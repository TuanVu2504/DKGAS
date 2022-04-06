import { Router } from 'express'
import * as core from 'express-serve-static-core'
import stream, { Readable } from 'stream'
// import { DKError, SQLServer } from '../../../toolts'
import { WebSocketStore } from '../../../websocketHandler'
// import { stationConfig } from '../../../../globalSettings'
import { WSDispatchAction } from '../../../../../Interface'

const router = Router()

type IStationRealTimePost = core.Request<{ StationID: string }, {}, WSDispatchAction>
router.route('/:StationID')
  .post( async (req: IStationRealTimePost, res, next) => {
    const { body } = req
    const websocket = WebSocketStore.getSockets()
    websocket.broadcast(body)
    res.status(200).end()
  })

export default router


// .get((req: TStationRealTimeGetRequest, res, next) => {
//   const { query, params } = req;
//   const StationID = params.StationID;
//   const station = stationConfig.stations.find(station => station.StationID == StationID);
//   if(!station) return next({ status: 400, message: DKError.Station.not_found(StationID) });

//   let sqlquery:TSQLQuery<TypeOfTable<"realtimeEVC">> = {};

//   if(query.from){
//     const startOfFrom = datefns.startOfDay(new Date(query.from));
//     sqlquery.from = { "Time": datefns.format(startOfFrom, 'yyyy-MM-dd HH:mm:ss') }
//   }
//   if(query.to){
//     const endOfTo = datefns.endOfDay(new Date(query.to));
//     sqlquery.to = { "Time": datefns.format(endOfTo, "yyyy-MM-dd HH:mm:ss")}
//   }

//   if(query.order){
//     sqlquery.order ={
//       by: "rtIndex",
//       dir: "DESC"
//     }
//   }
  
//   const tb_realTime = new Table("realtimeEVC");
  
//   tb_realTime.get({ ID: StationID }, sqlquery)
//   .then(result => res.json(result))
//   // .then(Readable.from)
//   // .then(resStream => resStream.pipe(new ArrayStream().getInstance()).pipe(res))
//   .catch(err => next({ status: 400, message: err.message }))
// })
// class ArrayStream {
//   private _hasWritten = false
//   private stream = new stream.Transform({ objectMode: true })
//   constructor(){
//     const self = this
//     this.stream._transform = function (chunk, encoding, callback) {
//       if (!self._hasWritten) {
//         self._hasWritten = true;
//         this.push('[' + JSON.stringify(chunk));
//       } else {
//         this.push(',' + JSON.stringify(chunk));
//       }
//       callback();
//     };

//     this.stream._flush = function (callback) {
//       this.push(']');
//       callback();
//     };
//   }

//   getInstance(){ return this.stream }
// }