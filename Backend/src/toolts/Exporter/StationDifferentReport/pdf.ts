import { IDBStation } from '../../../../../Interface'
import * as datefns from 'date-fns'
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { settings } from '../../../app.settings'
import  fontkit from '@pdf-lib/fontkit'
import { stationDifferentCaculation } from '../Caculation'
import fs from 'fs'
import path from 'path'
import { exportPath, globalConfig, pdfHelper } from '../../helper'
const  { pdfConfig } = globalConfig
const  { _1pt } = pdfConfig

const image_path = globalConfig.exporter.dailyReport.path
const image_byte = fs.readFileSync(image_path)
const width     = 595.28 // pt
const height    = 841.89 // pt
const ColAWidth = 30.69/_1pt
const ColBWidth = 39.16/_1pt
const ColCWidth = 39.16/_1pt
const ColDWidth = 39.16/_1pt
const ColEWidth = 39.16/_1pt
const table_width = ColAWidth + ColBWidth + ColCWidth + ColDWidth + ColEWidth
const pageMargin = (width - table_width)/2
const topMargin = pageMargin / 4

const ColALeft        = pageMargin,
      ColBLeft        = ColALeft + ColAWidth,
      ColCLeft        = ColBLeft + ColBWidth,
      ColDLeft        = ColCLeft + ColCWidth,
      ColELeft        = ColDLeft + ColDWidth

const row1_hei          = 6.35/_1pt,
      row2_hei          = 6.35/_1pt,
      row3_hei          = 15.52/_1pt,
      row4_hei          = 5.64/_1pt,
      row5_hei          = 5.64/_1pt,
      row6_hei          = 16.58/_1pt,
      defaultRowHeight  = 7.06/_1pt
      
const roboto_bold = fs.readFileSync(path.join(settings.appPath.assets, 'webfonts', 'Roboto-Bold.ttf'))
const roboto_regu = fs.readFileSync(path.join(settings.appPath.assets, 'webfonts', 'Roboto-Regular.ttf'))
export async function pdf(station: IDBStation, date: Date){
  const data_report_for = datefns.format(date, 'MM/yyyy')
  const printed_date  = datefns.format(new Date(), 'dd/MM/yyyy HH:mm:ss')
  const { StationID } = station
  const data = await stationDifferentCaculation(station, date)
  const { staticPath, relatiPath } = exportPath.stationDifferentCaculation(StationID, datefns.format(date, 'yyyyMM')).pdf  
  const pdf           = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const robotoBold    = await pdf.embedFont(roboto_bold)
  const rototoRegu    = await pdf.embedFont(roboto_regu)

  const page          = pdf.addPage()
  const image         = await pdf.embedJpg(image_byte)
  const image_ratio   = 0.1
  const imageDims     = image.scale(image_ratio)
  const fontNorm      = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold      = await pdf.embedFont(StandardFonts.HelveticaBold)
  const title         = "DK LOW PRESSURE\nDISTRIBUTION STATION"
  const table_title   = `DIFFERENCE CALCULATION OF\n${station.name.toUpperCase()} STATION`
  const { drawText } = pdfHelper.Context(page, pdf, rototoRegu)

  // line1
  let line = height - row1_hei - topMargin
  await drawText([`Data report for: ${data_report_for}`], { line, left: ColALeft, height: row1_hei })

  // line2
  line = line - row2_hei
  await page.moveTo(ColALeft, line)
  await drawText([`Printed: ${printed_date}`], { line, left: ColALeft, height: row2_hei })
  await page.moveTo(ColCLeft, line)
  await drawText(title.split('\n'), { 
    left: ColCLeft, 
    width: ColCWidth + ColDWidth, 
    line, 
    height: row1_hei + row2_hei,
    font: { format: fontNorm, size: 12 }
  })

  line = line - row3_hei
  page.drawImage(image, { 
    x: ColELeft + (ColEWidth - imageDims.width)/2,
    y: line + (row1_hei + row2_hei + row3_hei - imageDims.height)/2,
    width: imageDims.width, 
    height: imageDims.height
  })

  // row4
  line = line - row4_hei
  await drawText(table_title.split('\n'), { 
    left: ColCLeft, 
    width: ColCWidth + ColDWidth, 
    line, 
    height: row3_hei + row4_hei,
    font: { format: fontBold, size: 12 }
  })

  // row6
  line = line - row5_hei - row6_hei
  await drawText(["DATE"], { line, left: ColALeft, width: ColAWidth, height: row6_hei, font: { format: fontBold, size: 11 }, border: true })
  await drawText("Total volume Station\nAutomatic\n(Sm³)".split('\n'), { line, left: ColBLeft, width: ColBWidth, height: row6_hei, font: { format: fontBold, size: 11 }, border: true })
  await drawText("Total volume Station\nManual\n(Sm³)".split('\n'), { line, left: ColCLeft, width: ColCWidth, height: row6_hei, font: { format: fontBold, size: 11 }, border: true })
  await drawText("Δ Volume\n(Sm³)".split('\n'), { line, left: ColDLeft, width: ColDWidth, height: row6_hei, font: { format: robotoBold, size: 11 }, border: true })
  await drawText("%Δ\nVolume".split('\n'), { line, left: ColELeft, width: ColEWidth, height: row6_hei, font: { format: robotoBold, size: 11 }, border: true })
  
  // row7
  for(const d of data){
    line = line - defaultRowHeight;
    await drawText([d[0]], { line, left: ColALeft, width: ColAWidth, height: defaultRowHeight, border: true, font: { format: fontNorm, size: 11 }})
    await drawText([d[1]], { line, left: ColBLeft, width: ColBWidth, height: defaultRowHeight, border: true, font: { format: fontNorm, size: 11 }})
    await drawText([d[2]], { line, left: ColCLeft, width: ColCWidth, height: defaultRowHeight, border: true, font: { format: fontNorm, size: 11 }})
    await drawText([d[3]], { line, left: ColDLeft, width: ColDWidth, height: defaultRowHeight, border: true, font: { format: fontNorm, size: 11 }})
    await drawText([d[4]], { line, left: ColELeft, width: ColEWidth, height: defaultRowHeight, border: true, font: { format: fontNorm, size: 11 }})
  }
  const content = await pdf.save()
  fs.writeFileSync(staticPath, content)
  return relatiPath
}