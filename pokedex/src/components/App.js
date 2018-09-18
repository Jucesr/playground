import React from 'react'
import PokemonCard from './PokemonCard'

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      pokemons: [],
      loading: true
    }
  }

  fetchPokemons = (number_of_pokemons_to_fetch) => {

    let list_of_pokemons = []
    for (var i = 1; i < number_of_pokemons_to_fetch + 1; i++) {
      list_of_pokemons.push(Math.floor(Math.random() * 100))
    }
    let proms = list_of_pokemons.map( id => {
      return fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`).then(response => response.json())
    })

    Promise.all(proms).then((values) => {
      this.setState((prevState) => ({
        pokemons: prevState.pokemons.concat(values),
        loading: false
      }))
    });
  }

  componentDidMount = () =>{

    this.fetchPokemons(10)
  }

  render(){

    return (
      <React.Fragment>
      <div className="PokemonList">
        {this.state.loading ? (
          <img src='../assets/loading.gif'></img>
        ): (
          this.state.pokemons.map( (pokemon, index) => <PokemonCard key={index} name={pokemon.name} picture={pokemon.sprites.front_default} stats={pokemon.stats} /> )
        )}

      </div>
      {!this.state.loading  && <button onClick={e => {
        this.setState((prevState) => ({
          loading: true
        }))
        this.fetchPokemons(10);
      }}>Load more!(10)
    </button>}
  </React.Fragment>
    )
  };
}

export default App
