import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import ARViewer from './pages/ARViewer'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ar" element={<ARViewer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
