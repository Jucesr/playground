import React from 'react'
import PokemonStats from './PokemonStats'
import './PokemonCard.css'

class PokemonCard extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      x: 0,
      y: 0,
      show_stats: false
    }
  }

  render(){
    const {name, picture, stats} = this.props;
    return (
      <div
        className="PokemonCard"
        onMouseLeave={() => {
          this.setState((prevState) => ({
            show_stats: false
          }))
        }}
        onMouseEnter={e => {
          let x = e.pageX
          let y = e.pageY
          this.setState((prevState) => ({
            show_stats: true,
            x,
            y
          }))

        }}
      >
        <div><h2>{name}</h2></div>
        <div>
          <img src={picture}></img>
        </div>

        {this.state.show_stats &&
          <PokemonStats
            x={this.state.x}
            y={this.state.y}
            stats={stats}
          />}
      </div>
    )
  };
}

export default PokemonCard
