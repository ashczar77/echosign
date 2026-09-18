import React, { useState } from 'react'
import HandTracker from './components/HandTracker'

function App() {
  const [currentSign, setCurrentSign] = useState<string>('Waiting for sign...');

  const handleGesture = (gesture: string) => {
    if (gesture !== 'None') {
      setCurrentSign(gesture);
    }
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'center' }}>
      <div>
        <h1>EchoSign</h1>
        <p>Sign-to-Speech Fire TV App</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
        <HandTracker onGesture={handleGesture} />
        
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ffcc' }}>
          {currentSign}
        </div>
      </div>
    </div>
  )
}

export default App
