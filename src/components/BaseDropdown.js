import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const DEFAULT_PLACEHOLDER_STRING = 'Select...'

class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: this.parseValue(props.value, props.options) || {
        label: typeof props.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : props.placeholder,
        value: '',
      },
      isOpen: false
    }
    this.mounted = true
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value) {
      var selected = this.parseValue(newProps.value, newProps.options)
      if (selected !== this.state.selected) {
        this.setState({selected: selected})
      }
    } else {
      this.setState({selected: {
        label: typeof newProps.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : newProps.placeholder,
        value: ''
      }})
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
    document.addEventListener('touchend', this.handleDocumentClick, false)
  }

  componentWillUnmount () {
    this.mounted = false
    document.removeEventListener('click', this.handleDocumentClick, false)
    document.removeEventListener('touchend', this.handleDocumentClick, false)
  }

  handleMouseDown (event) {
    if (this.props.onFocus && typeof this.props.onFocus === 'function') {
      this.props.onFocus(this.state.isOpen)
    }
    if (event.type === 'mousedown' && event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.disabled) {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  handleMenuKeyDown (event) {
    // 40 = Arrowdown, 13 = Enter, 32 = spacebar
    if (event.which === 40 || event.which === 13 || event.which === 32 ) {
      this.setState({
        isOpen: !this.state.isOpen
      })

      event.preventDefault()
      return false
    } else if (event.which === 27) {
      this.setState({
        isOpen: false
      })
    }
  }

  handleOptionKeyDown (value, label, event) { 
    let options = this.props.options
    // 13 = Enter; 40 = down; 38 = up
    if (event.which === 13) {
      this.setValue(value, label)

      event.preventDefault()
      return false
    } else if (event.which === 40) {
      options.map(function(option, index, array) {
        if (value === option) {
          this.setFocus(array[index+1], array[index+1])
        }
      }, this)
      event.preventDefault()
    } else if (event.which === 38) {
      options.map(function(option, index, array) {
        if (value === option) {
          // console.log(option, index, array[index-1])
          this.setValue(array[index-1], array[index-1])
        }
      }, this)
      event.preventDefault()
    } else if (event.which === 27) {
      this.setState({
        isOpen: false
      })
      event.preventDefault()
    }
  }

  parseValue (value, options) {
    let option

    if (typeof value === 'string') {
      for (var i = 0, num = options.length; i < num; i++) {
        if (options[i].type === 'group') {
          const match = options[i].items.filter(item => item.value === value)
          if (match.length) {
            option = match[0]
          }
        } else if (typeof options[i].value !== 'undefined' && options[i].value === value) {
          option = options[i]
        }
      }
    }

    return option || value
  }

  setFocus (value, label) {
    // This is the same as setValue for now
    // But it keeps the menu open, need to shift
    let newState = {
      selected: {
        value,
        label},
      isOpen: true
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  setValue (value, label) {
    let newState = {
      selected: {
        value,
        label},
      isOpen: false
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  fireChangeEvent (newState) {
    if (newState.selected !== this.state.selected && this.props.onChange) {
      this.props.onChange(newState.selected)
    }
  }

  renderOption (option) {
    let value = option.value
    if (typeof value === 'undefined') {
      value = option.label || option
    }
    let label = option.label || option.value || option
    let isSelected = value === this.state.selected.value || value === this.state.selected
    
    const classes = {
      [`${this.props.baseClassName}-option`]: true,
      [option.className]: !!option.className,
      'is-selected': isSelected
    }

    const optionClass = classNames(classes)

    return (
      <div
        key={value}
        className={optionClass}
        onMouseDown={this.setValue.bind(this, value, label)}
        onClick={this.setValue.bind(this, value, label)}
        onKeyDown={this.handleOptionKeyDown.bind(this, value, label)}
        role='option'
        aria-selected={isSelected ? 'true' : 'false'}
        tabIndex="0"
        >
        {label}
      </div>
    )
  }

  buildMenu () {
    let { options, baseClassName } = this.props
    let ops = options.map((option) => {
      if (option.type === 'group') {
        let groupTitle = (<div className={`${baseClassName}-title`}>
          {option.name}
        </div>)
        let _options = option.items.map((item) => this.renderOption(item))

        return (
          <div className={`${baseClassName}-group`} key={option.name} role='listbox' tabindex='-1'>
            {groupTitle}
            {_options}
          </div>
        )
      } else {
        return this.renderOption(option)
      }
    })

    return ops.length ? ops : <div className={`${baseClassName}-noresults`}>
                                No options found
    </div>
  }

  handleDocumentClick (event) {
    if (this.mounted) {
      if (!ReactDOM.findDOMNode(this).contains(event.target)) {
        if (this.state.isOpen) {
          this.setState({ isOpen: false })
        }
      }
    }
  }

  isValueSelected () {
    return typeof this.state.selected === 'string' || this.state.selected.value !== ''
  }

  render () {
    const { baseClassName, controlClassName, placeholderClassName, menuClassName, arrowClassName, arrowClosed, arrowOpen, className } = this.props

    const disabledClass = this.props.disabled ? 'Dropdown-disabled' : ''
    const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label

    const dropdownClass = classNames({
      [`${baseClassName}-root`]: true,
      [className]: !!className,
      'is-open': this.state.isOpen
    })
    const controlClass = classNames({
      [`${baseClassName}-control`]: true,
      [controlClassName]: !!controlClassName,
      [disabledClass]: !!disabledClass
    })
    const placeholderClass = classNames({
      [`${baseClassName}-placeholder`]: true,
      [placeholderClassName]: !!placeholderClassName,
      'is-selected': this.isValueSelected()
    })
    const menuClass = classNames({
      [`${baseClassName}-menu`]: true,
      [menuClassName]: !!menuClassName
    })
    const arrowClass = classNames({
      [`${baseClassName}-arrow`]: true,
      [arrowClassName]: !!arrowClassName
    })

    const value = (<div className={placeholderClass}>
      {placeHolderValue}
    </div>)
    const menu = this.state.isOpen ? <div className={menuClass} aria-expanded='true'>
      {this.buildMenu()}
    </div> : null

    return (
      <div className={dropdownClass}>
        <div className={controlClass} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)} onKeyDown={this.handleMenuKeyDown.bind(this)} aria-haspopup='listbox' tabIndex="0">
          {value}
          <div className={`${baseClassName}-arrow-wrapper`}>
            {arrowOpen && arrowClosed
              ? this.state.isOpen ? arrowOpen : arrowClosed
              : <span className={arrowClass} />}
          </div>
        </div>
        {menu}
      </div>
    )
  }
}

Dropdown.defaultProps = { baseClassName: 'Dropdown' }
export default Dropdown