import React from 'react';
import Beams from './components/Beams';
import LoginBox from './components/LoginBox';
import Header from './components/Header';
import './App.css';


const App: React.FC = () => {

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw'
    }}>
      
      <Header />
      
      <main style={{
        flex: 1,
        position: 'relative', // This is the container for all floating elements
        width: '100%'
      }}>
        
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
        
        {/* Page title */}
        <h1 className={"page-title"}>
          Welcome to Aarhus university's project management system
        </h1>
        
        <LoginBox />

      </main>
      
    </div>
  );
}

export default App;