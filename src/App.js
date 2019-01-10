import React, { Component } from 'react';
import './App.css';
import Dropdown from './components/Dropdown.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Dropdown />         
        </header>
      </div>
    );
  }
}

export default App;
