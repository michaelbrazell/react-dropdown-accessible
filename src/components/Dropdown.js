import React, { Component } from 'react';
import BaseDropdown from './BaseDropdown.js'
import DropdownCSS from './BaseDropdown.css'

const options = [
  'Jim', 'Bob', 'Cooter'
]

class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: ''
    }
    this._onSelect = this._onSelect.bind(this)
  }

  _onSelect (option) {
    console.log('You selected ', option.label)
    this.setState({selected: option})
  }

  render() {
    const defaultOption = this.state.selected
    const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label
    return (
      <div className="dropdown">
        <BaseDropdown 
          options={options} 
          onChange={this._onSelect} 
          value={defaultOption} 
          placeholder="Select an option" />
        
      </div>
    );
  }
}

export default Dropdown;
