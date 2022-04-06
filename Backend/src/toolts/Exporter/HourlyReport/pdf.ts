import fs from 'fs';
import * as datefns from 'date-fns';
import { exportPath, globalConfig  } from '../../helper'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { SQLServer } from '../..'
import { IDBStation } from '../../../../../Interface';
const { pdfConfig } = globalConfig
const { _1pt } = pdfConfig
const image_path = globalConfig.exporter.dailyReport.path
const image_byte = fs.readFileSync(image_path)
// A4
// const _1mm = 2.8346456693
const width           = 595.28  // pt
const height          = 841.89 // pt


const colwidth        = 30.69/_1pt
const pageMargin      = (width - colwidth*6)/2

const col1left:number = pageMargin + 0*colwidth,
      col2left:number = pageMargin + 1*colwidth,
      col3left:number = pageMargin + 2*colwidth,
      col4left:number = pageMargin + 3*colwidth,
      col5left:number = pageMargin + 4*colwidth,
      col6left:number = pageMargin + 5*colwidth

const row1_hei        = 6.35/_1pt
const row2_hei        = 6.35/_1pt
const row3_hei        = 6.35/_1pt
const row4_hei        = 7.67/_1pt
const row5_hei        = 7.67/_1pt
const row6_hei        = 8.12/_1pt
const row7_hei        = 12.17/_1pt
const rowD_hei        = 5.56/_1pt
const fontSmall       = 11;
const fontMedium      = 12;
const fontLarge       = 14;

export async function pdf(station: IDBStation, ReportDate: string):Promise<string>{
  const [,yyyy,MM,dd] = ReportDate.match(/(\d{4})(\d{2})(\d{2})/)!;
  const from                        = new Date(`${yyyy}-${MM}-${dd}`)
  const to                          = new Date(`${yyyy}-${MM}-${dd}`)
  const data                        = await SQLServer.Table("realtimeEVC")
                                                     .select({ filter: { 
                                                        operator: "AND", 
                                                        values: [ { ID: station.StationID},
                                                                  { Time: datefns.startOfDay(from).getTime(), compare: ">="}, 
                                                                  { Time: datefns.endOfDay(to).getTime(), compare: "<=" } ]
                                                      }}).then( res => res.recordset )
  const ddMMyyyy                    = `${dd}/${MM}/${yyyy}`;
  const printdate                   = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')
  const { relatiPath, staticPath }  = exportPath.hourlyReport(station.StationID, ReportDate).pdf
  
  // now render pdf
  const pdf                         = await PDFDocument.create()
  const image                       = await pdf.embedJpg(image_byte)
  const image_ratio                 = 0.1
  const imageDims                   = image.scale(image_ratio)
  const font                        = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold                    = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fSmalHeight                 = font.heightAtSize(fontSmall)
  const fMedHeight                  = font.heightAtSize(fontMedium)
  const fLargHeight                 = font.heightAtSize(fontLarge)
  const title                       = "DK LOW PRESSURE\nDISTRIBUTION STATION"
  const StationName                 = `${station.name.toUpperCase()} GAS STATION`
  const table_title                 = 'HOURLY AVERAGE DATA'
  const PDFPageCount                = station.type == "FC" ? 2 : 1
  const PDFPageArray                = Array.from(new Array(PDFPageCount)).map((e,i) => i+1)

  for(const pageNum of PDFPageArray){
    const page          = pdf.addPage([width, height])
    const drawRectangle = 
    (option: { x: number, y: number, height: number, width: number}) =>
    page.drawRectangle({ 
      opacity: 0, 
      color: rgb(0,0,0), 
      borderColor: rgb(0,0,0),
      borderWidth: pdfConfig.borderWidth, 
      borderOpacity: 1, ...option 
    })
    const LineID = pageNum;
    let line = height-row1_hei - pageMargin
    // scope1
    await page.moveTo(pageMargin, line)
    await page.drawText(`Daily report for: ${ddMMyyyy}`, {
      size: fontSmall,
      font: font,
    })
    await page.moveDown(row2_hei);
    await page.drawText(`Printed: ${printdate}`, { size: fontSmall })
  
    await page.moveTo(col3left, line)
    const title_texts = title.split('\n')
    for(const _title_text of title_texts){
      const text_width = font.widthOfTextAtSize(_title_text, fontMedium)
      await page.moveRight((colwidth*3 - text_width)/2)
      await page.drawText(_title_text, { size: fontMedium, font: font })
      await page.moveLeft((colwidth*3 - text_width)/2)
      await page.moveDown((((row2_hei+row3_hei)/2) + fMedHeight)/2)
    }
  
    page.drawImage(image, { 
      x: col6left + (colwidth - imageDims.width)/2,
      y: line - (row2_hei + row3_hei + imageDims.height)/2,
      width: imageDims.width, 
      height: imageDims.height
    })
  
    //scope2
    line = line - row2_hei - row3_hei 
    // - fLargHeight/2 
    const stationName_width = font.widthOfTextAtSize(StationName, fontLarge);
    await page.moveTo(col3left, line)
    await page.moveRight((colwidth*3-stationName_width)/2)
    await page.moveDown((row4_hei + row5_hei - fLargHeight)/2)
    await page.drawText(StationName, { size: fontLarge, font : fontBold }) 
  
    line = line - row4_hei - row5_hei
    const time_header = "Time"
    const temp_header = "Temp (Deg)"
    const pres_header = "Pressure (Bara)"
    const gros_header = "Gross Flow\n(m3/hr)"
    const stad_header = "Std Flow\n(Sm3/hr)"
    const ener_header = "Energy Flow\n(MMBTU/hr)";
    const headers = [time_header,
                      temp_header,
                      pres_header,
                      gros_header,
                      stad_header,
                      ener_header]
  
    // START TABLE TITLE
    await drawRectangle({ x: col1left, y: line-row6_hei, height: row6_hei, width: colwidth * 6 })
    await page.moveTo(pageMargin, line)
    const table_title_width = font.widthOfTextAtSize(table_title, fontSmall)
    await page.moveDown((row6_hei + fSmalHeight)/2)
  
    await page.moveRight((colwidth*6 - table_title_width)/2)
    await page.drawText(table_title, { font: fontBold, size: fontSmall })
    // END TABLE TITLE
  
    // START TABLE HEADER
    line  = line - row6_hei
    for(const header of headers){
      const col_index = headers.indexOf(header)
      const colx = pageMargin + (col_index*colwidth)
      const coly = line
      await drawRectangle({ x: colx, y: coly-row7_hei, width: colwidth, height: row7_hei })
      await page.moveTo(colx,coly)
      const texts = header.split('\n')
      if(texts.length == 2){
        for(const _text of texts){
          const text_width = font.widthOfTextAtSize(_text, fontSmall)
          await page.moveRight((colwidth - text_width)/2)
          await page.moveDown(((row7_hei/2) + fSmalHeight)/2)
          await page.drawText(_text, { size: fontSmall, font: font })
          await page.moveLeft((colwidth - text_width)/2)
        }
      } else if(texts.length == 1){
        const _text = texts[0]
        const text_width = font.widthOfTextAtSize(_text, fontSmall)
        await page.moveRight((colwidth - text_width)/2)
        await page.moveDown((row7_hei + fSmalHeight)/2)
        await page.drawText(_text, { font: font, size: fontSmall })
      } else {
        throw new Error('I dont support render more than 2 line of text')
      }
    }
    // END TABLE HEADER
    
    line = line - row7_hei
    // 0 -> 23
    const line_array = Array.from(new Array(24)).map((e,i) => i)
    for(const line_index of line_array){
      let _from = ("00" + line_index).slice(-2)
      let _to   = ("00" + (line_index+1)).slice(-2)
      const realTime_currentTime = data.filter(_realTime => {
        const _Time = new Date(+_realTime.Time).getHours()
        return _Time <= line_index+1 && _Time >= line_index
      })

      await page.moveTo(col1left, line)
  
      await drawRectangle({ x: col1left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const time = `${_from}:00 - ${_to}:00`
      const time_width = font.widthOfTextAtSize(time, fontMedium)
      await page.moveTo(col1left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - time_width)/2)
      await page.drawText(time, { font: font, size: fontMedium })
  
      await drawRectangle({ x: col2left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const temp = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.Tevc : +b.Tevc_02 ), 0) / realTime_currentTime.length)
                            : 0
      const temp_text = temp.toFixed(2)
      const temp_width = font.widthOfTextAtSize(temp_text, fontMedium)
      await page.moveTo(col2left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - temp_width)/2)
      await page.drawText(temp_text, { font: font, size: fontMedium })
  
      await drawRectangle({ x: col3left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const pres = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.Pevc : +b.Pevc_02 ), 0) / realTime_currentTime.length)
                            : 0
      const pres_text = pres.toFixed(2)
      const pres_width = font.widthOfTextAtSize(pres_text, fontMedium)
      await page.moveTo(col3left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - pres_width)/2)
      await page.drawText(pres_text, { font: font, size: fontMedium })
  
      await drawRectangle({ x: col4left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const gros = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.GVF : +b.GVF_02 ), 0) / realTime_currentTime.length)
                            : 0
      const gros_text = gros.toFixed(2)
      const gros_width = font.widthOfTextAtSize(gros_text, fontMedium)
      await page.moveTo(col4left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - gros_width)/2)
      await page.drawText(gros_text, { font: font, size: fontMedium })
  
      await drawRectangle({ x: col5left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const stad = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.SVF : +b.SVF_02 ), 0) / realTime_currentTime.length)
                            : 0
      const stad_text = stad.toFixed(2)
      const stad_width = font.widthOfTextAtSize(stad_text, fontMedium)
      await page.moveTo(col5left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - stad_width)/2)
      await page.drawText(stad_text, { font: font, size: fontMedium })
  
      await drawRectangle({ x: col6left, y: line - rowD_hei, width: colwidth, height: rowD_hei })
      const ener = realTime_currentTime.length > 0 
                            ? (realTime_currentTime.reduce((a,b) => a + ( LineID == 1 ? +b.VbToday : +b.VbToday_02 ), 0) / realTime_currentTime.length)
                            : 0
      const ener_text = ener.toFixed(2)
      const ener_width = font.widthOfTextAtSize(ener_text, fontMedium)
      await page.moveTo(col6left, line)
      await page.moveDown((rowD_hei+fSmalHeight)/2)
      await page.moveRight((colwidth - ener_width)/2)
      await page.drawText(ener_text, { font: font, size: fontMedium })
  
      // break to new line
      line  = line - rowD_hei
    }
  
    line = line - rowD_hei
  
    const dkgas_sign = "DK GAS DISTRIBUTION ENTERPRISE"
    const custom_sign = "CUSTOMER"
  
    const dkgas_sign_width = font.widthOfTextAtSize(dkgas_sign, fontLarge)
    const custom_sign_width = font.widthOfTextAtSize(custom_sign, fontLarge)
    
    await page.moveTo(col1left, line)
    await page.moveRight((colwidth*3-dkgas_sign_width)/2)
    await page.moveDown((fLargHeight+rowD_hei)/2)
    await page.drawText(dkgas_sign, { font: fontBold, size: fontLarge })
  
    await page.moveTo(col4left, line)
    await page.moveRight((colwidth*3-custom_sign_width)/2)
    await page.moveDown((fLargHeight+rowD_hei)/2)
    await page.drawText(custom_sign, { font: fontBold, size: fontLarge })
  
    line = line - rowD_hei * 4
    const sign_name = 'Representative : ........................................'
    const sign_name_width = font.widthOfTextAtSize(sign_name, fontSmall)
    await page.moveTo(col1left, line)
    await page.moveRight((colwidth*3-sign_name_width)/2)
    await page.moveDown((rowD_hei+fSmalHeight)/2)
    await page.drawText(sign_name, { font: font, size: fontSmall })
  
    await page.moveTo(col4left, line)
    await page.moveRight((colwidth*3-sign_name_width)/2)
    await page.moveDown((rowD_hei+fSmalHeight)/2)
    await page.drawText(sign_name, { font: font, size: fontSmall })
  }
  
  const content = await pdf.save()
  fs.writeFileSync(staticPath, content)
  return relatiPath
}