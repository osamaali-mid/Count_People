import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { ArrowLeft, Download, Play, Pause } from 'lucide-react'
import { AnalysisData } from '../types'

interface DataVisualizationProps {
  data: AnalysisData
  videoFile: File | null
  onBack: () => void
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, videoFile, onBack }) => {
  const chartRef = useRef<SVGSVGElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [videoFile])

  useEffect(() => {
    if (chartRef.current && data.frames.length > 0) {
      drawChart()
    }
  }, [data])

  const drawChart = () => {
    const svg = d3.select(chartRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data.frames, d => d.time) as [number, number])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.frames, d => d.count) as number])
      .range([height, 0])

    // Line generator
    const line = d3.line<typeof data.frames[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX)

    // Area generator
    const area = d3.area<typeof data.frames[0]>()
      .x(d => xScale(d.time))
      .y0(height)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX)

    // Add gradient
    const gradient = g.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3B82F6')
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3B82F6')
      .attr('stop-opacity', 0.3)

    // Add area
    g.append('path')
      .datum(data.frames)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)

    // Add line
    g.append('path')
      .datum(data.frames)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Add dots
    g.selectAll('.dot')
      .data(data.frames)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.time))
      .attr('cy', d => yScale(d.count))
      .attr('r', 4)
      .attr('fill', '#3B82F6')
      .on('mouseover', function(event, d) {
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0)

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)

        tooltip.html(`Time: ${d.time}s<br/>Count: ${d.count}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove()
      })
      .on('click', function(event, d) {
        if (videoRef.current) {
          videoRef.current.currentTime = d.time
          setCurrentTime(d.time)
        }
      })

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Time (seconds)')

    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -height / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('People Count')

    // Add current time indicator
    const timeIndicator = g.append('line')
      .attr('class', 'time-indicator')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2)
      .attr('y1', 0)
      .attr('y2', height)
      .style('opacity', 0)

    // Update time indicator
    const updateTimeIndicator = (time: number) => {
      timeIndicator
        .attr('x1', xScale(time))
        .attr('x2', xScale(time))
        .style('opacity', 1)
    }

    // Store update function for external use
    ;(svg.node() as any).updateTimeIndicator = updateTimeIndicator
  }

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const time = video.currentTime
    setCurrentTime(time)
    
    // Update chart indicator
    const svg = d3.select(chartRef.current)
    const updateFn = (svg.node() as any)?.updateTimeIndicator
    if (updateFn) {
      updateFn(time)
    }
  }

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setDuration(video.duration)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const downloadData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'people-count-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const getCurrentPeopleCount = () => {
    const currentFrame = data.frames.find(frame => 
      Math.abs(frame.time - currentTime) < 2.5
    )
    return currentFrame?.count || 0
  }

  const averageCount = data.frames.reduce((sum, f) => sum + f.count, 0) / data.frames.length
  const peakCount = Math.max(...data.frames.map(f => f.count))
  const totalDetections = data.frames.reduce((sum, f) => sum + f.annotations.length, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Analysis</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={downloadData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Download Data</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Footfall Analysis
          {data.metadata?.roomName && (
            <span className="text-blue-600"> - {data.metadata.roomName}</span>
          )}
        </h1>
        {data.metadata?.date && (
          <p className="text-gray-600">{data.metadata.date}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{getCurrentPeopleCount()}</div>
          <div className="text-sm text-gray-600">Current Count</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{peakCount}</div>
          <div className="text-sm text-gray-600">Peak Count</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{averageCount.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Average Count</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{totalDetections}</div>
          <div className="text-sm text-gray-600">Total Detections</div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">People Count Over Time</h2>
        <div className="w-full overflow-x-auto">
          <svg ref={chartRef} className="w-full h-auto"></svg>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Click on any point to jump to that time in the video
        </p>
      </div>

      {/* Video Player */}
      {videoFile && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Synchronized Video Playback</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="video-container">
                <video
                  ref={videoRef}
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
                      <div className="custom-seekbar">
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
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Current Frame Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(currentTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Count:</span>
                    <span className="font-medium text-blue-600">{getCurrentPeopleCount()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click chart points to jump to specific times</li>
                  <li>• Red line shows current video position</li>
                  <li>• Use video controls to navigate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataVisualization