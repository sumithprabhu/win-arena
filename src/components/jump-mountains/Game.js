import React, { useEffect } from 'react';
import './style.css';

function App() {
  useEffect(() => {
    // Dynamically load script.js
    const script = document.createElement('script');
    script.src = '/script.js'; // Path from public folder
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ width: '375px', margin: '0 auto' }}>
      <div className="container">
        <div id="score"></div>
        <canvas id="game" width="375" height="375"></canvas>
        <div id="introduction">Hold down the mouse to stretch out a stick</div>
        <div id="perfect">DOUBLE SCORE</div>
        <button id="restart">RESTART</button>
      </div>

      
    </div>
  );
}

export default App;