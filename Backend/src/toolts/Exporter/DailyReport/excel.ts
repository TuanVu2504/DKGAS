import exceljs from 'exceljs'
import * as datefns from 'date-fns'
import { SQLServer, DKError } from '../../../toolts'
import { setWorkBook, excelRatio, exportPath, globalConfig } from '../../helper'
import { IDBStation } from '../../../../../Interface'
import { helper } from '../../../../../globalTool'

const image_path = globalConfig.exporter.dailyReport.path

export async function excel(station: IDBStation, date: Date): Promise<string> {
  const { type, stationCode, StationID } = station
  const [year,month,day] = datefns.format(date, 'yyyy-MM-dd').split('-')
  const [_yea,_mont,_da] = datefns.format(helper.yesterday(date), 'yyyy-MM-dd').split('-')
  const duty             = await SQLServer.getDutyStatus(station.StationID, date)

  const [Line1DailyReport, Line2DailyReport] = await Promise.all([
    SQLServer.Table("ReportStationDaily").select({ filter: { operator: "AND", values: [{ LineID: 1}, { StationID: station.StationID }, { Date: datefns.format(date, 'yyyyMMdd')}]}}).then( rec => rec.recordset[0]),
    SQLServer.Table("ReportStationDaily").select({ filter: { operator: "AND", values: [{ LineID: 2}, { StationID: station.StationID }, { Date: datefns.format(date, 'yyyyMMdd')}]}}).then( rec => rec.recordset[0])
  ])

  if(!Line1DailyReport){
    throw new Error(DKError.DailyReport.not_found(station, datefns.format(date, 'yyyy-MM-dd'), 1))
  }
  if(station.type == "FC" && !Line2DailyReport){
    throw new Error(DKError.DailyReport.not_found(station, datefns.format(date, 'yyyy-MM-dd'), 2))
  }

  const ddMMyyyy = `${day}/${month}/${year}`;
  const printdate = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')
  const { staticPath, relatiPath } = exportPath.dailyReport(StationID, `${year}${month}${day}`).excel
  const { colRatio, rowRatio } = excelRatio
  
  const workbook = new exceljs.Workbook()
  const sheet = setWorkBook(workbook, [`${station.stationCode}-${station.StationID}`])[0]

  sheet.properties.defaultRowHeight = 5.47/0.35 // 5.47mm
  const colEVCConfig = [ 
    { width: 17.46/colRatio },
    { width: 36.87/colRatio },
    { width: 15.88/colRatio },
    { width: 54.86/colRatio },
    { width: 46.92/colRatio },
  ];
  const colFCConfig = [
    { width: 17.64/colRatio },
    { width: 36.87/colRatio },
    { width: 19.93/colRatio },
    { width: 29.81/colRatio },
    { width: 29.81/colRatio },
    { width: 29.81/colRatio },
  ]
  sheet.columns = station.type ==  "FC" ? colFCConfig : colEVCConfig;

  [
    {rowID: 2, height:6.35},{rowID: 3, height:6.35},
    {rowID: 4, height:7.58},{rowID: 5, height:7.58},
    {rowID: 6, height:6.88},{rowID: 7, height:6.88},
    {rowID: 8, height:station.type ==  "FC" ? 13.41 : 7.94 },
    {rowID: 9, height:7.58},{rowID: 10, height:7.58},{rowID: 11, height:7.58},
    {rowID: 12, height:10.58},
    {rowID: 13, height:7.58},{rowID: 14, height:7.58},{rowID: 15, height:7.58},{rowID: 16, height:7.58},{rowID: 17, height:7.58},
    {rowID: 20, height:6.17},
  ].map(config => sheet.getRow(config.rowID).height = config.height/rowRatio)
  
  sheet.mergeCells("A2:B2") // time
  sheet.mergeCells("A3:B3") // time

  sheet.mergeCells(`D2:${type =="FC" ? "E3":"D3"}`);
  const title = sheet.getCell("D2")

  sheet.mergeCells(`D4:${type =="FC"? "E5":"D5"}`);
  const stationName = sheet.getCell("D4");

  sheet.mergeCells(type == "FC" ? "F2:F4" : "E2:E4");
  const dkgas_logo = workbook.addImage({ filename: image_path, extension: 'png' })
  const dkgas_logo_width = 38.41992/rowRatio
  const dkgas_logo_height = 23.2848/rowRatio
  sheet.addImage(dkgas_logo, {
    tl: { col: type == "FC" ? 5.0125 : 4.5, row: 1.25 },
    ext: {
      width: dkgas_logo_width,
      height: dkgas_logo_height
    }
  })

  sheet.mergeCells("A8:B8")
  const tbHeaderName  = sheet.getCell("A8")
  const tbHeaderLine1 = sheet.getCell("D8")
  const tbHeaderLine2 = type == "FC" ? sheet.getCell("E8") : undefined
  const tbHeadeInUsed = type == "FC" ? sheet.getCell("F8") : sheet.getCell("E8")

  sheet.mergeCells("A9:B9")
  const tbGrossName = sheet.getCell("A9")
  const tbLine1Gros = sheet.getCell("D9")
  const tbLine2Gros = type == "FC" ? sheet.getCell("E9") : undefined
  const tbGrossInUsed = type == "FC" ? sheet.getCell("F9") :  sheet.getCell("E9")

  sheet.mergeCells("A10:B10")
  const tbStandName = sheet.getCell("A10")
  const tbLine1Stad = sheet.getCell("D10")
  const tbLine2Stad = type == "FC" ? sheet.getCell("E10") : undefined 
  const tbStandInUsed = type == "FC" ? sheet.getCell("F10") : sheet.getCell("E10")

  sheet.mergeCells("A11:B11")
  const tbEnerName = sheet.getCell("A11")
  const tbLine1Ener = sheet.getCell("D11")
  const tbLine2Ener = type == "FC" ? sheet.getCell("E11") : undefined
  const tbEnerInUsed = type == "FC" ? sheet.getCell("F11") : sheet.getCell("E11")

  sheet.mergeCells("A12:E12")
  const DailyAvgHeader = sheet.getCell("A12")

  sheet.mergeCells("A13:B13")
  const tbAVGTempName = sheet.getCell("A13")
  const tbLine1AvgTemp = sheet.getCell("D13")
  const tbLine2AvgTemp = type == "FC" ? sheet.getCell("E13") : undefined
  const tbAvgTempInUsed = type == "FC" ? sheet.getCell("F13") : sheet.getCell("E13")

  sheet.mergeCells("A14:B14")
  const tbAVGPresName = sheet.getCell("A14")
  const tbLine1AvgPres = sheet.getCell("D14")
  const tbLine2AvgPres = type == "FC" ? sheet.getCell("E14") : undefined 
  const tbAvgPresInUsed = type == "FC" ? sheet.getCell("F14") : sheet.getCell("E14")

  sheet.mergeCells("A15:B15")
  const tbAVGGrosName = sheet.getCell("A15")
  const tbLine1AvgGros = sheet.getCell("D15")
  const tbLine2AvgGros = type == "FC" ? sheet.getCell("E15") : undefined
  const tbAvgGrosInUsed = type == "FC" ? sheet.getCell("F15") : sheet.getCell("E15")

  sheet.mergeCells("A16:B16")
  const tbAVGStadName = sheet.getCell("A16")
  const tbLine1AvgStad = sheet.getCell("D16")
  const tbLine2AvgStad = type == "FC" ? sheet.getCell("E16") : undefined
  const tbAvgStadInUsed = type == "FC" ? sheet.getCell("F16") : sheet.getCell("E16")

  sheet.mergeCells("A17:B17")
  const tbAVGEnerName = sheet.getCell("A17")
  const tbLine1AvgEner = sheet.getCell("D17")
  const tbLine2AvgEner = type == "FC" ? sheet.getCell("E17") : undefined
  const tbAvgEnerInUsed = type == "FC" ? sheet.getCell("F17") : sheet.getCell("E17")

  sheet.mergeCells("A20:C20")
  const signDK = sheet.getCell("A20")
  signDK.value = "DK"

  sheet.mergeCells(`D20:${type =="FC"?'F20': 'E20'}`)
  const signCustomer = sheet.getCell("D20")
  signCustomer.value = "CUSTOMER";


  sheet.getCell("A2").value = `Daily report for: ${ddMMyyyy}`
  sheet.getCell("A3").value = `Printed: ${printdate}`
  title.value = "DK LOW PRESSURE DISTRIBUTION STATION"
  stationName.value = `${stationCode} GAS STATION`.toUpperCase()

  tbHeaderName.value = "DAILY TOTAL"
  tbHeaderLine1.value = `${type} ${StationID}01`
  if(type == "FC" && tbHeaderLine2) tbHeaderLine2.value = `${type} ${StationID}02`
  tbHeadeInUsed.value = "STATION IN USE";

  let dutyGros = "", dutyStand = "", dutyEner = "",
      dutyAvgTemp = "", dutyAvgPress = "", dutyAvgGross = "", dutyAvgStad = "", dutyAvgEner = ""
  const Line1Gross  = Line1DailyReport.GrossVolume.toFixed(4).toString()
  const Line1Stad   = Line1DailyReport.StandardVolume.toFixed(4).toString()
  const Line1Ener   = Line1DailyReport.Energy.toFixed(4).toString()
  const Line1AvgEner= Line1DailyReport.AvgEnergy.toFixed(4).toString()
  const Line1AvgPres= Line1DailyReport.AvgPressure.toFixed(4).toString()
  const Line1AvgStad= Line1DailyReport.AvgStandardVolume.toFixed(4).toString()
  const Line1AvgTemp= Line1DailyReport.AvgTemp.toFixed(4).toString()
  const Line1AvgGros= Line1DailyReport.AvgGrossVolume.toFixed(4).toString()

  if(type == "FC") {
    dutyGros      = duty[0].LineID == 1 ? Line1Gross    : Line2DailyReport.GrossVolume.toFixed(4).toString()
    dutyStand     = duty[0].LineID == 1 ? Line1Stad     : Line2DailyReport.StandardVolume.toFixed(4).toString()
    dutyEner      = duty[0].LineID == 1 ? Line1Ener     : Line2DailyReport.Energy.toFixed(4).toString()
    dutyAvgTemp   = duty[0].LineID == 1 ? Line1AvgTemp  : Line2DailyReport.AvgTemp.toFixed(4).toString()
    dutyAvgPress  = duty[0].LineID == 1 ? Line1AvgPres  : Line2DailyReport.AvgPressure.toFixed(4).toString()
    dutyAvgStad   = duty[0].LineID == 1 ? Line1AvgStad  : Line2DailyReport.AvgStandardVolume.toFixed(4).toString()
    dutyAvgGross  = duty[0].LineID == 1 ? Line1AvgGros  : Line2DailyReport.AvgGrossVolume.toFixed(4).toString()
    dutyAvgEner   = duty[0].LineID == 1 ? Line1AvgEner  : Line2DailyReport.AvgEnergy.toFixed(4).toString()
  } else {
    dutyGros      = Line1Gross
    dutyStand     = Line1Stad
    dutyEner      = Line1Ener
    dutyAvgTemp   = Line1AvgTemp
    dutyAvgPress  = Line1AvgPres
    dutyAvgStad   = Line1AvgStad
    dutyAvgGross  = Line1AvgGros
    dutyAvgEner   = Line1AvgEner
  }
  
  tbGrossName.value   = "Gross Volume (m³)"
  tbLine1Gros.value   = Line1Gross
  if(type == "FC" && tbLine2Gros) tbLine2Gros.value   = Line2DailyReport.GrossVolume.toFixed(4).toString()
  tbGrossInUsed.value = dutyGros

  tbStandName.value   = "Standard volume (Sm³)"
  tbLine1Stad.value   = Line1Stad
  if(type == "FC" && tbLine2Stad) tbLine2Stad.value   = Line2DailyReport.StandardVolume.toFixed(4).toString()
  tbStandInUsed.value = dutyStand

  tbEnerName.value    = "Energy (MMBTU)"
  tbLine1Ener.value   = Line1Ener
  if(type == "FC" && tbLine2Ener) tbLine2Ener.value   = Line2DailyReport.Energy.toFixed(4).toString()
  tbEnerInUsed.value  = dutyEner

  DailyAvgHeader.value = "DAILY AVERAGE DATA";

  tbAVGStadName.value   = "Standard Volume (Sm³)"
  tbLine1AvgStad.value  = Line1AvgStad
  if(type == "FC" && tbLine2AvgStad) tbLine2AvgStad.value  = Line2DailyReport.AvgStandardVolume.toFixed(4).toString()
  tbAvgStadInUsed.value = dutyAvgStad

  tbAVGTempName.value   = "Temperature (°C)"
  tbLine1AvgTemp.value  = Line1AvgTemp
  if(type == "FC" && tbLine2AvgTemp ) tbLine2AvgTemp.value  = Line2DailyReport.AvgTemp.toFixed(4).toString()
  tbAvgTempInUsed.value = dutyAvgTemp

  tbAVGPresName.value   = "Pressure (Bar)"
  tbLine1AvgPres.value  = Line1AvgPres
  if(type == "FC" && tbLine2AvgPres) tbLine2AvgPres.value  = Line2DailyReport.AvgPressure.toFixed(4).toString()
  tbAvgPresInUsed.value = dutyAvgPress

  tbAVGGrosName.value   = "Gross Volume (m³)"
  tbLine1AvgGros.value  = Line1AvgGros
  if(type == "FC" && tbLine2AvgGros) tbLine2AvgGros.value  = Line2DailyReport.AvgGrossVolume.toFixed(4).toString()
  tbAvgGrosInUsed.value = dutyAvgGross

  tbAVGEnerName.value   = "Energy (MMBTU)";
  tbLine1AvgEner.value  = Line1AvgEner
  if(type == "FC" && tbLine2AvgEner) tbLine2AvgEner.value  = Line2DailyReport.AvgEnergy.toFixed(4).toString();
  tbAvgEnerInUsed.value = dutyAvgEner;


  [title].map(cell => {
    cell.font = Object.assign(cell.font||{}, { size: 12 })
  });
  [ 
    tbHeaderLine2, tbLine1Gros, tbLine1Stad,
    tbHeaderName, tbHeaderLine1, tbHeadeInUsed, 
    stationName, signDK, signCustomer,
    tbGrossName,tbLine2Gros,tbGrossInUsed,
    tbStandName,tbLine2Stad,tbStandInUsed,
    tbEnerName,tbLine1Ener,tbEnerInUsed,
    DailyAvgHeader,
    tbAVGEnerName,tbLine1AvgEner,tbAvgEnerInUsed,
    tbAVGGrosName,tbLine1AvgGros,tbAvgGrosInUsed,
    tbAVGStadName,tbLine1AvgStad,tbAvgStadInUsed,
    tbAVGTempName,tbLine1AvgTemp,tbAvgTempInUsed,
    tbAVGPresName,tbLine1AvgPres,tbAvgPresInUsed
  ].map(cell => { 
    if(!cell) return
    cell.font = Object.assign(cell.font||{}, { size: 14 })
  });
  
  // wrap text
  [title, tbHeadeInUsed].map(cell => {
    cell.alignment = Object.assign(cell.alignment||{}, { wrapText: true })
  });
  
  // setting align
  // horizontal
  [ tbLine1Gros, tbLine1Stad,
    tbHeaderLine1, tbHeadeInUsed, 
    stationName,title,
    signDK, signCustomer,
    tbLine2Gros,tbGrossInUsed,
    tbLine2Stad,tbStandInUsed,
    tbLine1Ener,tbEnerInUsed,
    tbLine1AvgEner,tbAvgEnerInUsed,
    tbLine1AvgGros,tbAvgGrosInUsed,
    tbLine1AvgStad,tbAvgStadInUsed,
    tbLine1AvgTemp,tbAvgTempInUsed,
    tbLine1AvgPres,tbAvgPresInUsed
  ].map(cell => {
    if(!cell) return
    cell.alignment = Object.assign(cell.alignment||{}, { horizontal: "center" })
  });
  // vertical
  [tbHeaderName, tbHeaderLine1, tbHeadeInUsed, stationName,title,signDK, signCustomer,tbLine1Gros, tbLine1Stad].map(cell => { 
    cell.alignment = Object.assign(cell.alignment||{},{ vertical: "middle" })
  });
  
  // setting bold
  [tbHeaderName,tbHeaderLine1, tbHeadeInUsed, stationName,signDK, signCustomer,DailyAvgHeader]
  .map(cell => {
    cell.font = Object.assign(cell.font||{}, { bold: true })
  });
  
  [
    tbLine1Gros, tbLine1Stad,
    tbLine2Gros,tbGrossInUsed,
    tbLine2Stad,tbStandInUsed,
    tbLine1Ener,tbEnerInUsed,
    tbLine1AvgTemp,tbAvgTempInUsed,
    tbLine1AvgPres,tbAvgPresInUsed,
    tbLine1AvgGros,tbAvgGrosInUsed,
    tbLine1AvgStad,tbAvgStadInUsed,
    tbLine1AvgEner,tbAvgEnerInUsed
  ].map(cell => {
    if(!cell) return
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  if(type == "FC"){
    [tbHeaderLine2].map(cell => { 
      if(!cell) return
      cell.font = Object.assign(cell.font || {}, { bold: true }) });
    [tbLine2Gros, tbLine2Stad, tbLine2Ener, tbLine2AvgTemp, tbLine2AvgPres, tbLine2AvgGros, tbLine2AvgStad, tbLine2AvgEner]
    .map(cell => { 
      if(!cell) return
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = Object.assign(cell.alignment||{}, {
        vertical: "middle",
        horizontal: "center"
      })
      cell.font = Object.assign(cell.font || {}, { size: 14 })
    });
    [tbHeaderLine2].map(cell => { 
      if(!cell) return
      cell.alignment = Object.assign(cell.alignment || { vertical: "middle", horizontal: "center" })})
  }

  workbook.xlsx.writeFile(staticPath)
  return relatiPath
}