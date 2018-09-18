import React from 'react'
class PokemonStats extends React.Component {

  constructor(props){
    super(props);

  }

  render(){
    let props = this.props
    return (
      <div
          style={{
            top: `${props.y}px`,
            left: `${props.x}px`,
            position: 'absolute',
            background: 'rgb(255, 255, 255)',
            border: 'solid 1px rgb(180, 180, 180)',
            outline: 'none',
            zIndex: '5'
          }}
          tabIndex="0"
        >
        <div className="PokemonStats_container">
          <div>Stats</div>
          {props.stats.map((stat, index) => (
            <ul key={index}>
              <li><strong>{`${stat.stat.name}: `}</strong>{`${stat.base_stat}`}</li>
            </ul>
          ))}
        </div>
      </div>
    )
  };
}

export default PokemonStats
