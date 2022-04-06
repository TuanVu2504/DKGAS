import React from 'react'
import { helper } from '../../../../../globalTool'
import * as datefns from 'date-fns'
import { MSLoader } from '../../Elements'
import { useAPI, useModal } from '../../hook'
import { DropCalendar } from '../'
import { IViewStation, IStationRealTimeDataType, 
         IGetTempAndPresSChartResponse, IGetSVFAndGVFChartResponse,
         IStationConnectionHistory } from '../../../../../Interface'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { 
  Decimation,
  ChartOptions,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Decimation,
  TimeScale
)


interface ITempChartOption<T> {
  station: IViewStation,
  baseUrl: string,
  chartType: string,
  ChartConfig: { Title: string, color: string, key: keyof T }[]
}
interface ILineChartDataSet {
  datasets: {
    hidden?: boolean,
    radius: number,
    fill: boolean,
    borderWidth: number,
    label: string,
    data: { x: number, y:number|null }[],
    borderColor: string,
  }[]
}

function _RealTimeChart<T extends IGetSVFAndGVFChartResponse|IGetTempAndPresSChartResponse>(props:ITempChartOption<T>){
  const point_radius = 0;
  const { station, ChartConfig, baseUrl, chartType } = props
  const [TempPressFrom, setTempPressFrom] = React.useState(datefns.startOfDay(new Date().getTime() - 15*60*1000))
  const [TempPressTo, setTempPressTo]     = React.useState(datefns.endOfMonth(new Date()))
  const [LiveTempPress, setLiveTempPress] = React.useState(true)
  const chartOptions: ChartOptions<"line"> = {
    showLine: true,
    parsing: false,
    responsive: true,
    animation: false,
    spanGaps: false,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        ticks: {
          source: 'auto',
          maxRotation: 0,
          color: 'rgb(255, 255, 255, 0.7)',
          autoSkip: true
        },
      },
      y: {
        ticks:{
          source: 'auto',
          color: 'rgb(255, 255, 255, 0.7)',
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          boxHeight: 5,
          color:'rgb(255, 255, 255, 0.7)'
        },
        onClick: function (e, legendItem, legend) {    
          let datasetIndex = legendItem.datasetIndex;
          setDataSets(state => ({
            ...state,
            datasets: state.datasets.map((set, index) => index == datasetIndex ? ({
              ...set,
              hidden: set.hidden == undefined ? true : !set.hidden
            }) : set)
          }))
        }
        // position: 'top' as const,
      },
      decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 20000
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    }
  }
  const [dataSets, setDataSets]           = React.useState<ILineChartDataSet>({
    datasets: ChartConfig.map(config => ({ 
      radius: point_radius,
      fill: true,
      borderWidth: 1,
      label: config.Title,
      fontColor:config.color,
      data: [],
      borderColor:config.color
    }))
  })
  const { apiError } = useModal()
  const [heighWide, setheighWide] = React.useState(false)
  const [rightWide, setRightWide] = React.useState(false)
  const { realTime } = props.station

  const _to     = LiveTempPress ? undefined : datefns.startOfDay(TempPressTo).getTime()
  const _from   = datefns.endOfDay(TempPressFrom).getTime()
  let apiQuery  = `${baseUrl}/${station.StationID}?from=${_from}`
  if(_to) apiQuery += `&to=${_to}`
  apiQuery += `&type=${chartType}&max_thresh_hold=300`

  const { result, loading, err } = useAPI<T[]>(apiQuery, ({data,err}) => {
    if(data){
      return setDataSets(state => {
        return {
          ...state,
          datasets: state.datasets.map((set, datasetIndex) => {
            return {
              ...set,
              data: data.length > 0 
              ? data.map(d => {
                // const dateString = helper.normalLize_date_from_sql(d.Time)
                // const date = new Date(dateString)
                // const mlSecond = date.getTime()
                // console.log({
                //   mlSecond, date, dateString
                // })
                return {
                  x: +d.Time!,
                  y: d[ChartConfig[datasetIndex].key] as unknown as number|null
                }}) 
              : []
            }
          })
        }
      })
    }
    apiError(err)
  })

  React.useEffect(() => {   
    if(LiveTempPress){
      let d:IStationRealTimeDataType|undefined = realTime[0];
      const date = d ? +d.Time : new Date().getTime()
      setDataSets(state => ({
        ...state,
        datasets: state.datasets.map((set, datasetIndex) => {
          const _y = d ? d[ChartConfig[datasetIndex].key as keyof IStationRealTimeDataType] as unknown as number : undefined
          const y = _y == 0 || _y == undefined ? null : _y
          return {
            ...set,
            data: [...set.data, {
              x: date,
              y: y
              // d[ChartConfig[datasetIndex].key as keyof IStationRealTimeDataType] as unknown as number|null
            }]
          }
          // : ({ // case return emptry array => auto add null to graphs
          //   ...set,
          //   data: [...set.data, {
          //     x: date,
          //     y: null
          //   }]
          // }))
        })
        
      }))
    }
  }, [LiveTempPress, realTime[0]])

  return <div className={`graphic posAbs ${rightWide?'expand-width':''} ${heighWide?'expand-full':''}`}>
  { loading ? <MSLoader size="xs" className="posAbs center" />
    : <><div className="chart-control fsize-em-0-0875 hei40p middlerow">
          <div className="inlineblock posRel vertical-top">
            <div className="inlineblock vertical-top mg_rig5p mg-l-30p">From: </div>
            <div className="inlineblock vertical-top">
              <DropCalendar 
                dateSelected={TempPressFrom.getTime()}
                onClick={ date => setTempPressFrom(new Date(date))}
              />
            </div>
            <div className="inlineblock vertical-top mg_rig5p">To: </div>
            <div className={`inlineblock vertical-top ${LiveTempPress?'disabled color-gray':''}`}>
              <DropCalendar 
                dateSelected={TempPressTo.getTime()}
                onClick={ date => setTempPressTo(new Date(date))}
              />
            </div>
          </div>
          <div onClick={() => setLiveTempPress(state => !state)} className="inlineblock vertical-top pointer">
            <div className={`pointer inlineblock ${LiveTempPress?'green':'yellow'} mg_rig5p`}>Live</div>
            <i className={`pointer inlineblock fas fa-circle fa-xs ${LiveTempPress?'green':'yellow'}`} />
          </div>
          <div className="inlineblock float-right">
            <div onClick={() => setheighWide(s => !s)} className="wid40p clickable inlineblock">
              <i className="pointer pd-lr5p fas fa-expand-alt fa-1x"></i>
            </div>
            <div onClick={() => setRightWide(s => !s)} className="wid40p clickable inlineblock">
              <i className="pointer pd-lr5p fas fa-arrows-alt-h fa-1x"></i>
            </div>
          </div>
        </div>
        <div className="innerflex flex1">
          <Line 
            key={Math.random()}
            options={chartOptions} 
            data={dataSets}  />
        </div>
      </>
  }
  </div>
}


function StationLogs(props: { station: IViewStation }){
  const { station } = props
  const [rightWide, setRightWide] = React.useState(false)
  const [heighWide, setheighWide] = React.useState(false)
  const [connectionHistory, setConnectionHistory] = React.useState<IStationConnectionHistory[]>([])
  const { apiError } = useModal()

  const { result, loading, err } = useAPI<IStationConnectionHistory[]>(`/api/connectionHistory/${station.StationID}`, ({ data, err}) => {
    if(data) return setConnectionHistory(data)
    apiError(err)
  })

  React.useEffect(() => {
    const connectionStatus = station.connectionStatus[0]
    if(!connectionStatus) return
    setConnectionHistory(connectionHistory => {
      if(connectionHistory.some(h => h.hIndex == connectionStatus.hIndex)) return connectionHistory
      return [connectionStatus,...connectionHistory]
    })
  }, [station.connectionStatus[0]])
  
  return <div className={`graphic posAbs ${rightWide?'expand-width':''} ${heighWide?'expand-full':''}`}>
  {
    loading ? <MSLoader size="xs" className="posAbs center" /> 
    : <>
        <div className="chart-control fsize-em-0-0875 hei40p middlerow"> 
          <div className="inlineblock vertical-top mg_rig5p mg-l-30p">
            Connection History
          </div> 
          {/* <div className="inlineblock float-right">
            <div onClick={() => setheighWide(s => !s)} className="wid40p clickable inlineblock">
              <i className="pointer pd-lr5p fas fa-expand-alt fa-1x"></i>
            </div>
            <div onClick={() => setRightWide(s => !s)} className="wid40p clickable inlineblock">
              <i className="pointer pd-lr5p fas fa-arrows-alt-h fa-1x"></i>
            </div>
          </div> */}
        </div>
        <div className="innerflex flex1 ovfa fsize-em-0-0875 connection-history">
        {
          connectionHistory.length == 0 ? <div></div>
          : connectionHistory.map((c, i) => {
            const connectionStatus = c.Status == 1 ? 'connected' : 'disconnected'
            const color = c.Status == 1 ? 'color-green' : 'color-red'
            return <div className="pd-l-30p" key={c.hIndex}>
              <span className="inlineblock wid50">{datefns.format(+c.Time, 'yyyy-MM-dd HH:mm:ss')}</span>
              <span className={`inlineblock wid50 ${color}`}>{connectionStatus}</span>
            </div>
          })
        }
        </div>
      </>
  }
  </div>
}

export const RealTimeChart = React.memo( _RealTimeChart ) as typeof _RealTimeChart

interface ICGraphicOptions {
  station: IViewStation
}
export const CGraphic = React.memo((props: ICGraphicOptions) => {
  const { station } = props
    return <>
      <RealTimeChart<IGetTempAndPresSChartResponse>
        ChartConfig={[
          { Title: `TIT-${station.StationID}01`, color: '#FF7070', key: "Tevc" },
          { Title: `TIT-${station.StationID}02`, color: '#FFADAD', key: "Tevc_02"},
          { Title: `PIT-${station.StationID}01`, color: '#FFCD1A', key: "Pevc"},
          { Title: `PIT-${station.StationID}02`, color: '#FFE894', key: "Pevc_02"}
        ]}
        chartType="temp_and_press"
        baseUrl='/api/chart'
        station={station} 
      />
      <RealTimeChart<IGetSVFAndGVFChartResponse>
        ChartConfig={[
          { Title: `SVF-${station.StationID}01`, color: '#CDF9CD', key: "SVF" },
          { Title: `SVF-${station.StationID}02`, color: '#56F559', key: "SVF_02"},
          { Title: `GVF-${station.StationID}01`, color: '#91C8F2', key: "GVF"},
          { Title: `GVF-${station.StationID}02`, color: '#CAE1F7', key: "GVF_02"}
        ]}
        chartType="svf_and_gvf"
        baseUrl='/api/chart'
        station={station} 
      /> 
      <StationLogs station={station} />
  </>
})