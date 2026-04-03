import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [simProgress, setSimProgress] = useState({ current: 0, total: 20 });
  
  // Upload states
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const simulationInterval = useRef(null);
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Add log entry
  const addLog = (type, message, prediction = null, confidence = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: Date.now(),
      time: timestamp,
      type: type,
      message: message,
      prediction: prediction,
      confidence: confidence
    }, ...prev].slice(0, 100));
  };

  // Fetch next image from backend
  const fetchNextImage = async () => {
    try {
      const response = await fetch('http://localhost:8000/simulate/next');
      const data = await response.json();
      
      if (data.error) {
        addLog('ERROR', data.error, null);
        return null;
      }
      
      return data;
    } catch (error) {
      addLog('ERROR', 'Failed to connect to backend', null);
      return null;
    }
  };

  // Process one simulation step
  const processSimulationStep = async () => {
    const result = await fetchNextImage();
    
    if (result) {
      setCurrentImage(`http://localhost:8000${result.image_url}`);
      setCurrentPrediction(result.prediction);
      setCurrentConfidence(result.confidence);
      setSimProgress({ current: result.index, total: result.total });
      
      const confidencePercent = Math.round(result.confidence * 100);
      addLog(
        result.prediction.toUpperCase(),
        `${result.filename} → ${result.prediction.toUpperCase()} (${confidencePercent}%)`,
        result.prediction,
        result.confidence
      );
    }
  };

  // Start simulation (infinite loop)
  const startSimulation = async () => {
    if (simulationInterval.current) return;
    
    setIsSimulating(true);
    addLog('INFO', 'Simulation started - infinite loop mode', null);
    
    // Process first image immediately
    await processSimulationStep();
    
    // Set interval for subsequent images
    simulationInterval.current = setInterval(async () => {
      await processSimulationStep();
    }, 1500);
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulating(false);
    addLog('INFO', 'Simulation stopped', null);
  };

  // Reset logs
  const resetLogs = () => {
    setLogs([]);
    setCurrentImage(null);
    setCurrentPrediction(null);
    setCurrentConfidence(0);
    setSimProgress({ current: 0, total: 20 });
    addLog('INFO', 'Logs cleared', null);
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploadPreview(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      setUploadResult(result);
      addLog(
        result.prediction.toUpperCase(),
        `Upload: ${file.name} → ${result.prediction.toUpperCase()} (${Math.round(result.confidence * 100)}%)`,
        result.prediction,
        result.confidence
      );
    } catch (error) {
      addLog('ERROR', `Upload failed: ${file.name}`, null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="main-layout">
        
        {/* LEFT PANEL - IMAGE DISPLAY */}
        <div className="image-panel">
          <div className="panel-header">🎯 CURRENT IMAGE</div>
          <div className="image-container">
            {currentImage ? (
              <>
                <img src={currentImage} alt="Current" className="current-image" />
                <div className={`prediction-overlay ${currentPrediction}`}>
                  {currentPrediction === 'attack' ? '🔴 ATTACK DETECTED' : '🟢 CLEAN'}
                  <span className="confidence">{Math.round(currentConfidence * 100)}%</span>
                </div>
              </>
            ) : (
              <div className="no-image">No image being processed</div>
            )}
          </div>
          
          {/* Simulation Progress */}
          {simProgress.current > 0 && (
            <div className="sim-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(simProgress.current / simProgress.total) * 100}%` }}></div>
              </div>
              <div className="progress-text">Image {simProgress.current} of {simProgress.total}</div>
            </div>
          )}
        </div>
        
        {/* RIGHT PANEL - CONTROLS & UPLOAD */}
        <div className="controls-panel">
          
          {/* Upload Section */}
          <div className="section upload-section">
            <div className="section-title">📤 UPLOAD IMAGE</div>
            <label className="upload-btn">
              CHOOSE FILE
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
            {isUploading && <div className="upload-status">Analyzing...</div>}
            {uploadPreview && (
              <div className="upload-preview">
                <img src={uploadPreview} alt="Preview" />
                {uploadResult && (
                  <div className={`upload-result ${uploadResult.prediction}`}>
                    {uploadResult.prediction === 'attack' ? '🔴 ATTACK' : '🟢 CLEAN'}
                    <span className="upload-confidence">{Math.round(uploadResult.confidence * 100)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Simulation Controls */}
          <div className="section controls-section">
            <div className="section-title">🎮 SIMULATION</div>
            <div className="button-group">
              <button className="btn-start" onClick={startSimulation} disabled={isSimulating}>
                ▶ RUN
              </button>
              <button className="btn-stop" onClick={stopSimulation} disabled={!isSimulating}>
                ⏹ STOP
              </button>
              <button className="btn-reset" onClick={resetLogs}>
                🔄 RESET
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* BOTTOM - TERMINAL LOGS */}
      <div className="logs-panel">
        <div className="logs-header">
          <span>🔻 SIMULATION LOG</span>
          <span className={`sim-status ${isSimulating ? 'running' : 'stopped'}`}>
            {isSimulating ? '🟢 RUNNING' : '⚫ STOPPED'}
          </span>
        </div>
        <div className="logs-body">
          {logs.length === 0 ? (
            <div className="log-entry info"> System ready. Click RUN to start simulation...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type === 'ATTACK' ? 'attack' : log.type === 'CLEAN' ? 'clean' : 'info'}`}>
                <span className="log-time">[{log.time}]</span>
                <span className="log-type">[{log.type}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;