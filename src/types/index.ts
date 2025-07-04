export interface BoundingBox {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export interface Annotation {
  class: string
  bounding_box: BoundingBox
}

export interface Frame {
  time: number
  count: number
  annotations: Annotation[]
}

export interface VideoShape {
  width: number
  height: number
}

export interface AnalysisData {
  frames: Frame[]
  videoShape: VideoShape
  metadata?: {
    date: string
    startTime: string
    endTime: string
    roomName: string
    fileName: string
  }
}

export interface UploadMetadata {
  date: string
  startTime: string
  endTime: string
  roomName: string
}