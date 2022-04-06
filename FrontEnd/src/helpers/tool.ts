import { IDB51CSVHourly, IDB51Hourly, IDBStation, IStationRealTimeDataType } from '../../../Interface'

                            //i, MM     dd     yyyy  HH      mm    ss    0->23    P_line1,     T_line1,      Vb_line1,     Vm_line1,     Energy_line1, P_line2,      T_line2,      Vb_line2,     Vm_line2,     Energy_line2
const db51HourlyLineRegex = /\d,\d{2}\/\d{2}\/\d{4},\d{1,2}:\d{2}:\d{2},\d{1,2},\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?,\d+(?:\.\d+)?/

interface IProcessCSVOK<T> {
  err: null,
  data: T
}
interface IPromessSSVError {
  err: string[],
  data: null
}
type ProcessCSVReturn<T> = IPromessSSVError | IProcessCSVOK<T>

type CSVType = "db51"
export const processCsvFile = <T extends CSVType, R = T extends "db51" ? IDB51CSVHourly : never>(file:File, type: T): Promise<ProcessCSVReturn<R[]>> => {
  return new Promise((resolve, reject) => {
    const content:R[] = []
    const reader = new FileReader();
    let success = false;
    const error = (message: string[]) => {
      success = false,
      resolve({ err: message, data: null })
    }
    reader.readAsText(file, "utf-8")
    reader.onload = e => {
      const result = e.target == null || e.target.result == null ? undefined : e.target.result.toString()
      if(!result) 
        return error([`File ${file.name} is empty`]);
      
      // verify file pattern
      const lines = result.split('\n')
      lines.pop() // remove last empty line
      // Header: Record,Date,UTC Time,Time,P_line1,T_line1,Vb_line1,Vm_line1,Energy_line1,P_line2,T_line2,Vb_line2,Vm_line2,Energy_line2
      const header = lines[0]
      const expectedHeader  = type == 
          "db51" ? "Record,Date,UTC Time,Time,P_line1,T_line1,Vb_line1,Vm_line1,Energy_line1,P_line2,T_line2,Vb_line2,Vm_line2,Energy_line2": ""
      const lineRegex       = type ==
          "db51" ? db51HourlyLineRegex : /.*/
      if(!new RegExp(expectedHeader, 'i').test(header)){
        return error([
          `The file content does not match the regex pattern`,
          `Expected headers: ${expectedHeader}`,
          `Got headers: ${header}`
        ])
      }

      const lineContents = lines.slice(1)
      for(const line of lineContents){
        const lineNum = lineContents.indexOf(line)+1
        const _line = line.split(',').map(va => va.replace(/\s+/,'')).map(converFloat).join(',')
        if(!lineRegex.test(_line)){
          return error([
            `The line ${lineNum} in file ${file.name} does not match the regex partern ${lineRegex}`,
            _line
          ])
        }
        // const [id,fileDate,timelong,timeshort,Pevc1,Tevc1,Vb_line1,Vm_line1,Energy_line1,Pevc2,Tevc2,Vb_line2,Vm_line2,Energy_line2] = _line.split(','); 
        
        const rowData: string[] = _line.split(',')

        const object_member: unknown = expectedHeader.split(',').reduce((a, b, i) => {
          return Object.assign(a, { [b]: rowData[i] })
        }, { [expectedHeader[0]]:  rowData[0] })

        content.push(object_member as R)
      }
      success = true
    }

    reader.onloadend = () => {
      if(success) { 
        resolve({ err: null, data: content })
      }

    }
  })
}

export function downloadFile(url: string, name: string, cb:(err:any) => void){
  return fetch(/^\//.test(url) ? url : '/'+url)
  .then(response => {
    response.blob().then(blob => {
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url;
      a.download = name
      a.click()
    })
  }).catch(cb)

}
export function isNumber(n:any) { return /^\d+(?:\.\d+)?$/.test(n) }

const converFloat = (val: string) => {
  if(/\d\.[^,eE]+(?:e|E).*/i.test(val)) return Number(val)
  return val
}

export type TConvertCSVToSQLDBResult<R> = {
  err: string[], data: null
} | {
  err: null, data: R[]
}

export function convertCSVDB51ToSQLDB (station: IDBStation, date: string, csvContent: IDB51CSVHourly[]) : TConvertCSVToSQLDBResult<IDB51Hourly>
{
  let err: string[] = [];
  if(csvContent.some((row, lineNum) => {
    const [,fMM,fdd,fyyyy] = row.Date.match(/(\d{2})\/(\d{2})\/(\d{4})/)!
    if(`${fyyyy}${fMM}${fdd}` != date){
      err = [
        `Incorrect date expected`,
        `Expected: ${date}`,
        `Got: ${fyyyy}${fMM}${fdd} at rowID: ${lineNum}`
      ]
      return true
    }
  })){
    return { err, data: null }
  }

  return { err: null , data: csvContent.map(row => {
    const [,fMM,fdd,fyyyy] = row.Date.match(/(\d{2})\/(\d{2})\/(\d{4})/)!
    return {
      "Day": `${fyyyy}${fMM}${fdd}`,
      "StationID": station.StationID,
      Pevc1:+row.P_line1, Pevc2:+row.P_line2, 
      Tevc1:+row.T_line1, Tevc2:+row.T_line2, 
      Vb_line1:+row.Vb_line1, Vb_line2:+row.Vb_line2, 
      Vm_line1:+row.Vm_line1, Vm_line2:+row.Vm_line2, 
      Energy_line1:+row.Energy_line1, Energy_line2:+row.Energy_line2,
      Time:+row.Time
    }
  })}
}