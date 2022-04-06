import { Workbook, Cell } from 'exceljs'
import * as datefns from 'date-fns'
import path from 'path'
import { settings } from '../app.settings'
import { PDFPage, PDFFont, rgb, PDFDocument, StandardFonts } from 'pdf-lib'

export function keyof<T = any>(obj: T){
  return Object.keys(obj) as (keyof T)[]
}

export const cenToInch = (cen: number) => cen/2.54

export function setWorkBook(workbook: Workbook, sheetNames: string[]){
  workbook.creator = "DKGAS"
  workbook.lastModifiedBy = "DKGAS Admin"
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date()

  workbook.views = [{
    x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, activeTab: 1, visibility: "visible"
  }]

  return sheetNames.map( name => workbook.addWorksheet(name, {
    views: [{
      "showRowColHeaders": true,
      "style": "pageLayout",
    }],
    pageSetup: { 
      showRowColHeaders: false,
      showGridLines: false,
      paperSize: 9, orientation: "portrait",
    },
  }))
}

export const excelRatio = {
  colRatio: 10/21.17,
  // 1.989,
  rowRatio: 10/3.53
  // 0.35
}


export const exportPath = {
  dailyReport: (StationID: number, ReportDate: string) => {
    return {
      pdf: {
        staticPath: path.join(settings.appPath.privateAssets,'pdf', `DailyReport-${StationID}-${ReportDate}.pdf`),
        relatiPath: path.join('privateAssets','pdf', `DailyReport-${StationID}-${ReportDate}.pdf`)
      },
      excel: {
        staticPath: path.join(settings.appPath.privateAssets,'excel', `DailyReport-${StationID}-${ReportDate}.xlsx`),
        relatiPath: path.join('privateAssets','excel', `DailyReport-${StationID}-${ReportDate}.xlsx`)
      }
    }
  },
  hourlyReport: (StationID: number, ReportDate: string) => {
    return {
      pdf: {
        staticPath: path.join(settings.appPath.privateAssets,'pdf', `HourlyReport-${StationID}-${ReportDate}.pdf`),
        relatiPath: path.join('privateAssets','pdf', `HourlyReport-${StationID}-${ReportDate}.pdf`)
      },
      excel: {
        staticPath: path.join(settings.appPath.privateAssets,'excel', `HourlyReport-${StationID}-${ReportDate}.xlsx`),
        relatiPath: path.join('privateAssets','excel', `HourlyReport-${StationID}-${ReportDate}.xlsx`)
      }
    }
  },
  monthlyReport: (StationID: number, ReportDate: string) => {
    return {
      pdf: {
        staticPath: path.join(settings.appPath.privateAssets,'pdf', `MonthltReport-${StationID}-${ReportDate}.pdf`),
        relatiPath: path.join('privateAssets','pdf', `MonthltReport-${StationID}-${ReportDate}.pdf`)
      },
      excel: {
        staticPath: path.join(settings.appPath.privateAssets,'excel', `MonthltReport-${StationID}-${ReportDate}.xlsx`),
        relatiPath: path.join('privateAssets','excel', `MonthltReport-${StationID}-${ReportDate}.xlsx`)
      }
    }
  },
  stationDifferentCaculation: (StationID: number, ReportDate: string) => {
    return {
      pdf: {
        staticPath: path.join(settings.appPath.privateAssets,'pdf', `StationDifferentCaculation-${StationID}-${ReportDate}.pdf`),
        relatiPath: path.join('privateAssets','pdf', `StationDifferentCaculation-${StationID}-${ReportDate}.pdf`)
      },
      excel: {
        staticPath: path.join(settings.appPath.privateAssets,'excel', `StationDifferentCaculation-${StationID}-${ReportDate}.xlsx`),
        relatiPath: path.join('privateAssets','excel', `StationDifferentCaculation-${StationID}-${ReportDate}.xlsx`)
      }
    }
  }
}

export const globalConfig = {
  exporter: {
    dailyReport: {
      path: path.join(settings.appPath.assets,'image','dkgas_report_image.png')
    }
  },
  pdfConfig: {
    borderWidth: 0.5,
    _1pt: 0.35277831682244, // mm
    
  },
  excel: {

  }
}

export const tools = {
  getDaysOfMonths: (date: Date|number) => {
    const endOfMonth  = datefns.endOfMonth(date)
    let day           = datefns.startOfMonth(date)
    const days: Date[] = []
    while(day <= endOfMonth){ 
      days.push(new Date(day)); 
      day = datefns.addDays(day, 1) 
    }
    return days
  }
}

export const pdfHelper = {
  Context: (page: PDFPage, pdf: PDFDocument, font?:PDFFont) => {
    const drawRectangle = (option: { x: number, y: number, height: number, width: number}) =>
      page.drawRectangle({ 
        opacity: 0, 
        color: rgb(0,0,0), 
        borderColor: rgb(0,0,0),
        borderWidth: globalConfig.pdfConfig.borderWidth, 
        borderOpacity: 1, ...option 
      })

    const drawText = async (texts: string[], option: { line: number, left: number, height: number, width?:number, font?: { size: number, format: PDFFont }, border?:boolean }) => {
      const line = option.line
      const __border = option.border
      const __width  = option.width
      const __height = option.height
      const __left = option.left
      const __top = line + __height
      const fsize = option.font ? option.font.size : 10
      const fomat = option.font ? option.font.format : font ? font : await pdf.embedFont(StandardFonts.Helvetica)
      const _aTextHeight = fomat.heightAtSize(fsize)
      const __totalLineCount  = texts.length
      const __lineSpace = _aTextHeight / 4
      const __totalTextHeight = _aTextHeight * __totalLineCount + ( __totalLineCount - 1 ) * __lineSpace
      const __topMargin = ( __height - __totalTextHeight ) / 2
      await page.moveTo(__left, __top - __topMargin)
      for(const text of texts){
        const txt_index = texts.indexOf(text)
        const txt_line = txt_index + 1
        await page.moveTo(__left, __top - __topMargin - _aTextHeight*txt_line - __lineSpace*txt_index)
        // await page.moveTo(__left, __top - __childLineHeight * txt_line + (__childLineHeight - txt_heigh)/2)
        if(__width){ 
          const txt_width = fomat.widthOfTextAtSize(text, fsize)
          await page.moveRight( __width/2 - txt_width/2 ) 
        }
        await page.drawText(text, { font: fomat, size: fsize })
        await page.moveDown(__lineSpace)
      }
      if(__border){
        if(!__width) throw new Error(`width is required if you want to draw retangle`)
        await drawRectangle({ x: __left, y:line, height: __height, width: __width })
      }
    }

    return {
      drawRectangle, drawText
    }
  }
}

export const excelHelper = {
  centerText: (cells: Cell[]) => {
    excelHelper.hCenter(cells)
    excelHelper.vCenter(cells)
  },
  hCenter:(cells: Cell[]) => {
    cells.map(cell => {
      cell.alignment = Object.assign(cell.alignment||{}, { horizontal: "center" })
    })
  },
  vCenter: (cells: Cell[]) => {
    cells.map(cell => { 
      cell.alignment = Object.assign(cell.alignment||{},{ vertical: "middle" })
    })
  },
  setFontSize: (cells: Cell[], size: number) => {
    cells.map(cell => cell.font = Object.assign(cell.font||{}, { size }))
  },
  wrapText: (cells: Cell[]) => cells.map(cell => {
    cell.alignment = Object.assign(cell.alignment||{}, { wrapText: true })
  }),
  setTextBold: (cells:  Cell[]) => cells.map( cell => {
    cell.font = Object.assign(cell.font||{}, { bold: true })
  }),
  setBorder:(cells:  Cell[]) => cells.map( cell => {
    cell.border = Object.assign(cell.border||{}, {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    })
  }),
  format(cells: Cell[], option: { center?: boolean, hCenter?: boolean, vCenter?: boolean, border?: boolean, bold?:boolean, fontsize?:number, wrapText?:boolean }) {
    if(option.center)   excelHelper.centerText(cells)
    if(option.hCenter)  excelHelper.hCenter(cells)
    if(option.vCenter)  excelHelper.vCenter(cells)
    if(option.wrapText) excelHelper.wrapText(cells)
    if(option.bold)     excelHelper.setTextBold(cells)
    if(option.border)   excelHelper.setBorder(cells)
    if(option.fontsize) excelHelper.setFontSize(cells, option.fontsize)
  }
}