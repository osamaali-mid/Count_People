import React, { useState } from 'react'
import { Upload, BarChart3, Video, Users } from 'lucide-react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import VideoAnalysis from './components/VideoAnalysis'
import DataVisualization from './components/DataVisualization'
import { AnalysisData } from './types'

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'analysis' | 'visualization'>('upload')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleFileUpload = (file: File, metadata: any) => {
    setVideoFile(file)
    setCurrentView('analysis')
    
    // Simulate analysis data for demo
    const mockData: AnalysisData = {
      frames: [
        { time: 0, count: 1, annotations: [{ class: 'person', bounding_box: { xmin: 0.46, ymin: 0.27, xmax: 0.63, ymax: 0.99 } }] },
        { time: 5, count: 2, annotations: [{ class: 'person', bounding_box: { xmin: 0.37, ymin: 0.23, xmax: 0.63, ymax: 1.0 } }] },
        { time: 10, count: 1, annotations: [{ class: 'person', bounding_box: { xmin: 0.41, ymin: 0.19, xmax: 0.70, ymax: 1.0 } }] },
        { time: 15, count: 3, annotations: [{ class: 'person', bounding_box: { xmin: 0.76, ymin: 0.40, xmax: 0.79, ymax: 0.53 } }] },
        { time: 20, count: 2, annotations: [{ class: 'person', bounding_box: { xmin: 0.45, ymin: 0.25, xmax: 0.65, ymax: 0.95 } }] },
        { time: 25, count: 4, annotations: [{ class: 'person', bounding_box: { xmin: 0.30, ymin: 0.20, xmax: 0.70, ymax: 1.0 } }] },
        { time: 30, count: 1, annotations: [{ class: 'person', bounding_box: { xmin: 0.50, ymin: 0.30, xmax: 0.75, ymax: 0.90 } }] },
      ],
      videoShape: { width: 426, height: 240 },
      metadata
    }
    
    setAnalysisData(mockData)
  }

  const handleAnalysisComplete = (data: AnalysisData) => {
    setAnalysisData(data)
    setCurrentView('visualization')
  }

  const handleBackToUpload = () => {
    setCurrentView('upload')
    setAnalysisData(null)
    setVideoFile(null)
  }

  const handleViewVisualization = () => {
    setCurrentView('visualization')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setCurrentView('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                currentView === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              <Upload size={18} />
              <span>Upload</span>
            </button>
            <button
              onClick={() => videoFile && setCurrentView('analysis')}
              disabled={!videoFile}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                currentView === 'analysis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : videoFile
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Video size={18} />
              <span>Analysis</span>
            </button>
            <button
              onClick={() => analysisData && setCurrentView('visualization')}
              disabled={!analysisData}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                currentView === 'visualization'
                  ? 'bg-blue-600 text-white shadow-md'
                  : analysisData
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <BarChart3 size={18} />
              <span>Visualization</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {currentView === 'upload' && (
            <FileUpload onFileUpload={handleFileUpload} />
          )}
          
          {currentView === 'analysis' && videoFile && (
            <VideoAnalysis
              videoFile={videoFile}
              onAnalysisComplete={handleAnalysisComplete}
              onBack={handleBackToUpload}
              onViewVisualization={handleViewVisualization}
              analysisData={analysisData}
            />
          )}
          
          {currentView === 'visualization' && analysisData && (
            <DataVisualization
              data={analysisData}
              videoFile={videoFile}
              onBack={() => setCurrentView('analysis')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App