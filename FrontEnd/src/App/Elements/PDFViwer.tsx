import  React from 'react'
import { useModal } from '../hook'

interface PdfViewerOptions {
  path: string,
  genpdf?: () => void
}
export const PdfViewer = React.memo((props: PdfViewerOptions) => {
  const { path, genpdf } = props
  const { BlockUserInteraction, close, warn } = useModal()
  const [pdf_rendered, set_pdf_rendered]  = React.useState(false)
  const [rendering, setRendering]         = React.useState(true)
  let timeout_duration = 30
  let timeout: ReturnType<typeof setTimeout>;

  React.useEffect(() => { 
    if(genpdf){ 
      setRendering(true)
      BlockUserInteraction("Caculating PDF", "Caculating")
      genpdf() 
    }
  },[genpdf])

  React.useEffect(() => { 
    if(path != ''){
      if(pdf_rendered){
        setRendering(false)
        clearTimeout(timeout)
      } else {
        setRendering(true)
        timeout = setTimeout(() => { 
          setRendering(false)
          warn(`Render PDF timeout reached ${timeout_duration} seconds`)
        }, timeout_duration * 1000)
        BlockUserInteraction("Rendering PDF", "Rendering")
      }
    } else { setRendering(true) }
    return () => clearTimeout(timeout)
  }, [path, pdf_rendered])

  function pdf_loaded(){
    close()
    set_pdf_rendered(true)
    setRendering(false)
  }

  return path != '' 
    ? <object 
      onLoad={pdf_loaded} 
      data={`/${path}`} 
      type="application/pdf" width="100%" height="100%"/> 
    : <div className="flex flex1 center">{ rendering ? 'Rendering' : 'Failed to render PDF'}</div>
})