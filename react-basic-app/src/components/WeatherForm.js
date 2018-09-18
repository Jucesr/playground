import React, { Component } from 'react';

export class WeatherForm extends Component {

  constructor(props) {
      super(props);
      this.state = {
          lat: 0,
          long: 0,
      }
      this.onChangeLat = this.onChangeLat.bind(this);
      this.onChangeLong = this.onChangeLong.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeLat = (e) => {

      let value = e.target.value;
      if(!isNaN(value) ){
        this.setState({
            lat: e.target.value
        });
      }
  }

  onChangeLong = (e) => {
    let value = e.target.value;
    if(!isNaN(value) ){
      this.setState({
          long: e.target.value
      });
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    if (this.state.lat.length == 0 || this.state.long.length == 0) {
        alert("You must enter something");
    }else{
      this.props.onSubmit(this.state.lat, this.state.long)
    }

  }

  render() {
      return(
          <div>
              <h1>Welcome to the Weather App!</h1>
              <form onSubmit={this.onSubmit}>
                  Enter the Latitude in decimal format: <input type="text" name="lat" value={this.state.lat} onChange={this.onChangeLat}/>
                  <br/>
                  Enter the Longitude in decimal format: <input type="text" name="long" value={this.state.long} onChange={this.onChangeLong}/>
                  <br/>
                  <button >Submit</button>
              </form>
          </div>
      )
  }
}
