import React, { Component } from 'react';
import { WeatherForm } from './WeatherForm';
import { WeatherCard } from './WeatherCard';

export class WeatherApp extends Component {
    constructor(props) {
      super(props);
        this.state = {
            lat: 0,
            long: 0,
        }
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit = (lat, long) => {
        this.setState({
          lat,
          long
        });
    }


    render() {
        return(
          <div>
            <WeatherForm onSubmit={this.onSubmit}/>
            <WeatherCard lat={this.state.lat} long={this.state.long}/>
          </div>

        )
    }
}
