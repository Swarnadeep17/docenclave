import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist/webpack'

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const PDFPageRenderer = ({ pdfDoc, pageNumber, width = 80, height = 112 }) => {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return

      try {
        setLoading(true)
        setError(false)

        const page = await pdfDoc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1 })
        
        // Calculate scale to fit within desired dimensions
        const scaleX = width / viewport.width
        const scaleY = height / viewport.height
        const scale = Math.min(scaleX, scaleY)
        
        const scaledViewport = page.getViewport({ scale })
        
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.height = scaledViewport.height
        canvas.width = scaledViewport.width

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        }

        await page.render(renderContext).promise
        setLoading(false)
      } catch (err) {
        console.error('Error rendering PDF page:', err)
        setError(true)
        setLoading(false)
      }
    }

    renderPage()
  }, [pdfDoc, pageNumber, width, height])

  if (error) {
    return (
      <div className="w-20 h-28 bg-white rounded border flex items-center justify-center">
        <div className="text-gray-400 text-xs text-center">
          <div className="text-lg mb-1">⚠️</div>
          <div>Error</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-20 h-28">
      <canvas 
        ref={canvasRef}
        className="w-full h-full bg-white rounded border"
        style={{ display: loading ? 'none' : 'block' }}
      />
      {loading && (
        <div className="absolute inset-0 bg-white rounded border flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            <div className="animate-spin text-lg mb-1">⌛</div>
            <div>Loading</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFPageRenderer