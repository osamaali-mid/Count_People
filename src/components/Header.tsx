import React from 'react'
import { Users, BarChart3 } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">People Counter</h1>
              <p className="text-gray-600">Video Analysis & Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BarChart3 size={16} />
            <span>Real-time Analytics</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header