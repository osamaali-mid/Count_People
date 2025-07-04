import React, { useState, useEffect } from 'react'
import { Play, Pause, BarChart3, ArrowLeft, CheckCircle, Loader } from 'lucide-react'
import { AnalysisData } from '../types'

interface VideoAnalysisProps {
  videoFile: File
  onAnalysisComplete: (data: AnalysisData) => void
  onBack: () => void
  onViewVisualization: () => void
  analysisData: AnalysisData | null
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({
  videoFile,
  onAnalysisComplete,
  onBack,
  onViewVisualization,
  analysisData
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const url = URL.createObjectURL(videoFile)
    setVideoUrl(url)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [videoFile])

  useEffect(() => {
    if (!analysisData && !isAnalyzing) {
      startAnalysis()
    }
  }, [analysisData, isAnalyzing])

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setCurrentTime(video.currentTime)
  }

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setDuration(video.duration)
  }

  const togglePlayPause = () => {
    const video = document.getElementById('analysis-video') as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = document.getElementById('analysis-video') as HTMLVideoElement
    const seekBar = e.currentTarget
    const rect = seekBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    if (video) {
      video.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCurrentPeopleCount = () => {
    if (!analysisData) return 0
    
    const currentFrame = analysisData.frames.find(frame => 
      Math.abs(frame.time - currentTime) < 2.5
    )
    
    return currentFrame?.count || 0
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Upload</span>
        </button>
        
        {analysisData && (
          <button
            onClick={onViewVisualization}
            className="btn-primary flex items-center space-x-2"
          >
            <BarChart3 size={18} />
            <span>View Visualization</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Video Analysis</h2>
            
            <div className="video-container">
              <video
                id="analysis-video"
                src={videoUrl}
                className="w-full h-auto"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={false}
              />
              
              {/* Custom Controls */}
              <div className="video-controls">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-blue-300 transition-colors"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  
                  <div className="flex-1">
                    <div
                      className="custom-seekbar"
                      onClick={handleSeek}
                    >
                      <div
                        className="custom-seekbar-progress"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Detection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{getCurrentPeopleCount()}</div>
                <div className="text-sm text-gray-600">People Detected</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analysisData ? Math.max(...analysisData.frames.map(f => f.count)) : 0}
                </div>
                <div className="text-sm text-gray-600">Peak Count</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Status */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Status</h3>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Loader className="animate-spin text-blue-600" size={20} />
                  <span className="text-gray-700">Analyzing video...</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-blue-600">{analysisProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Processing frames and detecting people...
                </div>
              </div>
            ) : analysisData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">Analysis Complete</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Frames</span>
                    <span className="font-medium">{analysisData.frames.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Count</span>
                    <span className="font-medium">
                      {(analysisData.frames.reduce((sum, f) => sum + f.count, 0) / analysisData.frames.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak Count</span>
                    <span className="font-medium">{Math.max(...analysisData.frames.map(f => f.count))}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* File Info */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File Name</span>
                <span className="font-medium truncate ml-2">{videoFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File Size</span>
                <span className="font-medium">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">{videoFile.type}</span>
              </div>
              {analysisData?.metadata && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room</span>
                    <span className="font-medium">{analysisData.metadata.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{analysisData.metadata.date}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoAnalysis