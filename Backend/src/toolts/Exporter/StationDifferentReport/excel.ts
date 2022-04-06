import { IDBStation } from '../../../../../Interface'
import exceljs from 'exceljs'
import { exportPath, globalConfig, excelRatio, setWorkBook, excelHelper } from '../../helper'
import * as datefns from 'date-fns'
import { stationDifferentCaculation } from '../Caculation'
const { colRatio, rowRatio } = excelRatio
const image_path = globalConfig.exporter.dailyReport.path
// const ColRatio = 10/21.17
// const RowRatio          = 10/3.53

const ColAWidth         = 30.69*colRatio
const ColBWidth         = 39.16*colRatio
const ColCWidth         = 39.16*colRatio
const ColDWidth         = 39.16*colRatio
const ColEWidth         = 36.51*colRatio
const row1_hei          = 6.35*rowRatio,
      row2_hei          = 6.35*rowRatio,
      row3_hei          = 15.52*rowRatio,
      row4_hei          = 5.64*rowRatio,
      row5_hei          = 5.64*rowRatio,
      row6_hei          = 16.58*rowRatio,
      defaultRowHeight  = 7.06*rowRatio

export async function excel(station: IDBStation, date: Date){
  const workbook = new exceljs.Workbook()
  const dkgas_logo = workbook.addImage({ filename: image_path, extension: 'png' })
  const dkgas_logo_width  = 37.41992*rowRatio
  const dkgas_logo_height = 23.2848*rowRatio
  const sheets = setWorkBook(workbook,[`StationDifferent`])
  const sheet = sheets[0]
  sheet.addImage(dkgas_logo, { tl: { col: 4.2, row: 1.2 }, ext:{ width: dkgas_logo_width, height: dkgas_logo_height }})
  sheet.properties.defaultRowHeight = defaultRowHeight
  sheet.columns = [{ width: ColAWidth }, { width: ColBWidth }, { width: ColCWidth}, { width: ColDWidth}, { width: ColEWidth} ];
  [row1_hei, row2_hei, row3_hei, row4_hei, row5_hei, row6_hei, defaultRowHeight].map((r,i) => {
    sheet.getRow(i + 1).height = r
  })
  sheet.mergeCells("A1:B1");
  const data_report_for = sheet.getCell("A1")
  sheet.mergeCells("A2:B2");
  const printed_date = sheet.getCell("A2")
  sheet.mergeCells("C1:D2");
  const station_title = sheet.getCell("C1")
  sheet.mergeCells("C3:D4")
  const table_title = sheet.getCell("C3")
  sheet.mergeCells("E1:E3")
  const tb_header1 = sheet.getCell("A6")
  tb_header1.value = "DATE"
  const tb_header2 = sheet.getCell("B6")
  tb_header2.value = "Total volume Station Automatic (Sm³)"
  const tb_header3 = sheet.getCell("C6")
  tb_header3.value = "Total volume Station Manual (Sm³)"
  const tb_header4 = sheet.getCell("D6")
  tb_header4.value = "Δ Volume (Sm³)"
  const tb_header5 = sheet.getCell("E6")
  tb_header5.value = "%Δ Volume"

  excelHelper.centerText([station_title, table_title])
  excelHelper.wrapText([station_title, table_title])
  excelHelper.setTextBold([table_title])
  excelHelper.setFontSize([station_title, table_title], 12)
  excelHelper.format([tb_header1, tb_header2, tb_header3, tb_header4, tb_header5], { 
    bold: true, center: true, wrapText: true,  fontsize: 12, border: true
  })
  const { StationID } = station
  const { staticPath, relatiPath } = exportPath.stationDifferentCaculation(StationID, datefns.format(date, 'yyyyMM')).excel 
  const data = await stationDifferentCaculation(station, date)
  data_report_for.value = 'Report for ' + datefns.format(date, 'MM/yyyy')
  printed_date.value = 'Printed date ' + datefns.format(new Date(), 'dd/MM/yyyy')
  station_title.value = "DK LOW PRESSURE DISTRIBUTION STATION"
  table_title.value = `DIFFERENCE CALCULATION OF ${station.name.toUpperCase()} STATION`
  for(const row of data){
    const index = data.indexOf(row)
    const tb_col1_val = sheet.getCell(`A${7+index}`)
    const tb_col2_val = sheet.getCell(`B${7+index}`)
    const tb_col3_val = sheet.getCell(`C${7+index}`)
    const tb_col4_val = sheet.getCell(`D${7+index}`)
    const tb_col5_val = sheet.getCell(`E${7+index}`)
    excelHelper.format([tb_col1_val, tb_col2_val, tb_col3_val, tb_col4_val, tb_col5_val], { 
      border: true, hCenter: true, fontsize: 11 
    })
    tb_col1_val.value = row[0]
    tb_col2_val.value = row[1]
    tb_col3_val.value = row[2]
    tb_col4_val.value = row[3]
    tb_col5_val.value = row[4]
  }
  workbook.xlsx.writeFile(staticPath)
  return relatiPath
}