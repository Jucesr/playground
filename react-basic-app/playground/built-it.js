class VisibilityToogle extends React.Component {
  constructor(props){
    super(props);
    this.handleToogle = this.handleToogle.bind(this);
    this.state = {
      visibility : true
    };
  }

  handleToogle(){
    this.setState( (prevState) => {
      return {
        visibility: !prevState.visibility
      }
    } );
  }

  render(){
    return (
      <div>
        <h1>Visibility Toogle</h1>
        <button onClick={this.handleToogle}> {this.state.visibility ? 'Hide Details' : 'Show Details'}</button>
        <p>{this.state.visibility ? this.props.toogleText : undefined}</p>
      </div>
    );
  }
}

ReactDOM.render(<VisibilityToogle toogleText="Eat it"/>, document.getElementById('app'));
