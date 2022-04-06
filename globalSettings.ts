import { IDBStation } from './Interface'

export const stationRealTimeInterval = 10000

export const dkgasServer = { 
  sql: {
    server: '127.0.0.1',
    user: 'sa',
    password: '!@#Opennet123;;!@#',
    database: 'NT6'
  }
}

export enum EStationID {
  kcc = 71,
  menchuen = 70,
  saitex = 67,
  seah = 61,
  sinoma = 62,
  noxasean = 72,
  wontea = 99,
  thehoa = 98,
  lichen = 97,
  samyang = 96,
  southbasic = 92
}

const kcc:IDBStation = {
  stationCode: "kcc",
  StationID: 71,
  lines: ["01", "02"],
  type: 'FC',
  name: "kcc",
  routerIP: '192.168.9.1',
  plcIP: '192.168.9.2'
}
const menchuen:IDBStation = {
  stationCode: "menchuen",
  StationID: 70,
  lines: ["01", "02"],
  type: 'FC',
  name: "men chuen",
  routerIP: '192.168.8.1',
  plcIP: '192.168.8.2'
}
const saitex: IDBStation = {
  stationCode: "saitex",
  StationID: 67,
  lines: ["01"],
  type: 'EVC',
  name: "saitex",
  routerIP: '192.168.6.1',
  plcIP: '192.168.6.2'
}
const seah: IDBStation = {
  stationCode: "seah",
  StationID: 61,
  lines: ["01"],
  type: 'EVC',
  name: "seah",
  routerIP: '192.168.11.1',
  plcIP: '192.168.11.2'
}
const sinoma: IDBStation = {
  stationCode: "sinoma",
  StationID: 62,
  lines: ["01"],
  type: 'EVC',
  name: "sinoma",
  routerIP: '192.168.7.1',
  plcIP: '192.168.7.2'
}
const noxasean: IDBStation = {
  stationCode: "noxasean",
  StationID: 72,
  lines: ["01"],
  type: 'EVC',
  name: "nox asean",
  routerIP: '192.168.10.1',
  plcIP: '192.168.10.2'
}

const wontea: IDBStation = {
  stationCode: "wontea",
  StationID: 99,
  lines: ["01"],
  type: 'EVC',
  name: "wontea",
  routerIP: '',
  plcIP: ''
}
const thehoa: IDBStation = {
  stationCode: "thehoa",
  StationID: 98,
  lines: ["01"],
  type: 'EVC',
  name: "thehoa",
  routerIP: '',
  plcIP: ''
}
const lichen: IDBStation = {
  stationCode: "lichen",
  StationID: 97,
  lines: ["01"],
  type: 'EVC',
  name: "lichen",
  routerIP: '',
  plcIP: ''
}
const samyang: IDBStation = {
  stationCode: "samyang",
  StationID: 96,
  lines: ["01"],
  type: 'EVC',
  name: "samyang",
  routerIP: '',
  plcIP: ''
}
const southbasic: IDBStation = {
  stationCode: "southbasic",
  StationID: 95,
  lines: ["01"],
  type: 'EVC',
  name: "southbasic",
  routerIP: '',
  plcIP: ''
}

export const stationConfig = {
  stations: [
    kcc, 
    menchuen, 
    saitex, 
    seah, sinoma, 
    noxasean, 
    southbasic, 
    samyang, 
    lichen, 
    wontea, 
    thehoa
  ],
  // ['pfd', 'p_id', 'outlet', 'metering', 'gcdata']
  lgdsnav: [
    {
      short: 'pfd',
      long: 'pfd',
      text: 'process flow diagram',
    }, {
      short: 'p_id',
      long: 'p&id',
      text: 'piping and intrument diagram'
    }, {
      short: 'outlet',
      long: 'outlet',
      text: 'outlet'
    }, {
      short: 'metering',
      long: 'metering',
      text: 'metering'
    }, {
      short: 'gcdata',
      long: 'gc data',
      text: 'gc data'
    }
  ]
}

export const error = {
  stationNotFound: (StationID: number) => `Station With ID: ${StationID} not found`
}



