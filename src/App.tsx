import HandTracker from './components/HandTracker'

function App() {
  return (
    <div className="dashboard-container">
      <div>
        <h1>EchoSign</h1>
        <p>Smart Home Prototype</p>
      </div>
      
      <HandTracker />
    </div>
  )
}

export default App
