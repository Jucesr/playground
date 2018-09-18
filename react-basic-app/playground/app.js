class IndesicionApp extends React.Component {
  constructor(props){
    super(props);
    this.handleDeleteOptions = this.handleDeleteOptions.bind(this);
    this.handlePick = this.handlePick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleDeleteOption = this.handleDeleteOption.bind(this);
    this.state = {
      options: []
    }
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

  handleDeleteOptions(){
    this.setState(() => ({
      options: []
    }));
  }

  handleDeleteOption(option){
    this.setState( (prevState) => ({
      options: prevState.options.filter( (opt) => opt!==option )
    }));
  }

  handlePick(){
    const randomNum = Math.floor(Math.random() * this.state.options.length);
    const option = this.state.options[randomNum];
    alert(option);
  }

  handleAddOption(option){
    if(!option){
      return 'Enter a valid value to add item';
    } else if(this.state.options.indexOf(option) > -1){
      return 'This option already exists';
    }

    this.setState( (prevState) => ({
      options: prevState.options.concat(option)
    }));

  }

  render(){
    const title = "Indecision App";
    const subtitle = "Put your life in hands of a computer";


    return (
      <div>
        <Header title={title} subtitle={subtitle} />
        <Action
          hasOptions = {this.state.options.length > 0}
          handlePick = {this.handlePick}
        />
        <Options
          options={this.state.options}
          handleDeleteOptions={this.handleDeleteOptions}
          handleDeleteOption={this.handleDeleteOption}
        />
        <AddOption
          handleAddOption={this.handleAddOption}
        />
      </div>
    );
  }
}

const Header = (props) => {
  return (
    <div>
      <h1> {props.title} </h1>
      <h2> {props.subtitle} </h2>
    </div>
  );
}

const Action = (props) =>{
  return (
    <div>
      <button
        onClick={props.handlePick}
        disabled={!props.hasOptions}
      >
        What should I do?
      </button>
    </div>
  );
};

const Options = (props) =>{
  return (
    <div>
      <button onClick={props.handleDeleteOptions}>Remove all</button>
      {props.options.length == 0 && <p>Please add an option to get started</p>}
      {
        props.options.map( (opt) =>{
          return <Option
                    key={opt}
                    text={opt}
                    handleDeleteOption={props.handleDeleteOption}
                  />
        } )
      }
    </div>
  );
}

const Option = (props) =>{
  const textOption = props.text;
  return (
    <div>
      {textOption}
      <button
        onClick={(e) => {
          props.handleDeleteOption(textOption)
        }}
      >
        Remove
      </button>
    </div>
  );
}

class AddOption extends React.Component {
  constructor(props){
    super(props);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.state = {
      error: undefined
    }
  }

  handleAddOption(e){
    e.preventDefault();
    const option = e.target.elements.option.value.trim();
    const error = this.props.handleAddOption(option);

    this.setState( () => ({error}));

    if(!error){
      e.target.elements.option.value = '';
    }

  }

  render(){
    return (
      <div>
        {this.state.error && <p>{this.state.error}</p>}
        <form onSubmit={this.handleAddOption}>
          <input type="text" name="option"/>
          <button> Add Option</button>
        </form>
      </div>
    );
  }
}

ReactDOM.render(<IndesicionApp />, document.getElementById('app'));
