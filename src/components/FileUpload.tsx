import React, { useState, useRef } from 'react'
import { Upload, FileVideo, Calendar, Clock, MapPin, X } from 'lucide-react'
import { UploadMetadata } from '../types'

interface FileUploadProps {
  onFileUpload: (file: File, metadata: UploadMetadata) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<UploadMetadata>({
    date: '',
    startTime: '',
    endTime: '',
    roomName: ''
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file)
    } else {
      alert('Please select a video file')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleMetadataChange = (field: keyof UploadMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Please select a video file')
      return
    }

    if (!metadata.date || !metadata.startTime || !metadata.endTime || !metadata.roomName) {
      alert('Please fill in all metadata fields')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            setIsUploading(false)
            onFileUpload(selectedFile, { ...metadata, fileName: selectedFile.name })
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full inline-block mb-4">
              <Upload className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Video</h2>
            <p className="text-gray-600">Select a video file to analyze people count</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileVideo className="text-blue-600" size={24} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile()
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <FileVideo className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your video here
                  </p>
                  <p className="text-gray-500 mb-4">or click to browse files</p>
                  <div className="text-sm text-gray-400">
                    Supported formats: MP4, AVI, MOV, WMV
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Metadata Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={metadata.date}
                  onChange={(e) => handleMetadataChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  <span>Room Name</span>
                </label>
                <input
                  type="text"
                  value={metadata.roomName}
                  onChange={(e) => handleMetadataChange('roomName', e.target.value)}
                  placeholder="e.g., Conference Room A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} />
                  <span>Start Time</span>
                </label>
                <input
                  type="time"
                  value={metadata.startTime}
                  onChange={(e) => handleMetadataChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} />
                  <span>End Time</span>
                </label>
                <input
                  type="time"
                  value={metadata.endTime}
                  onChange={(e) => handleMetadataChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Processing...' : 'Start Analysis'}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">How it works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Upload Video</h4>
                  <p className="text-gray-600 text-sm">Select your video file and provide metadata</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AI Analysis</h4>
                  <p className="text-gray-600 text-sm">Our AI detects and counts people in each frame</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Visualization</h4>
                  <p className="text-gray-600 text-sm">View interactive charts and synchronized video playback</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time people detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Interactive data visualization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Synchronized video playback</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Detailed analytics reports</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload