import exceljs from 'exceljs'
import * as datefns from 'date-fns'
import { SQLServer } from '../..'
import { setWorkBook, excelRatio, exportPath, globalConfig } from '../../helper'
import { IDBStation } from '../../../../../Interface'

const image_path = globalConfig.exporter.dailyReport.path

/**
 * 
 * @param station 
 * @param ReportDate \d{4}\d{2}\d{2}
 * @returns 
 */
export async function excel(station: IDBStation,ReportDate: string): Promise<string> {
  const [,yyyy,MM,dd] = ReportDate.match(/(\d{4})(\d{2})(\d{2})/)!;
  const from              = new Date(`${yyyy}-${MM}-${dd}`)
  const to                = new Date(`${yyyy}-${MM}-${dd}`)
  const data              = await SQLServer.Table("realtimeEVC")
                                           .select({ 
                                             filter:{ operator: "AND", 
                                                      values: [ { ID: station.StationID },
                                                                { Time: datefns.startOfDay(from).getTime(), compare:">=" }, 
                                                                { Time: datefns.endOfDay(to).getTime(), compare: "<=" }]
                                            }}).then(res => res.recordset )
  const ddMMyyyy          = `${dd}/${MM}/${yyyy}`;
  const printdate         = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')

  const { type, stationCode } = station
  const { staticPath, relatiPath } = exportPath.hourlyReport(station.StationID, ReportDate).excel
  const { colRatio, rowRatio } = excelRatio
  
  const workbook = new exceljs.Workbook()
  const sheets = setWorkBook(workbook, type == "FC" ? [`${station.StationID}-01`,`${station.StationID}-02`]:[`${station.StationID}-01`])
  sheets.map((sheet, i) => {
    const LineID = i + 1
    sheet.properties.defaultRowHeight = 5.56/0.35 // 5.56mm
    sheet.columns = [ 
      { width: 28.93*colRatio },
      { width: 28.93*colRatio },
      { width: 28.93*colRatio },
      { width: 28.93*colRatio },
      { width: 28.93*colRatio },
      { width: 28.93*colRatio },
    ];
    [
      {rowID: 2,  height:6.35},
      {rowID: 3,  height:6.35},
      {rowID: 4,  height:7.67},
      {rowID: 5,  height:7.67},
      {rowID: 6,  height:8.2},
      {rowID: 7,  height:12.17},
      {rowID: 33, height:5.56},
      {rowID: 34, height:5.56},
      {rowID: 35, height:5.56},
      {rowID: 36, height:5.56},
      {rowID: 37, height:5.56},
      {rowID: 38, height:5.56},
      {rowID: 39, height:5.56},
      {rowID: 40, height:5.56},
    ].map(config => sheet.getRow(config.rowID).height = config.height*rowRatio)
    
    sheet.mergeCells("A2:B2") // time
    sheet.mergeCells("A3:B3") // time
  
    sheet.mergeCells("C2:E3");
    const title = sheet.getCell("C2")
  
    sheet.mergeCells("C4:E5");
    const stationName = sheet.getCell("C4");
  
    sheet.mergeCells("F2:F4");
    const dkgas_logo = workbook.addImage({ filename: image_path, extension: 'png' })
    const dkgas_logo_width = 37.41992*rowRatio
    const dkgas_logo_height = 23.2848*rowRatio
    sheet.addImage(dkgas_logo, {
      tl: { col: 5.005, row: 1.25 },
      ext: {
        width: dkgas_logo_width,
        height: dkgas_logo_height
      }
    })
  
    sheet.mergeCells("A6:F6")
    const header1 = sheet.getCell("A6")
    header1.value = "HOURLY AVERAGE DATA"
  
    const time_header = sheet.getCell("A7")
    const temp_header = sheet.getCell("B7")
    const pres_header = sheet.getCell("C7")
    const gros_header = sheet.getCell("D7")
    const stad_header = sheet.getCell("E7")
    const enge_header = sheet.getCell("F7")
  
    time_header.value = "Time"
    temp_header.value = "Temp (Deg)"
    pres_header.value = "Pressure (Bara)"
    gros_header.value = "Gross Flow (m3/hr)"
    stad_header.value = "Std Flow (Sm3/hr)"
    enge_header.value = "Energy Flow (MMBTU/hr)";
    
    // border
    [ header1,
      time_header, 
      temp_header,
      pres_header,
      gros_header,
      stad_header,
      enge_header,].map(header => {
        header.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })
      // end border
  
    let row = 8
    Array.from(new Array(24)).map((_row, index) => {
      let _from = ("00" + index).slice(-2)
      let _to   = ("00" +_from+1).slice(-2)
      const realTime_currentTime = data.filter(_realTime => {
        const _Time = new Date(+_realTime.Time).getHours()
        return _Time <= +_to && _Time >= +_from
      })
  
      // TIME
      const time = sheet.getCell(`A${row+index}`)
      time.value = `${_from}:00 - ${_to}:00`
  
      // TEMP
      const avg_temp = sheet.getCell(`B${row+index}`)
      const avg_temp_val = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.Tevc : +b.Tevc_02 ), 0) / realTime_currentTime.length)
                            : 0
      avg_temp.value = avg_temp_val.toFixed(2)
      // PRESS
      const avg_pres = sheet.getCell(`C${row+index}`)
      const avg_pres_val = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.Pevc : +b.Pevc_02 ), 0) / realTime_currentTime.length)
                            : 0
      avg_pres.value = avg_pres_val.toFixed(2)
      // GROSS
      const avg_gros = sheet.getCell(`D${row+index}`)
      const avg_gros_val = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.GVF : +b.GVF_02 ), 0) / realTime_currentTime.length)
                            : 0
      avg_gros.value = avg_gros_val.toFixed(2);
  
      const avg_stad = sheet.getCell(`E${row+index}`)
      const avg_stad_val = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.SVF : +b.SVF_02 ), 0) / realTime_currentTime.length)
                            : 0
      avg_stad.value = avg_stad_val.toFixed(2);
  
      const avg_ener = sheet.getCell(`F${row+index}`)
      const avg_avg_ener_val = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.VbToday : +b.VbToday_02 ), 0) / realTime_currentTime.length)
                            : 0
      avg_ener.value = avg_avg_ener_val.toFixed(2);
  
      [time, avg_gros, avg_temp, avg_pres, avg_stad, avg_ener].map(cell => {
        cell.font = Object.assign(cell.font||{}, { size: 12 })
        cell.alignment  = Object.assign(cell.alignment||{}, { horizontal: "center" })
        cell.border     = Object.assign(cell.border||{}, { 
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        })
      });
    })
  
  
    sheet.mergeCells("A33:C33")
    const signDK = sheet.getCell("A33")
    signDK.value = "DK GAS DISTRIBUTION ENTERPRISE"
  
    sheet.mergeCells("D33:F33")
    const signCustomer = sheet.getCell("D33")
    signCustomer.value = "CUSTOMER";
  
    sheet.mergeCells("A38:C38")
    const dkgas_sign_name = sheet.getCell("A38")
    dkgas_sign_name.value = "Representative :........................................"
  
    sheet.mergeCells("D38:F38")
    const custom_sign_name = sheet.getCell("D38")
    custom_sign_name.value = "Representative :........................................"
  
    sheet.getCell("A2").value = `Daily report for: ${ddMMyyyy}`
    sheet.getCell("A3").value = `Printed: ${printdate}`
    title.value = "DK LOW PRESSURE DISTRIBUTION STATION"
    stationName.value = `${stationCode} GAS STATION`.toUpperCase();
    
    
  
    [header1,dkgas_sign_name, custom_sign_name].map(cell => {
      cell.font = Object.assign(cell.font||{}, { size: 11 })
    });
    [
      title,
      time_header,
      temp_header,
      pres_header,
      gros_header,
      stad_header,
      enge_header
    ].map(cell => {
      cell.font = Object.assign(cell.font||{}, { size: 12 })
    });
    [
      stationName, signDK, signCustomer,
    ].map(cell => { 
      cell.font = Object.assign(cell.font||{}, { size: 14 })
    });
    
    // wrap text
    [ title,
      time_header,
      temp_header,
      pres_header,
      gros_header,
      stad_header,
      enge_header].map(cell => {
      cell.alignment = Object.assign(cell.alignment||{}, { wrapText: true })
    });
    
    // setting align
    // horizontal
    [ header1,
      custom_sign_name, dkgas_sign_name,
      stationName,title,
      signDK, signCustomer,
      time_header,
      temp_header,
      pres_header,
      gros_header,
      stad_header,
      enge_header
    ].map(cell => {
      cell.alignment = Object.assign(cell.alignment||{}, { horizontal: "center" })
    });
    // vertical
    [ header1, 
      custom_sign_name, dkgas_sign_name,
      time_header,
      temp_header,
      pres_header,
      gros_header,
      stad_header,
      enge_header,
      stationName,title,signDK, signCustomer].map(cell => { 
      cell.alignment = Object.assign(cell.alignment||{},{ vertical: "middle" })
    });
    
    // setting bold
    [header1, stationName,signDK, signCustomer]
    .map(cell => {
      cell.font = Object.assign(cell.font||{}, { bold: true })
    });
  })
  
  // [
  // ].map(cell => {
  //   cell.border = {
  //     top: { style: "thin" },
  //     bottom: { style: "thin" },
  //     left: { style: "thin" },
  //     right: { style: "thin" },
  //   }
  // })

  workbook.xlsx.writeFile(staticPath)
  return relatiPath
}