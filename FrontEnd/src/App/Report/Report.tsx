import React from 'react'
import { NavLink, Route, useRouteMatch, 
  useHistory, Switch, Redirect } from 'react-router-dom'
import { StaitonManualServices, UpStreamServices } from '../Services'
import { InlineValue, InlineValueWithToolTip, InlineWithUpdater, InlineDayCellOuter } from './InLineList'
import { 
  IDBStation, IDBStationDailyReport, 
  IDBVolumeStationManual, 
  IDBUpstreamMonthlyManualReport, IDB51Hourly,
  IDBGCDATA, IGCDataState,
  IStationDuty} from '../../../../Interface';
import { DropListSelect, DropList, DropCalendar, PdfViewer } from '../Elements'
import { CMetering } from '../Metering'
import { api, processCsvFile, convertCSVDB51ToSQLDB, isNumber, downloadFile } from '../../helpers'
import { helper } from '../../../../globalTool'
import * as datefns from 'date-fns'
import { useModal, useStationDuty, useAPI } from '../hook';
import { stationConfig } from '../../../../globalSettings'

interface IReport {
  type: "daily-report"|"monthly-report"|"different-between-downstream-upstream"|"realtime-different",
}

const reportTypes:IReport[] = [{
  // report 1 daily report
  type: "daily-report"
},{
  // report 3 monthly report
  type: "monthly-report"
}, {
  // different-between-downstream-upstream
  type: "different-between-downstream-upstream"
},{
  // different-between-downstream-upstream
  type: "realtime-different"
}]

const ldgs:IDBStation = {  
  stationCode: "lgds",
  StationID: 60,
  lines: ["01","02"],
  type: 'FC',
  name: "LGDS",
  routerIP: '',
  plcIP: ''
}

export const DB51 = (props: { station: IDBStation, db: IDB51Hourly[]}) => {
  const { db, station } = props
  return (
    <div className="table-db51 ovfa">
      <div className="header">
        <div>ID</div><div>Day</div><div>Time</div><div>P1</div>
        <div>T1</div><div>Vb1</div><div>Vm1</div><div>E1</div>
        <div>P2</div><div>T2</div><div>Vb2</div><div>Vm2</div><div>E2</div>
      </div>
      <div className="innerflex flex1 rows">
      {
        db.map((row, index) => {
          const { Day, Time, Pevc1, Tevc1,Vb_line1,Vm_line1,Energy_line1,Tevc2,Pevc2,Vb_line2,Vm_line2,Energy_line2 } = row
          return <div key={index}>
            <div>{station.StationID}</div><div>{Day}</div><div>{Time}</div><div>{Pevc1}</div>
            <div>{Tevc1}</div><div>{Vb_line1}</div><div>{Vm_line1}</div><div>{Energy_line1}</div><div>{Pevc2}</div>
            <div>{Tevc2}</div><div>{Vb_line2}</div><div>{Vm_line2}</div><div>{Energy_line2}</div>
          </div>
        })
      }
      </div>
    </div>
  )
}


export const Report = React.memo(() => {
  const history = useHistory()
  const match = useRouteMatch()
  const clientStations                            = stationConfig.stations
  const [pdfUrl, setPDFUrl]                       = React.useState({ pdf_path: '' })
  const [excelUrl, setExcelUrl]                   = React.useState({ excel_path: '' })
  const [differentExcelUrl, setDifferentExcelUrl] = React.useState({ excel_path: '' })
  const [differentPdfUrl, setDifferentPdfUrl]     = React.useState({ pdf_path: '' })
  const [monthlyExcelUrl, setMonthlyExcelUrl]     = React.useState({ excel_path: '' })
  const [monthlyPdfUrl, setMonthlyPdfUrl]         = React.useState({ pdf_path: '' })
  const [HourlyPdfUrl, setHourlyPdfUrl]           = React.useState({ pdf_path: '' })
  const [HourlyExeclUrl, setHourlyExcelUrl]       = React.useState({ excel_path: '' })

  const stations = [...clientStations, ldgs]    
  const [reportType, setReportType]               = React.useState(reportTypes[0])
  const [station, selectStation]                  = React.useState(stations[0]);
  const [date, setDate]                           = React.useState(datefns.startOfDay(new Date()).getTime())
  const [month, setMonth]                         = React.useState(datefns.format(date, 'yyyyMM'))
  const [monthlyReport, setMontlyReport]          = React.useState<IDBStationDailyReport[]>([])
  const [monthlyManu, setMonthlyManu]             = React.useState<IDBVolumeStationManual[]>([])
  const [upstream, setUpstream]                   = React.useState<IDBUpstreamMonthlyManualReport[]>([])
  const [db51_monthly, setDB51_monthly]           = React.useState<IDB51Hourly[]>([])
  const dailyReport                               = monthlyReport.find(report => report.Date == datefns.format(date, 'yyyyMMdd'))
  const { result: gcdata, loading, err }          = useAPI<IGCDataState>(`/api/gcdata?Day=${datefns.startOfDay(date).getTime()}`)

  const todayGCdata                               = gcdata && gcdata.gcData.length > 0 ? gcdata.gcData.find(_gcdata => datefns.format(+_gcdata.Day, 'yyyyMMdd') == datefns.format(date,  'yyyyMMdd')) : undefined
  const today_yyyyMMdd                            = datefns.format(date, 'yyyyMMdd')
  const lastd_yyyyMMdd                            = datefns.format(helper.yesterday(new Date(date)), 'yyyyMMdd')
  const db51_lastd                                = db51_monthly.filter(record => record.Day == lastd_yyyyMMdd)
  const db51_today                                = db51_monthly.filter(record => record.Day == today_yyyyMMdd)
  const { dutyEvents, dutyCurrentDay }            = useStationDuty(station, new Date(date))
  const { apiError, BlockUserInteraction, warn }              = useModal();

  const generateReport = React.useCallback(() => {
    BlockUserInteraction(`Caculating monthly report...`, "Generating")
    Promise.all([
      api(`/api/pdf/monthlyReport?StationID=${station.StationID}&date=${datefns.format(date, 'yyyy-MM-dd')}`)
      .then(setMonthlyPdfUrl),
      api(`/api/excel/monthlyReport?StationID=${station.StationID}&date=${datefns.format(date, 'yyyy-MM-dd')}`)
      .then(setMonthlyExcelUrl),
      api(`/api/pdf/stationCaculationDifferent?StationID=${station.StationID}&date=${datefns.format(date, 'yyyy-MM-dd')}`)
      .then(setDifferentPdfUrl),
      api(`/api/excel/stationCaculationDifferent?StationID=${station.StationID}&date=${datefns.format(date, 'yyyy-MM-dd')}`)
      .then(setDifferentExcelUrl) 
    ])
    .then(() => warn("Generate monthly report successfully"))
    .catch(apiError)
  }, [station, month])

  // re-caculate month
  React.useEffect(() => { 
    const newMonth = datefns.format(date, 'yyyyMM')
    if(newMonth == month) return
    setMonth(newMonth)
  }, [date])

  React.useEffect(() => {
    const [,yyyy,MM,dd] = datefns.format(date, 'yyyyMMdd').match(/(\d{4})(\d{2})(\d{2})/)!
    const startOfMonth  = datefns.startOfMonth(date)
    const endOfPreviousMonth = datefns.startOfDay(datefns.addDays(startOfMonth, -1)).getTime()
    const endofMonth    = datefns.endOfMonth(date)
    setPDFUrl({ pdf_path: '' })
    setExcelUrl({ excel_path: '' })
    setHourlyPdfUrl({ pdf_path: '' })
    setHourlyExcelUrl({ excel_path: '' })
    setMonthlyPdfUrl({ pdf_path:''})
    setMonthlyExcelUrl({ excel_path: '' })
    setDifferentPdfUrl({ pdf_path: '' })
    setDifferentExcelUrl({ excel_path: '' })
    setDB51_monthly([])
    setUpstream([])
    Promise.all([
      api<IDBStationDailyReport[]>(`/api/reports/stations?StationID=${station.StationID}&date=${datefns.format(date, 'yyyyMM')}`)
        .then(setMontlyReport),
      api<IDBVolumeStationManual[]>(`/api/reports/stationManual/${station.StationID}?from=${endOfPreviousMonth}&to=${endofMonth.getTime()}`)
        .then(setMonthlyManu),
      api<IDB51Hourly[]>(`/api/reports/db51Hourly/${station.StationID}?year=${yyyy}&month=${MM}`)
        .then(setDB51_monthly),
      UpStreamServices.get({ from: datefns.startOfMonth(date).getTime(), to: datefns.endOfMonth(date).getTime()})
        .then(setUpstream)
    ]).catch(apiError)
  }, [station, month])
  
  return (<>
    {/* header */}
    <div className="hor-nav hei40p wid100 flex flex-dir-row space-between">
      <div className="flex1 innerflex">
      </div>
      <div className="innerflex flex flex-dir-row middle-col flex1">
        <div className={`inl-block ${reportType.type != "realtime-different" && reportType.type !="different-between-downstream-upstream" ? 'show':'hide'}`}>
          <DropListSelect<IDBStation>
            selected={station}
            itemClick={selectStation}
            list={stations}
            showPro={"name"}
        /></div>
        <div className={`inl-block ${reportType.type != "realtime-different" ? 'show':'hide'}`}><DropCalendar 
          dateSelected={date}
          onClick={setDate} 
          btnClassName={'hei40p middlerow drop-btn'}
        /></div>
        <DropListSelect<IReport>
          itemClick={item => { 
            setReportType(item)
            history.push(`${match.path}/${item.type}`) 
          }}
          list={reportTypes}
          showPro={"type"}
          selected={reportType}
        />
      </div>
      <div className="innerflex flex flex-dir-row middle-col flex1 rowend mg-right22p">
        <Route path={`/report/daily-report/export`}>
          <DropList<{ type:string, name: string, path: string }> 
            list={[
              { type: "excel", name: "Excel Daily", path: excelUrl.excel_path },
              { type: "pdf", name: "PDF Daily", path: pdfUrl.pdf_path },
              { type: "excel", name: "Excel Hourly", path: HourlyExeclUrl.excel_path },
              { type: "pdf", name: "PDF Hourly", path: HourlyPdfUrl.pdf_path},
            ]}
            memberActiveCond={member => member.path != '' }
            active={list => list.some( mem => mem.path != '' )}
            showPro={"name"} 
            itemClick={item => downloadFile(item.path, item.path.split('/').pop()!, apiError )}>Download</DropList>
        </Route>
        <Route path={`/report/monthly-report/export`}>
          {/* <div 
            onClick={generateReport}
            className="hei40p middlerow pd-l-10p pd-r-10p pointer bg-blue-normal">
            Generate Report
          </div> */}
          <DropList<{ type:string, name: string, path: string }> 
            list={[
              { type: "excel", name: "Excel Monthly", path: monthlyExcelUrl.excel_path },
              { type: "pdf", name: "PDF Monthly", path: monthlyPdfUrl.pdf_path },
              { type: "excel", name: "Excel Station Different", path: differentExcelUrl.excel_path },
              { type: "pdf", name: "PDF Station Different", path: differentPdfUrl.pdf_path },
            ]}
            memberActiveCond={ member => member.path != '' }
            active={list => list.some( mem => mem.path != '' )}
            showPro={"name"} 
            itemClick={item => downloadFile(item.path, item.path.split('/').pop()!, apiError )}>Download</DropList>
        </Route>
      </div>
    </div>
    <div className="flex1 innerflex flex flex-dir-row">
    <Switch>
      <Route path={`${match.path}/daily-report`}>
        <DailyReport 
          dutyCurrentDay={dutyCurrentDay}
          setHourlyPdfUrl={setHourlyPdfUrl}
          setHourlyExcelUrl={setHourlyExcelUrl}
          excelUrl={excelUrl}
          setExcelUrl={setExcelUrl}
          pdfUrl={pdfUrl}
          setPDFUrl={setPDFUrl}
          currentDayGCData={todayGCdata}
          dailyReport={dailyReport} 
          station={station}
          duty={dutyEvents.filter(e => e.SwitchAt <= date).sort(helper.sortLargeToSmall({ by: "DutyID" }))[0]}
          date={date} 
          setDB51_monthly={setDB51_monthly}
          setMontlyReport={setMontlyReport}
          db51_today={db51_today} 
          db51_lastd={db51_lastd} />
      </Route>
      <Route path={`${match.path}/monthly-report`}>
        <MonthlyReport
          dutyEvents={dutyEvents}
          gcData={gcdata?.gcData}
          generateReport={generateReport}
          monthlyPdfUrl={monthlyPdfUrl}
          setMonthlyManu={setMonthlyManu}
          monthlyManu={monthlyManu}
          dispatchChangeReportType={setReportType}
          monthlyReport={monthlyReport} 
          station={station} 
          db51_monthly={db51_monthly}
          date={date} 
          setDate={setDate}
        />
      </Route>
      <Route path={`${match.path}/realtime-different`}>
        <CMetering />
      </Route>
      <Route path={`${match.path}/different-between-downstream-upstream`}>
        <DifferentUpStreamDownStreamReport date={datefns.startOfMonth(date)}/>
      </Route>
      <Route exact path={`${match.path}/`}>
        <Redirect to={{ pathname: `${match.path}/daily-report` }} />
      </Route>
    </Switch>
    </div>
  </>)
})

interface IDailyeportProps {
  setHourlyPdfUrl: React.Dispatch<React.SetStateAction<{ pdf_path: string }>>
  setHourlyExcelUrl: React.Dispatch<React.SetStateAction<{ excel_path: string }>>
  pdfUrl: { pdf_path: string }
  dutyCurrentDay: IStationDuty|undefined,
  setPDFUrl: React.Dispatch<React.SetStateAction<{ pdf_path: string }>>
  excelUrl: { excel_path: string }
  setExcelUrl: React.Dispatch<React.SetStateAction<{ excel_path: string }>>
  station: IDBStation,
  duty: IStationDuty|undefined,
  date: number,
  dailyReport: IDBStationDailyReport|undefined
  db51_today: IDB51Hourly[],
  db51_lastd: IDB51Hourly[],
  currentDayGCData?:IDBGCDATA,
  setDB51_monthly: React.Dispatch<React.SetStateAction<IDB51Hourly[]>>,
  setMontlyReport: React.Dispatch<React.SetStateAction<IDBStationDailyReport[]>>
}
interface IBD51CSVUploadState {
  file: File, content: IDB51Hourly[]
}

const DailyReport = React.memo((props: IDailyeportProps) => {
  const match                       = useRouteMatch()
  const history                     = useHistory()
  const { station, date, duty, dutyCurrentDay,
    setHourlyPdfUrl, setHourlyExcelUrl, setPDFUrl, setExcelUrl,
    dailyReport, pdfUrl, db51_today, db51_lastd, currentDayGCData, 
    setMontlyReport, setDB51_monthly } = props
  const today_yyyy_MM_dd            = datefns.format(date, 'yyyy-MM-dd')
  const lastd_yyyyMMdd              = datefns.format(helper.yesterday(new Date(date)), 'yyyyMMdd')
  const today_yyyyMMdd              = datefns.format(date, 'yyyyMMdd')
  const lastd_yyyy_MM_dd            = datefns.format(helper.yesterday(new Date(date)), 'yyyy-MM-dd')
  const [db51csv1, setDB51CSV1]     = React.useState<IBD51CSVUploadState|undefined>()
  const [db51csv2, setDB51CSV2]     = React.useState<IBD51CSVUploadState|undefined>()
  const { warn, confirm, apiError, BlockUserInteraction, close } = useModal()
  const ref1                        = React.useRef<HTMLInputElement>(null)

  const fileSelectHandler = 
    (date: string, cb:React.Dispatch<React.SetStateAction<IBD51CSVUploadState|undefined>>) => 
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      const file = files?files[0]:undefined
      if(!file) return
      const readcsv_response = await processCsvFile(file, "db51")
      if(readcsv_response.err){
        e.target.value = ''
        return warn(readcsv_response.err)
      } else {
        const convert_response = convertCSVDB51ToSQLDB(station, date, readcsv_response.data)
        if(convert_response.err) { 
          e.target.value = ''
          warn(convert_response.err)
          return
        }
        cb({ file, content: convert_response.data })
      }
  }

  const generateDailyReport = React.useCallback(() =>{
    if(!dailyReport) return
    const run = async () => {
      BlockUserInteraction("Rendering PDF and Excel File", "Loading")
      
      await api<{ pdf_path: string }>(`/api/pdf/dailyReport?StationID=${station.StationID}&date=${today_yyyyMMdd}`)
        .then(setPDFUrl)
      await api<{ excel_path: string }>(`/api/excel/dailyReport?StationID=${station.StationID}&date=${today_yyyyMMdd}`)
        .then(setExcelUrl)
      await api<{ excel_path: string }>(`/api/excel/hourlyReport?StationID=${station.StationID}&date=${today_yyyyMMdd}`)
        .then(setHourlyExcelUrl)
      await api<{ pdf_path: string }>(`/api/pdf/hourlyReport?StationID=${station.StationID}&date=${today_yyyyMMdd}`)
        .then(setHourlyPdfUrl)
      // })
      // .then(close)
      close()
    }
    run().catch(apiError)
  }, [dailyReport])

  // reset state if station of date is changed
  React.useEffect(() => {
    if(ref1.current){
      ref1.current.value = ''
    }
    setDB51CSV1(undefined)
    setDB51CSV2(undefined)
  }, [station, date])

  function RenderUploadCSV(
    csvState: IBD51CSVUploadState|undefined,
    dbState: IDB51Hourly[],
    uploadDate: string,
    dispatchCSVState: React.Dispatch<React.SetStateAction<IBD51CSVUploadState|undefined>>
    ){
      const date_yyyyMMdd = uploadDate.replace(/-/ig, '')
      return <div className="flex flex-dir-col innerflex flex1">
      { csvState ? <DB51 db={csvState.content} station={station} /> : dbState.length > 0 ? <DB51 db={dbState} station={station} /> : "never" }
      <div className="flex flex-dir-row space-around">
        <div
          onClick={() => ref1.current?.click()}
          className="button mg-top24p mg-bot24p"
        >Browse CSV</div>
        <div
          className={`button mg-top24p mg-bot24p ${csvState ? '' : 'disabled'}`}
          onClick={() => {
            if(!csvState){
              return warn(`Please provide a data csv file for ${uploadDate}`)
            }
            const confirmMessage:string[] = [`The DB51 data for ${station.name.toUpperCase()} on ${uploadDate} will be updated`]
            confirm(
              confirmMessage, 
              () => api<IDB51Hourly[]>("/api/csv?type=db51", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(csvState.content)
              })
              .then(newdata => {
                setDB51_monthly(state => [...state.filter(record => record.Day != date_yyyyMMdd), ...newdata]) 
              })
              .then(() => dispatchCSVState(undefined))
              .then(() => api<IDBStationDailyReport[]>(`/api/reports/stations?StationID=${station.StationID}&date=${datefns.format(date, 'yyyyMMdd')}`))
              .then( res => { 
                if(res.length == 0) return
                setMontlyReport(reports => [...reports.filter(r => r.Date != datefns.format(date, 'yyyyMMdd')), ...res])
              })
              .catch(apiError)
            )
          }}
        >Save</div>
        <div
          onClick={() => { 
            if(ref1.current) ref1.current.value = ''
            dispatchCSVState(undefined) 
          }}
          className={`button mg-top24p mg-bot24p ${csvState ? '' : 'disabled'}`}
        >Discard CSV</div>
        <input ref={ref1} accept=".csv" className="none" type="file" onChange={fileSelectHandler(date_yyyyMMdd, dispatchCSVState )}/>
      </div>
      
    </div>
  }

  return <>
  <div className="flex flex-dir-col sub-nav">
    <ul>
      <li><NavLink to={{ pathname: `${match.path}/export` }}>Export Files</NavLink></li>
      <li><NavLink to={{ pathname: `${match.path}/db51-lastd` }}>DB51 Last Day</NavLink></li>
      <li><NavLink to={{ pathname: `${match.path}/db51-today` }}>DB51 Selected Day</NavLink></li>
    </ul>
  </div>
  {
    <Switch>
      <Route path={`${match.path}/export`}>
      { !currentDayGCData ? <div className="flex1">
          <div 
            onClick={() => history.push({ pathname: `/gcdata`, state: { gcDataDate: new Date(date)}})}
            className="instruction-action">Please update GC Data on {today_yyyy_MM_dd}</div>
        </div> : undefined }
      { db51_lastd.length == 0 ? <div className="flex1">
          <div 
            onClick={() => history.push(`${match.path}/db51-lastd`)}
            className="instruction-action">
              Please upload DB51 on {lastd_yyyy_MM_dd}
          </div>
        </div> : undefined }
      { db51_today.length == 0 ? <div className="flex1">
          <div 
            onClick={() => history.push(`${match.path}/db51-today`)}
            className="instruction-action">
              Please upload DB51 on  {today_yyyy_MM_dd}
          </div>
        </div> : undefined }
      { db51_lastd.length > 0 && db51_today.length > 0 && currentDayGCData
        ? <PdfViewer path={pdfUrl.pdf_path} genpdf={ generateDailyReport }/>
        // <embed src={`/${pdfUrl.pdf_path}`} type="application/pdf" width="100%" height="100%"/> 
        : undefined }
      </Route>
      <Route path={`${match.path}/db51-lastd`}>
        { db51csv1 || db51_lastd.length > 0 ? RenderUploadCSV(db51csv1, db51_lastd, lastd_yyyy_MM_dd, setDB51CSV1)
          : <div className="flex1">
            <div 
              onClick={() => ref1.current?.click() }
              className="instruction-action">
                Please upload db51 {lastd_yyyy_MM_dd} for {station.stationCode.toUpperCase()}
            </div>
            <input 
              accept=".csv"
              ref={ref1} 
              onChange={fileSelectHandler(lastd_yyyyMMdd, setDB51CSV1)} 
              type="file" style={{ display: 'none' }} 
            />
          </div>
        }
      </Route>
      <Route path={`${match.path}/db51-today`}>
        { db51csv2 || db51_today.length > 0 ? RenderUploadCSV(db51csv2, db51_today, today_yyyy_MM_dd, setDB51CSV2) 
          : <div className="flex1">
            <div 
              onClick={() => ref1.current?.click() }
              className="instruction-action">
                { `Please upload db51 ${today_yyyy_MM_dd} for ${station.stationCode.toUpperCase()}`}
            </div>
            <input 
              accept=".csv"
              ref={ref1} 
              onChange={fileSelectHandler(today_yyyyMMdd, setDB51CSV2)} 
              type="file" style={{ display: 'none' }} 
            />
          </div>
        }
      </Route>
      <Route exact path={`${match.path}`}>
        <Redirect to={{ pathname: `${match.path}/db51-lastd` }} />
      </Route>
    </Switch>
  }
  </>
})

interface IMonthlyeportProps {
  generateReport: () => void
  monthlyPdfUrl: { pdf_path: string }
  setMonthlyManu: React.Dispatch<React.SetStateAction<IDBVolumeStationManual[]>>,
  setDate: React.Dispatch<React.SetStateAction<number>>,
  dispatchChangeReportType: React.Dispatch<React.SetStateAction<IReport>>,
  monthlyManu: IDBVolumeStationManual[],
  station: IDBStation,
  date: number,
  gcData: IDBGCDATA[]|undefined
  monthlyReport: IDBStationDailyReport[],
  dutyEvents: IStationDuty[],
  db51_monthly: IDB51Hourly[],
}

const StationMonthlySummary = (props: IMonthlyeportProps) => {
  const { station, date, monthlyManu, monthlyReport, dutyEvents, setDate, dispatchChangeReportType, db51_monthly, gcData, setMonthlyManu } = props
  const total_month_caculation_manual = monthlyManu.reduce((a,b) => a + +b.TotalVolumeManual, 0).toFixed(4)
  const total_month_caculation_automatic = monthlyReport.reduce((a,b) => +a.toFixed(4) + b.StandardVolume, 0).toFixed(4)
  const total_different = Math.abs(+total_month_caculation_manual - +total_month_caculation_automatic).toFixed(4)
  const history = useHistory()
  return (
    <div className="table-cell">
      <InlineDayCellOuter date={date} format="MMM yyyy" description="Monthly Usage Manual" className="full-line-day month">
        <InlineValueWithToolTip header="Automatic" value={total_month_caculation_automatic} />
        <InlineValueWithToolTip header="Manual" value={total_month_caculation_manual} />
        <InlineValueWithToolTip header="Diff" value={total_different} />
      </InlineDayCellOuter>
      { 
        helper.getDaysOfMonths(date).map(day => {
          const duty = dutyEvents.filter(e => +e.SwitchAt <= datefns.endOfDay(day).getTime())
                                .sort(helper.sortLargeToSmall({ by: "DutyID" }))[0]
          const daily_manual = monthlyManu.length > 0 ? monthlyManu.find(record => datefns.isSameDay(+record.Date, day)) : undefined
          const current_yyyyMMdd = datefns.format(day, 'yyyyMMdd')
          const navToDB51Lastd = () => {
            setDate(day.getTime())
            dispatchChangeReportType({ type: "daily-report" })
            history.push({ pathname: `/report/daily-report/db51-lastd` })
          }
          const navToDB51Today = () => {
            setDate(day.getTime())
            dispatchChangeReportType({ type: "daily-report" })
            history.push({ pathname: `/report/daily-report/db51-today` })
          }
          const navToDailyReportPdf = () => {
            setDate(day.getTime())
            dispatchChangeReportType({ type: "daily-report" })
            history.push({ pathname: `/report/daily-report/export` })
          }

          const this_db51_today = db51_monthly.filter(record => record.Day == current_yyyyMMdd)
          const this_db51_lastd = db51_monthly.filter(record => record.Day == datefns.format(datefns.addDays(day, -1), 'yyyyMMdd'))
          const this_gc         = gcData && gcData.length > 1 ? gcData.find(_gc => datefns.format(+_gc.Day, 'yyyyMMdd') == datefns.format(day, 'yyyyMMdd')) : undefined
          const dailyReport     = duty ? monthlyReport.find(report => report.Date == current_yyyyMMdd && report.LineID == duty.LineID ) : undefined

          const this_db51_today_status  = this_db51_today.length > 0  ? "ok":'none'
          const this_db51_lastd_status  = this_db51_lastd.length > 0  ? "ok":'none'
          const this_gc_status          = this_gc                     ? "ok":'none'
          const dailyReport_status      = dailyReport                 ? "ok":'none'
          const daily_diff              = daily_manual && dailyReport ? Math.abs(daily_manual.TotalVolumeManual - dailyReport.StandardVolume).toFixed(4) : '???'
          async function updateRequest<T>(object: Partial<T> & { TotalVolumeManual: string }){
            StaitonManualServices.update({
              "StationID": station.StationID, 
              Date: datefns.startOfDay(day).getTime(), 
              TotalVolumeManual: +object.TotalVolumeManual
            })
            .then(stationManual => {
              setMonthlyManu(stationManuals => [
                ...stationManuals.filter(manual_report => manual_report.Date != stationManual.Date), 
                stationManual
              ]) 
            })
          }

          async function deleteRequest<T>(object: T) {

          } 

          return (
            <InlineDayCellOuter key={day.getTime()} date={day} isDisabled={() => duty == undefined } format="d" >
              <InlineValue header="Daily" onClick={ navToDailyReportPdf } value={dailyReport_status} valueStatus={dailyReport_status} />
              <InlineValue header="Y DB51" onClick={ navToDB51Lastd } value={this_db51_lastd_status} valueStatus={this_db51_lastd_status} />
              <InlineValue header="T DB51" onClick={ navToDB51Today } value={this_db51_today_status} valueStatus={this_db51_today_status} />
              <InlineValue header="GC" onClick={ () => history.push({ pathname: `/gcdata`, state: { gcDataDate: day }}) } value={this_gc_status} valueStatus={this_gc_status} />
              <InlineValueWithToolTip header="Auto" value={dailyReport == undefined ? "???" : dailyReport.StandardVolume }/>
              <InlineWithUpdater object={ daily_manual } prop="TotalVolumeManual" 
                onConfirmUpdate={ updateRequest } 
                onDelete={ deleteRequest }
                validate={ temp => isNumber(temp)} />
              <InlineValueWithToolTip header="Diff" value={ daily_diff } />
            </InlineDayCellOuter>
          )
        })
      }
    </div>
  )
}
const MonthlyReport = React.memo((props: IMonthlyeportProps)=> {
  const { monthlyPdfUrl, generateReport } = props
  const match = useRouteMatch();
  
  return (
    <>
      <div className="sub-nav">
        <ul>
          <li><NavLink to={{ pathname: `${match.path}/export` }}>Export Files</NavLink></li>
          <li><NavLink to={{ pathname: `${match.path}/summary` }}>Summary</NavLink></li>
        </ul>
      </div>
      <Switch>
        <Route path={`${match.path}/summary`}><StationMonthlySummary {...props} /></Route>
        <Route path={`${match.path}/export`}><PdfViewer path={monthlyPdfUrl.pdf_path} genpdf={generateReport} /></Route>
        <Route exact path={match.path}><Redirect to={{ pathname: `${match.path}/summary` }}/></Route>
      </Switch>
    </>
  )
})



interface IDifferentUpstreamReport { 
  /**@description datefns.startOfMonth */
  date: number|Date
}

const DifferentUpStreamDownStreamReport = React.memo((props: IDifferentUpstreamReport)=> {
  const { date } = props
  const [upstream, setUpstream] = React.useState<IDBUpstreamMonthlyManualReport[]>([])
  const [monthlyReports, setMonthlyReports] = React.useState<IDBStationDailyReport[]>([])
  const [dutyEvents, setDutyEvents] = React.useState<IStationDuty[]>([])
  const match = useRouteMatch()

  React.useEffect(() => { 
    api<IDBStationDailyReport[]>(`/api/reports/stations?date=${datefns.format(date, 'yyyyMM')}`)
      .then(setMonthlyReports)
    UpStreamServices.get({ from: datefns.startOfMonth(date).getTime(), to: datefns.endOfMonth(date).getTime() })
      .then(setUpstream)
    api<IStationDuty[]>(`/api/duty`)
      .then(setDutyEvents)
  }, [date])

  return (
    <>
      <div className="sub-nav">
        <ul>
          <li><NavLink to={{ pathname: `${match.path}/export` }}>Export Files</NavLink></li>
          <li><NavLink to={{ pathname: `${match.path}/summary` }}>Summary</NavLink></li>
        </ul>
      </div>
      <Switch>
        <Route path={`${match.path}/export`}>
          <div className='block hei100 wid100 pd-40p'>
            <div>
              <div className='wid80p inl-block hei40p middlerow'>Email:</div>
              <div className='inl-block hei40p middlerow'>tuanvuthanh2504@gmail.com</div>
            </div>
            <div>
              <div className='wid80p inl-block hei40p middlerow'>Phone:</div>
              <div className='inl-block hei40p middlerow'>0933.871.481</div>
            </div>
          </div>
        </Route>
        <Route path={`${match.path}/summary`}>
          <StationUpStreamSummary 
            monthlyReports={monthlyReports}
            upstream={upstream} setUpstream={setUpstream} 
            date={date} 
            dutyEvents={dutyEvents} 
          />
        </Route>
        <Route exact path={match.path}><Redirect to={{ pathname: `${match.path}/summary` }}/></Route>
      </Switch>
    </>
  )
})

interface IDifferntUpstreamReportSummary {
  dutyEvents: IStationDuty[]
  upstream: IDBUpstreamMonthlyManualReport[],
  setUpstream: React.Dispatch<React.SetStateAction<IDBUpstreamMonthlyManualReport[]>>
  monthlyReports: IDBStationDailyReport[],
  date: Date|number
}
export function StationUpStreamSummary(props: IDifferntUpstreamReportSummary){
  const { date, upstream, monthlyReports, setUpstream, dutyEvents } = props
  const totalUpstream = upstream.reduce((a,b) => a + +b.TotalVolumeManual, 0).toFixed(4)
  const day_automatic_total_array  = helper.getDaysOfMonths(date).map(d => {
    const each_day_automatic_total:(IDBStation&IDBStationDailyReport)[] = stationConfig.stations.map(station => {
      const duty = dutyEvents.filter(e => e.StationID == station.StationID && +e.SwitchAt <= datefns.endOfDay(d).getTime())
                              .sort(helper.sortLargeToSmall({ by: "DutyID" }))[0]
      const dailyReport = duty ? monthlyReports.filter(report => report.StationID == station.StationID && report.Date == datefns.format(datefns.startOfDay(d), 'yyyyMMdd'))
                                        .find(report => report.LineID == duty.LineID ) : undefined
      return dailyReport ? { ...station, ...dailyReport } : undefined
    }).filter( e => e != undefined ) as (IDBStation&IDBStationDailyReport)[]
    return each_day_automatic_total
  })
  const monthTotalAutomatic = day_automatic_total_array.flat(1).reduce((a,b) => a + +b.StandardVolume, 0)
  const total_different = Math.abs(+totalUpstream - +monthTotalAutomatic).toFixed(4)
  
  return (
    <div className="table-cell">
      <InlineDayCellOuter date={date} format="MMM yyyy" description="Upstream Different" className="full-line-day month">
        <InlineValueWithToolTip header="Automatic" value={monthTotalAutomatic} />
        <InlineValueWithToolTip header="Upstream" value={totalUpstream} />
        <InlineValueWithToolTip header="Diff" value={total_different} />
      </InlineDayCellOuter>
      { 
        helper.getDaysOfMonths(date).map((day, dIndex) => {
          const daily_upstream  = upstream.find(d => d.Date == datefns.startOfDay(day).getTime())
          const daily_upstream_value = daily_upstream ? +daily_upstream.TotalVolumeManual : 0
          const day_station_used  = day_automatic_total_array[dIndex]
          const dailyAutomatic    = day_station_used.reduce((a,b) => a + +b.StandardVolume, 0)
          const daily_diff        = Math.abs(dailyAutomatic - daily_upstream_value)
          async function updateRequest<T>(object: Partial<T> & { TotalVolumeManual: string }){
            UpStreamServices.update({
              Date: datefns.startOfDay(day).getTime(), 
              TotalVolumeManual: +object.TotalVolumeManual
            })
            .then(upstream => {
              setUpstream(upstreams => [
                ...upstreams.filter(_upstream => _upstream.Date != upstream.Date), 
                upstream
              ]) 
            })
          }

          async function deleteRequest<T>(object:T){

          }
          return (
            <InlineDayCellOuter key={day.getTime()} date={day} format="MMM dd" className="full-line-day" >
              <InlineValueWithToolTip header="Daily" value={dailyAutomatic} toolTip={{
                list: day_station_used,
                props: ["stationCode", "StandardVolume", "LineID"]
              }} />
              <InlineWithUpdater 
                object={ daily_upstream } 
                prop="TotalVolumeManual" 
                onConfirmUpdate={ updateRequest } 
                onDelete={ deleteRequest }
                validate={ temp => isNumber(temp)} />
              <InlineValueWithToolTip header="Diff" value={ daily_diff } />
            </InlineDayCellOuter>
          )
        })
      }
    </div>
  )
}







