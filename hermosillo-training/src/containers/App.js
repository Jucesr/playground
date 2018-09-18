import React from 'react'
import { hot, setConfig } from 'react-hot-loader'
import '../styles/styles.css'

import intersection from 'lodash/intersection'

const pokemon_types = ['sun', 'another']
const filter = []

console.log(intersection(filter, pokemon_types));


setConfig({ logLevel: 'debug' })

import Formulario from '../components/Formulario'

const App = () => (
  <Formulario/>
)


export default hot(module)(App)
