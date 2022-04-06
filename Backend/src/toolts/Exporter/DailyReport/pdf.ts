import fs from 'fs';
import * as datefns from 'date-fns';
import { exportPath, globalConfig } from '../../helper'
import { helper } from '../../../../../globalTool'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { IDBStation } from '../../../../../Interface';
import { SQLServer, DKError } from '../..';

const image_path = globalConfig.exporter.dailyReport.path
const image_byte = fs.readFileSync(image_path)
// A4
const _1pt = 0.3528   // mm
const width = 595.28  // pt
const height = 841.89 // pt
const col1wid = 70.21/_1pt;
const col2wid = 54.86/_1pt
const col3wid = 46.92/_1pt;
const pageMargin = (width - col1wid - col2wid - col3wid)/2
const tbWidth = width - pageMargin * 2

const col1Left = pageMargin
const col2Left = col1Left + col1wid
const col3Left = col2Left + col2wid
const titleHeig       = 6.35*2/_1pt
const stationNameHeig = 7.58*2/_1pt

// 19.1/_1pt
// 54.134;
const fontSmall = 11;
const fontMedium = 12;
const fontLarge = 14;
const cellPadding = 5;
const borderWidth = 1;

export async function pdf(station: IDBStation, date: Date):Promise<string>{
  const { name, type, StationID } = station
  let   tbHeader1Width = 0,tbHeader2Width = 0,tbHeader3Width = 0,tbHeader4Width = 0,
        tbHeader1Left = 0,tbHeader2Left = 0,tbHeader3Left = 0,tbHeader4Left = 0, tbHeaderHeight = 0
  let   tbHeader1Content      = "DAILY TOTAL"
  let   tbHeader2Content      = `${type} ${station.StationID}01`.toUpperCase()
  let   tbHeader3Content      = `${type} ${station.StationID}02`.toUpperCase()
  let   tbHeader4Content      = `STATION IN USED`;
  let   StationName           = `${name.toUpperCase()} GAS STATION`
  if(type == "FC"){
    tbHeader1Width = col1wid
    tbHeader2Width = tbHeader3Width = tbHeader4Width = (tbWidth - tbHeader1Width)/3
    tbHeader1Left  = pageMargin;
    tbHeader2Left  = tbHeader1Left + tbHeader1Width
    tbHeader3Left  = tbHeader2Left + tbHeader2Width
    tbHeader4Left  = tbHeader3Left + tbHeader3Width
    tbHeaderHeight = 13.41/_1pt
    tbHeader4Content = `STATION IN\nUSED`
  } else {
    tbHeader3Left  = 0
    tbHeader3Width = 0
    tbHeader1Width = col1wid
    tbHeader2Width = col2wid
    tbHeader4Width = col3wid
    tbHeader1Left  = pageMargin
    tbHeader2Left  = tbHeader1Left + tbHeader1Width
    tbHeader4Left  = tbHeader2Left + tbHeader2Width
    tbHeaderHeight = 7.76/_1pt
  }

  const [year,month,day] = datefns.format(date, 'yyyy-MM-dd').split('-')
  const [_yea,_mont,_da] = datefns.format(helper.yesterday(date), 'yyyy-MM-dd').split('-')
  const duty               = await SQLServer.getDutyStatus(station.StationID, date)
  if(duty.length == 0){
    throw new Error(`no duty  for ${station.name} on ${datefns.format(date,'yyyy-MM-dd')}`)
  }
  const [Line1Daily, Line2Daily] = await Promise.all([
    SQLServer.Table("ReportStationDaily").select({ filter: { operator: "AND", values: [{ LineID: 1 }, { StationID: station.StationID }, { Date: datefns.format(date, 'yyyyMMdd') }] } }).then( rec => rec.recordset[0]),
    SQLServer.Table("ReportStationDaily").select({ filter: { operator: "AND", values: [{ LineID: 2 }, { StationID: station.StationID }, { Date: datefns.format(date, 'yyyyMMdd') }] } }).then( rec => rec.recordset[0])
  ])
  if(!Line1Daily){
    throw new Error(DKError.DailyReport.not_found(station, datefns.format(date, 'yyyyMMdd'), 1))
  }
  if(station.type == "FC" && !Line2Daily){
    throw new Error(DKError.DailyReport.not_found(station, datefns.format(date, 'yyyyMMdd'), 2))
  }

  // ReportDate.match(/(\d{4})(\d{2})(\d{2})/)!;
  const ddMMyyyy = `${day}/${month}/${year}`;
  const printdate = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')
  const { relatiPath, staticPath } = exportPath.dailyReport(StationID, `${year}${month}${day}`).pdf
  
  // now render pdf
  const title           = 'DK LOW PRESSURE\nDISTRIBUTION STATION'
  const pdf           = await PDFDocument.create()
  const image         = await pdf.embedJpg(image_byte)
  const image_ratio   = 0.15
  const imageDims     = image.scale(image_ratio)
  const page          = pdf.addPage()
  const font          = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold      = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fLargHeight   = font.heightAtSize(fontLarge)

  const drawRectangle = 
        (option: {
          x: number, 
          y: number, 
          height: number, 
          width: number
        }) =>  page.drawRectangle({ 
          opacity: 0, 
          color: rgb(0,0,0), 
          borderColor: rgb(0,0,0),
          borderWidth, 
          borderOpacity: 1, ...option 
        })

  let line = height-6.35/_1pt - pageMargin
  // scope1
  await page.moveTo(pageMargin, line + (6.35/_1pt - font.heightAtSize(fontSmall))/2)
  await page.drawText(`Daily report for: ${ddMMyyyy}`, {
    size: fontSmall,
    font: font,
  })
  await page.moveDown(6.35/_1pt);
  await page.drawText(`Printed: ${printdate}`, { size: fontSmall })

  await page.moveTo(col2Left, line)
  for(const text of title.split('\n')){
    const index = title.split('\n').indexOf(text)
    const textWidth = font.widthOfTextAtSize(text, fontSmall)
    await page.moveRight((col2wid-textWidth)/2)
    await page.moveDown((6.35/_1pt)*index)
    await page.drawText(text, { size: fontSmall, font: font })
    await page.moveLeft((col2wid-textWidth)/2)
  }

  // await page.moveTo(col3Left, line)
  await page.moveTo(col3Left, line)
  page.moveDown(6.35/_1pt);
  page.drawImage(image, { 
    x: col3Left + (col3wid - imageDims.width)/2,
    y: line - imageDims.height/2 - 6.35/_1pt,
    // - (image_height_area - imageDims.height)/2, 
    width: imageDims.width, 
    height: imageDims.height
  })

  //scope2
  line = line - titleHeig  - fLargHeight/2 
  const textWidth = font.widthOfTextAtSize(StationName, fontLarge);
  await page.moveTo(col2Left, line)
  await page.moveRight((col2wid-textWidth)/2)
  await page.drawText(StationName, { size: fontLarge, "font" : fontBold }) 

  line = line - stationNameHeig - 6.88*2/_1pt - tbHeaderHeight
  //- 7.94/_1pt
  // const headerCol2Width = font.widthOfTextAtSize(tbHeader2Content,fontLarge)
  // const headerCol3Width = font.widthOfTextAtSize(tbHeader4Content,fontLarge)
  
  await page.moveTo(tbHeader1Left, line + (tbHeaderHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(tbHeader1Content, { font: fontBold, size: fontLarge })
  await page.moveTo(tbHeader2Left+(tbHeader2Width - font.widthOfTextAtSize(tbHeader2Content, fontLarge))/2, line + (tbHeaderHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(tbHeader2Content, { font: fontBold, size: fontLarge })
  if(type=="FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(tbHeader3Content, fontLarge))/2, line + (tbHeaderHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(tbHeader3Content, { font: fontBold, size: fontLarge })
  }
  const tbHeader4TextArrays = tbHeader4Content.split('\n')
  const eachLineHeight = tbHeaderHeight/tbHeader4TextArrays.length
  if(tbHeader4TextArrays.length > 1){
    for(const eachText of tbHeader4TextArrays){
      const _text_index = tbHeader4TextArrays.indexOf(eachText)
      await page.moveTo(
        tbHeader4Left + (tbHeader4Width - font.widthOfTextAtSize(eachText, fontLarge))/2, 
        (line + tbHeaderHeight) - eachLineHeight*_text_index - eachLineHeight/2 - font.heightAtSize(fontLarge)/2
        //  (eachLineHeight - font.heightAtSize(fontLarge))/2 - eachLineHeight*_text_index
        // line + eachLineHeight*_text_index + (eachLineHeight - font.heightAtSize(fontLarge))*(_text_index + 1)/2
      )
      await page.drawText(eachText, { font: fontBold, size: fontLarge })
    }
  } else {
    await page.moveTo(
      tbHeader4Left + (tbHeader4Width - font.widthOfTextAtSize(tbHeader4Content, fontLarge))/2, 
      line + (tbHeaderHeight - font.heightAtSize(fontLarge))/2
    )
    await page.drawText(tbHeader4Content, { font: fontBold, size: fontLarge })
  }
  const LineID = duty[0].LineID
  // line = line - lineRate*(fontSmall-1)
  const tbRowHeight = 7.41/_1pt
  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(`Gross Volume (m³)`, { font: font, size: fontLarge })
  const Line1Gros = Line1Daily.GrossVolume.toFixed(4)+""
  const LineDutyGros = station.type == "EVC" || LineID == 1 ? Line1Gros : Line2Daily.GrossVolume.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1Gros,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1Gros, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyGros,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyGros, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.GrossVolume.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.GrossVolume.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }
  
  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(`Standard volume (Sm³)`, { font: font, size: fontLarge })
  const Line1Stad = Line1Daily.StandardVolume.toFixed(4)+""
  const LineDutyStad = station.type == "EVC" || LineID == 1 ? Line1Stad : Line2Daily.StandardVolume.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1Stad,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1Stad, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyStad,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyStad, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.StandardVolume.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.StandardVolume.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(`Energy (MMBTU)`, { font: font, size: fontLarge })
  const Line1Ener     = Line1Daily.Energy.toFixed(4)+""
  const LineDutyEner  = station.type == "EVC" || LineID == 1 ? Line1Ener : Line2Daily.Energy.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1Ener,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1Ener, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyEner,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyEner, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.Energy.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.Energy.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - 10.58/_1pt
  await page.moveTo(tbHeader1Left, line + ((10.25/_1pt) - font.heightAtSize(fontLarge))/2);
  await page.drawText("DAILY AVERAGE DATA", { font: fontBold, size: fontLarge })

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(`Temperature (°C)`, { font: font, size: fontLarge })
  const Line1AvgTemp     = Line1Daily.AvgTemp.toFixed(4) + ""
  const LineDutyAvgTemp  = station.type == "EVC" || LineID == 1 ? Line1AvgTemp : Line2Daily.AvgTemp.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1AvgTemp,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1AvgTemp, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyAvgTemp,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyAvgTemp, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.AvgTemp.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.AvgTemp.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText("Pressure (Bar)", { font: font, size: fontLarge })
  const Line1AvgPres     = Line1Daily.AvgPressure.toFixed(4) + ""
  const LineDutyAvgPres  = station.type == "EVC" || LineID == 1 ? Line1AvgPres : Line2Daily.AvgPressure.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1AvgPres,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1AvgPres, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyAvgPres,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyAvgPres, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.AvgPressure.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.AvgPressure.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText("Gross Volume (m³)", { font: font, size: fontLarge })
  const Line1AvgGros     = Line1Daily.AvgGrossVolume.toFixed(4) + ""
  const LineDutyAvgGros  = station.type == "EVC" || LineID == 1 ? Line1AvgGros : Line2Daily.AvgGrossVolume.toFixed(4)+""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1AvgGros,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1AvgGros, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyAvgGros,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyAvgGros, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.AvgGrossVolume.toFixed(4)+"", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.AvgGrossVolume.toFixed(4)+"", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText("Standard Volume (Sm³)", { font: font, size: fontLarge })
  const Line1AvgStad     = Line1Daily.AvgStandardVolume.toFixed(4) + ""
  const LineDutyAvgStad  =  station.type == "EVC" || LineID == 1 ? Line1AvgStad : Line2Daily.AvgStandardVolume.toFixed(4) + ""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1AvgStad,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1AvgStad, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyAvgStad,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyAvgStad, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.AvgStandardVolume.toFixed(4) + "", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.AvgStandardVolume.toFixed(4) + "", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - tbRowHeight
  await page.moveTo(tbHeader1Left, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText("Energy (MMBTU)", { font: font, size: fontLarge })
  const Line1AvgEner     = Line1Daily.AvgEnergy.toFixed(4) + ""
  const LineDutyAvgEner  = station.type =="EVC" || LineID == 1 ? Line1AvgEner : Line2Daily.AvgEnergy.toFixed(4) + ""
  await page.moveTo(tbHeader2Left+(tbHeader2Width-font.widthOfTextAtSize(Line1AvgEner,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(Line1AvgEner, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader2Left, y: line, height: tbRowHeight, width: tbHeader2Width })
  await page.moveTo(tbHeader4Left+(tbHeader4Width-font.widthOfTextAtSize(LineDutyAvgEner,fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
  await page.drawText(LineDutyAvgEner, { font: font, size: fontLarge })
  await drawRectangle({ x: tbHeader4Left, y: line, height: tbRowHeight, width: tbHeader4Width })
  if(type == "FC"){
    await page.moveTo(tbHeader3Left+(tbHeader3Width - font.widthOfTextAtSize(Line2Daily.AvgEnergy.toFixed(4) + "", fontLarge))/2, line + (tbRowHeight - font.heightAtSize(fontLarge))/2)
    await page.drawText(Line2Daily.AvgEnergy.toFixed(4) + "", { font: font, size: fontLarge })
    await drawRectangle({ x: tbHeader3Left, y: line, height: tbRowHeight, width: tbHeader3Width })
  }

  line = line - 17.11/_1pt
  const DK = 'DK'
  const CUSTOMER = 'CUSTOMER'
  const DKWidth = font.widthOfTextAtSize(DK, fontLarge)
  const CUSWidth = font.widthOfTextAtSize(CUSTOMER, fontLarge)
  await page.moveTo(((width/2)-DKWidth)/2, line)
  await page.drawText(DK, { font: fontBold, size: fontLarge })
  await page.moveTo(width*0.75-CUSWidth/2, line)
  await page.drawText(CUSTOMER, { font: fontBold, size: fontLarge })
  const content = await pdf.save()
  fs.writeFileSync(staticPath, content)
  return relatiPath
}