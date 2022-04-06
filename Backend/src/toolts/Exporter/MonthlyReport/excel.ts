import exceljs from 'exceljs'
import * as datefns from 'date-fns'
import { setWorkBook, excelRatio, exportPath, globalConfig, excelHelper } from '../../helper'
import { IDBStation } from '../../../../../Interface'
import { CaculateMonthlyReport } from '../Caculation'
const image_path = globalConfig.exporter.dailyReport.path
const { colRatio, rowRatio } = excelRatio

export async function excel(station: IDBStation, date: Date): Promise<string> {
  const workbook          = new exceljs.Workbook()
  const yyyyMM                      = datefns.format(date, 'yyyyMM')
  const printdate                   = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')
  const { StationID }               = station
  const { staticPath, relatiPath }  = exportPath.monthlyReport(StationID, yyyyMM).excel

  const defaultRowHeight  = 4.23  * rowRatio
  const ColAWidth         = 35.81 * colRatio
  const ColBWidth         = 28.93 * colRatio
  const ColCWidth         = 28.93 * colRatio
  const ColDWidth         = 33.51 * colRatio
  const ColEWidth         = 35.45 * colRatio
  const ColFWidth         = 33.87 * colRatio
  const ColGWidth         = 32.28 * colRatio
  const ColHWidth         = 32.28 * colRatio
  const sheets            = setWorkBook(workbook, station.type == "FC" ? [`${station.StationID}-01`,`${station.StationID}-02`]:[`${station.StationID}-01`])
  
  await Promise.all(sheets.map( async (sheet, i) => {
    const LineID = i + 1
    const StationLineReport = await CaculateMonthlyReport(station, date, LineID)
    
    sheet.pageSetup.margins = {
      top:  0.7007874,
      left: 0.7007874,
      bottom: 0,
      right: 0.7007874,
      header: 0,
      footer: 0,
    }
    sheet.pageSetup.orientation = "landscape"
  
    sheet.properties.defaultRowHeight = defaultRowHeight
    sheet.columns = [ 
      { width: ColAWidth },
      { width: ColBWidth },
      { width: ColCWidth },
      { width: ColDWidth },
      { width: ColEWidth },
      { width: ColFWidth },
      { width: ColGWidth },
      { width: ColHWidth },
    ];
    [
      {rowid: 1, hei:4.94},
      {rowid: 2, hei:4.94},
      {rowid: 3, hei:4.23},
      {rowid: 4, hei:3.88},
      {rowid: 5, hei:6.35},
      {rowid: 6, hei:9.17},
      {rowid: 38, hei:3.88},
      {rowid: 39, hei:5.47},
    ].map(config => sheet.getRow(config.rowid).height = config.hei*rowRatio)

    sheet.mergeCells("A1:B1") // time
    sheet.mergeCells("A2:B2") // time
    sheet.mergeCells("C1:G2"); // title
    const title = sheet.getCell("C1")

    sheet.mergeCells("C3:G4");
    const stationName = sheet.getCell("C3");
    stationName.value = `${station.name} GAS STATION`.toUpperCase()

    sheet.mergeCells("H1:H4");
    const dkgas_logo = workbook.addImage({ filename: image_path, extension: 'png' })
    const dkgas_logo_width = 38.41992*rowRatio
    const dkgas_logo_height = 23.2848*rowRatio
    sheet.addImage(dkgas_logo, {
      tl: { col: 7.015, row: 0.015 },
      ext: {
        width: dkgas_logo_width,
        height: dkgas_logo_height
      }
    })

    sheet.mergeCells("A5:H5")
    const table_title = sheet.getCell("A5")
    table_title.value = "MONTHLY DATA"
    const date_header = sheet.getCell("A6")
    const temp_header = sheet.getCell("B6")
    const pres_header = sheet.getCell("C6")
    const gros_VAcumu_header = sheet.getCell("D6")
    const gros_Volume_header = sheet.getCell("E6")
    const stad_VAcumu_header = sheet.getCell("F6")
    const stad_Volume_header = sheet.getCell("G6")
    const ener_header = sheet.getCell("H6")
    date_header.value = "Date"
    temp_header.value = "Temp (Deg)"
    pres_header.value = "Pressure (Bara)"
    gros_VAcumu_header.value = "Gross Volume Acumulated"
    gros_Volume_header.value = "Gross Volume (m3/day)"
    stad_VAcumu_header.value = "Std Volume Acumulated"
    stad_Volume_header.value = "Std Volume (Sm3/day)"
    ener_header.value = "Energy Flow (MMBTU/day)"

    sheet.mergeCells("A39:D39")
    const signDK = sheet.getCell("A39")
    signDK.value = "DK GAS DISTRIBUTION ENTERPRISE"

    sheet.mergeCells("E39:H39")
    const signCustomer = sheet.getCell("E39")
    signCustomer.value = "CUSTOMER";

    sheet.getCell("A1").value = `Monthly report for: ${datefns.format(date, 'MM/yyyy')}`
    sheet.getCell("A2").value = `Printed: ${printdate}`
    title.value = "DK LOW PRESSURE DISTRIBUTION STATION"
    stationName.value = `${station.stationCode} GAS STATION`.toUpperCase();

    let rowID = 7
    for(const report of StationLineReport){
      sheet.getRow(rowID).height = defaultRowHeight
      const date_val    = sheet.getCell(`A${rowID}`);
      const temp_val    = sheet.getCell(`B${rowID}`);
      const pres_val    = sheet.getCell(`C${rowID}`);
      const gros_va_val = sheet.getCell(`D${rowID}`);
      const gros_vo_val = sheet.getCell(`E${rowID}`);
      const stad_va_val = sheet.getCell(`F${rowID}`);
      const stad_vo_val = sheet.getCell(`G${rowID}`);
      const ener_val    = sheet.getCell(`H${rowID}`);
      excelHelper.setBorder([date_val, temp_val, pres_val, gros_va_val, gros_vo_val, stad_va_val, stad_vo_val, ener_val])
      excelHelper.hCenter([date_val, temp_val, pres_val, gros_va_val, gros_vo_val, stad_va_val, stad_vo_val, ener_val])
      date_val.value    = report[0]
      temp_val.value    = report[1]
      pres_val.value    = report[2]
      gros_va_val.value = report[3]
      gros_vo_val.value = report[4]
      stad_va_val.value = report[5]
      stad_vo_val.value = report[6]
      ener_val.value    = report[7]
      rowID = rowID + 1
    }

    excelHelper.setFontSize([title], 12)
    excelHelper.setFontSize([ stationName, signDK, signCustomer], 14) 
    excelHelper.wrapText([
      title,
      date_header, temp_header, gros_VAcumu_header, gros_Volume_header,
      stad_VAcumu_header, stad_Volume_header, pres_header, ener_header
    ])
    excelHelper.hCenter([ 
      stationName,title,
      signDK, signCustomer, table_title,
      date_header, temp_header, gros_VAcumu_header, gros_Volume_header,
      stad_VAcumu_header, stad_Volume_header, pres_header, ener_header
    ])
    excelHelper.vCenter([
      stationName,title,signDK, signCustomer, table_title,
      date_header, temp_header, gros_VAcumu_header, gros_Volume_header,
      stad_VAcumu_header, stad_Volume_header, pres_header, ener_header
    ]);
    excelHelper.setBorder([
      table_title,
      date_header, temp_header, gros_VAcumu_header, gros_Volume_header,
      stad_VAcumu_header, stad_Volume_header, pres_header, ener_header
    ])    
    excelHelper.setTextBold([stationName,signDK, signCustomer, table_title])
  }))

  workbook.xlsx.writeFile(staticPath)
  return relatiPath
}