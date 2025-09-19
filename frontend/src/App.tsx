import React from 'react';
import Beams from './components/Beams';
import LoginBox from './components/LoginBox';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Beams
        beamWidth={0.1}
        beamHeight={25}
        beamNumber={200}
        lightColor="#022AFF"
        speed={2}
        noiseIntensity={1.75}
        scale={0.5}
        rotation={55}
      />
      <LoginBox />
    </div>
  );
}

export default App;
