import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import GamePageComponent from './page/gamePage/GamePage';
import HomeComponent from './page/mainPage/MainPage';
import { ThemeProvider } from '@material-ui/core/styles';

const theme = {};
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/game/:id" element={<GamePageComponent />} />
          </Routes>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
