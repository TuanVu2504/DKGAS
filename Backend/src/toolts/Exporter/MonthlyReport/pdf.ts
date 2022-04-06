import * as datefns from 'date-fns'
import fs from 'fs'
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {  IDBStation } from '../../../../../Interface'
import { exportPath, globalConfig, pdfHelper } from '../../helper'
import { CaculateMonthlyReport } from '../Caculation'
const  { pdfConfig } = globalConfig
const  { _1pt } = pdfConfig

const image_path = globalConfig.exporter.dailyReport.path
const image_byte = fs.readFileSync(image_path)
const width     = 841.89 // pt
const height    = 595.28 // pt

const defaultRowHeight = 4.46/_1pt
const ColAWidth = 35.81/_1pt
const ColBWidth = 28.93/_1pt
const ColCWidth = 28.93/_1pt
const ColDWidth = 33.51/_1pt
const ColEWidth = 35.45/_1pt
const ColFWidth = 33.87/_1pt
const ColGWidth = 32.28/_1pt
const ColHWidth = 32.28/_1pt
const table_width = ColAWidth + ColBWidth + ColCWidth + ColDWidth + ColEWidth + ColFWidth + ColGWidth + ColHWidth
const pageMargin = (width - table_width)/2
const topMargin = pageMargin / 4

const ColALeft        = pageMargin,
      ColBLeft        = ColALeft + ColAWidth,
      ColCLeft        = ColBLeft + ColBWidth,
      ColDLeft        = ColCLeft + ColCWidth,
      ColELeft        = ColDLeft + ColDWidth,
      ColFLeft        = ColELeft + ColEWidth,
      ColGLeft        = ColFLeft + ColFWidth,
      ColHLeft        = ColGLeft + ColGWidth

const row1_hei        = 4.94/_1pt
const row2_hei        = 4.94/_1pt
const row3_hei        = 4.23/_1pt
const row4_hei        = 3.88/_1pt
const row5_hei        = 6.35/_1pt
const row6_hei        = 9.17/_1pt
const row38_hei       = 3.88/_1pt
const row39_hei       = 5.47/_1pt
const rowD_hei        = 4.23/_1pt
const fontSmall       = 11;
const fontMedium      = 12;
const fontLarge       = 14;
// const cellPadding     = 5;
// const borderWidth     = 1;

export async function pdf(station: IDBStation, date: Date): Promise<string> {
  const ddMMyyyy    = datefns.format(date, 'dd/MM/yyyy')
  const yyyyMM      = datefns.format(date, 'yyyyMM')
  const printdate = datefns.format(new Date(), 'dd/MM/yyyy - HH:mm:ss')
  const { StationID } = station
  const { staticPath, relatiPath } = exportPath.monthlyReport(StationID, yyyyMM).pdf  
  const pdf           = await PDFDocument.create()
  const image         = await pdf.embedJpg(image_byte)
  const image_ratio   = 0.1
  const imageDims     = image.scale(image_ratio)
  const font          = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold      = await pdf.embedFont(StandardFonts.HelveticaBold)
  const dkgas_sign    = "DK GAS DISTRIBUTION ENTERPRISE"
  const custo_sign    = "CUSTOMER"
  const title         = "DK LOW PRESSURE DISTRIBUTION STATION"
  const StationName   = `${station.name.toUpperCase()} GAS STATION`
  const table_title   = "MONTHLY DATA"
  const PDFPageCount = station.type == "FC" ? 2 : 1
  const PDFPageArray = Array.from(new Array(PDFPageCount)).map((e,i) => i+1)

  for(const pageNum of PDFPageArray){
    const page          = pdf.addPage([width, height])
    const { drawText } = pdfHelper.Context(page, pdf)
    const StationLineReport = await CaculateMonthlyReport(station, date, pageNum)
    let line = height - topMargin;
    // row1
    line = line - row1_hei
    await drawText([`Daily report for: ${datefns.format(date,'MM/yyyy')}`], { line, left: ColALeft, height: row1_hei, font: { size: fontSmall, format: font } })
    // row2
    line = line - row2_hei
    await page.drawImage(image, {
      x: ColHLeft + (ColHWidth - imageDims.width)/2,
      y: line - row3_hei,
      width: imageDims.width,
      height: imageDims.height
    })
    await drawText([`Printed: ${printdate}`], { line, left: ColALeft, height: row2_hei, font: { size: fontSmall, format: font }})
    await drawText([title], { left: ColCLeft, width: ColCWidth + ColDWidth + ColEWidth + ColFWidth + ColGWidth, height: row1_hei + row2_hei, line, font: { size: fontMedium, format: font } })
    await page.moveTo(ColHLeft, line)

    line = line - row3_hei - row4_hei
    await drawText([StationName], { line, left: ColCLeft, width: ColCWidth + ColDWidth + ColEWidth + ColFWidth + ColGWidth, height: row3_hei + row4_hei, font: { size: fontLarge, format: fontBold } })

    line = line - row5_hei
    await drawText([table_title], { line, height: row5_hei, left: ColALeft, width: table_width, font: { size: fontSmall, format: fontBold }, border: true })
    line = line - row6_hei
    await drawText(["Date"], { line, left: ColALeft, width: ColAWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText(["Temp (Deg)"], { line, left: ColBLeft, width: ColBWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText(["Pressure (Bara)"], { line, left: ColCLeft, width: ColCWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText("Gross Volume\nAcumulated".split('\n'), { line, left: ColDLeft, width: ColDWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText("Gross Volume\n(m3/day)".split('\n'), { line, left: ColELeft, width: ColEWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText("Std Volume\nAcumulated".split('\n'), { line, left: ColFLeft, width: ColFWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText("Std Volume\n(Sm3/day)".split('\n'), { line, left: ColGLeft, width: ColGWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })
    await drawText("Energy Flow\n(MMBTU/day)".split('\n'), { line, left: ColHLeft, width: ColHWidth, height: row6_hei, font: { size: fontSmall, format: font }, border: true })    

    for(const report of StationLineReport){
      line = line - defaultRowHeight
      await drawText([report[0]], { line, left: ColALeft, height: defaultRowHeight, width: ColAWidth, border: true })
      await drawText([report[1]], { line, left: ColBLeft, height: defaultRowHeight, width: ColBWidth, border: true })
      await drawText([report[2]], { line, left: ColCLeft, height: defaultRowHeight, width: ColCWidth, border: true })
      await drawText([report[3]], { line, left: ColDLeft, height: defaultRowHeight, width: ColDWidth, border: true })
      await drawText([report[4]], { line, left: ColELeft, height: defaultRowHeight, width: ColEWidth, border: true })
      await drawText([report[5]], { line, left: ColFLeft, height: defaultRowHeight, width: ColFWidth, border: true })
      await drawText([report[6]], { line, left: ColGLeft, height: defaultRowHeight, width: ColGWidth, border: true })
      await drawText([report[7]], { line, left: ColHLeft, height: defaultRowHeight, width: ColHWidth, border: true })
    }
    line = line - row38_hei - row39_hei
    await drawText([dkgas_sign], { line, left: ColALeft, width: ColAWidth + ColBWidth + ColCWidth + ColDWidth, height: row39_hei, font: { size: fontLarge, format: fontBold }})
    await drawText([custo_sign], { line, left: ColELeft, width: ColEWidth + ColFWidth + ColGWidth + ColHWidth, height: row39_hei, font: { size: fontLarge, format: fontBold }})

  }

  const content = await pdf.save()
  fs.writeFileSync(staticPath, content)
  return relatiPath
}
