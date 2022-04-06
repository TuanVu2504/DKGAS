import { IFirstStationDownload, IViewStation, IStationRealTimeDownload, IStationConfigWithRealTime } from '../../../Interface'

export function AppDownloadStations(payload: IViewStation[]): IFirstStationDownload {
  return { type: "StationsDownload", payload }
}

export function StationRealTimeDownload(payload: IStationConfigWithRealTime) : IStationRealTimeDownload {
  return { type: "StationRealTimeDownload", payload }
}