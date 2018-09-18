import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'

const root = document.createElement('div')
document.body.appendChild(root)

render(<Root />, root)
