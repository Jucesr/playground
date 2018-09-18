import React from 'react';
import {List} from './List';

export default class WrapperList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      current_items: this.props.items,
      item_count: 3
    }
  }

  newItem = () => {
    this.setState((prevState) => ({
      current_items: prevState.current_items.concat({
        id: prevState.item_count + 1,
        name: `Item ${prevState.item_count + 1}`,
        width: '100'
      }),
      item_count: prevState.item_count + 1
    }));
  }

  changeColumn = () => {
    this.setState((prevState) => ({
      current_items: prevState.current_items.map( item => {
        if(item.name == 'Ericka'){
          item.width = '300';
        }

        return item;
      })
    }));
  }

  render(){

    let {items} = this.props;

    return (
      <div>
        <List items={this.state.current_items} />
        <button onClick={this.newItem}>Add</button>
        <button onClick={this.changeColumn}>Change</button>
      </div>

    );
  }
}
