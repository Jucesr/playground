import React from 'react';
import AddOption from './AddOption';
import Options from './Options.js'
import Header from './Header';
import Action from './Action';
import OptionModal from './OptionModal';

export default class IndesicionApp extends React.Component {
  state = {
    options: [],
    selectedOption: undefined
  }

  handleDeleteOptions = () => {
    this.setState(() => ({
      options: []
    }));
  }

  handleDeleteOption = (option) => {
    this.setState( (prevState) => ({
      options: prevState.options.filter( (opt) => opt!==option )
    }));
  }

  handlePick = () => {
    const randomNum = Math.floor(Math.random() * this.state.options.length);
    const option = this.state.options[randomNum];
    this.setState( () => ({
      selectedOption: option
    }));
  }

  handleCloseModal = () => {
    this.setState( () => ({
      selectedOption: undefined
    }) );
  }

  handleAddOption = (option) => {
    if(!option){
      return 'Enter a valid value to add item';
    } else if(this.state.options.indexOf(option) > -1){
      return 'This option already exists';
    }

    this.setState( (prevState) => ({
      options: prevState.options.concat(option)
    }));

  }

  componentDidMount(){
    try {
      const json = localStorage.getItem('options');
      const options = JSON.parse(json);

      if(options)
        this.setState( () => ({options}) );
    } catch (e) {
      console.log('Invalid data');
    }


  }

  componentDidUpdate(prevPros, prevState){
    if( prevState.options.length != this.state.options.length ){
      const json = JSON.stringify(this.state.options);
      localStorage.setItem('options', json);
    }
  }

  render(){
    const title = "Indecision App";
    const subtitle = "Put your life in hands of a computer";


    return (
      <div>
        <Header title={title} subtitle={subtitle} />
        <div className="container">
          <Action
            hasOptions = {this.state.options.length > 0}
            handlePick = {this.handlePick}
          />
          <div className="widget">
            <Options
              options={this.state.options}
              handleDeleteOptions={this.handleDeleteOptions}
              handleDeleteOption={this.handleDeleteOption}
            />
            <AddOption
              handleAddOption={this.handleAddOption}
            />
          </div>

        <OptionModal
          selectedOption={this.state.selectedOption}
          handleCloseModal={this.handleCloseModal}
        />
        </div>
      </div>
    );
  }
}
