import React from 'react';

// We type the style objects as 'React.CSSProperties'
// This gives you great autocomplete and type-checking in your IDE.
const headerStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: 'white',
  padding: '1rem',
  width: '100%',
  boxSizing: 'border-box', 
  textAlign: 'left',
  borderBottom: '1px solid #333'
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
};

// We type the component itself as a 'React.FC' (Functional Component)
const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <div style={logoStyle}>
        This is a bachelor project made by Nicolai and Jonas from Aarhus University in winter of 2025-2026
      </div>
      {/* You can add navigation links here */}
    </header>
  );
}

export default Header;