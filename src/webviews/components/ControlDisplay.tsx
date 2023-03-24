import * as React from 'react'
import { useSelector } from 'react-redux'
import { type AppState } from '../../types'

const ControlDisplay = () => {
  const info = useSelector((state: AppState) => ({ ...state.server, ...state.stage }))
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const src = `http://${info.host}:${info.port}/display/#control`
  const handleReload = () => {
    if (iframeRef.current != null) iframeRef.current.src = src
  }
  return (
    <div className="control-display-wrapper">
      <iframe
        style={{ aspectRatio: `${info.width / info.height}` }}
        title="control"
        src={src}
        ref={iframeRef}
        className="control-display"
      />
      <button onClick={handleReload} type="button">reload</button>
    </div>
  )
}

export default ControlDisplay
