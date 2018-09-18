console.log('App.js is running');

// JSX - JavaScript XML

const app = {
  title: 'Desicion APP',
  subtitle: 'This app was made to learn React js',
  options: []
}

function getOptions(options){
  if(options.length > 0)
    return (
      <ol>
        {
          app.options.map( (option) => {
            return <li key={option}>{option}</li>
          })
        }
      </ol>
    );
  return <p>No options</p>
}

const onFormSubmit = (e) => {
  e.preventDefault();
  const option = e.target.elements.option.value;

  if( option ){
    app.options.push(option);
    e.target.elements.option.value = '';
    renderOptions();
  }

};

const removeAllOptions = (e) => {
  app.options = [];
  renderOptions();
};

const onMakeDesicion = () => {
  const randomNum = Math.floor(Math.random() * app.options.length);
  const option = app.options[randomNum];
  alert(option);
};


const user = {
  name: 'Julio',
  age: 23,
  location: 'Mexicali'
};

function getLocation() {
  return 'Unknown'
}

const appRoot = document.getElementById('app');

const renderOptions = () => {
  const template = (
    <div>
      <h1>{app.title}</h1>
      {app.subtitle && <p>{app.subtitle}</p>}
      <button disabled={app.options.length === 0} onClick={onMakeDesicion} >What should I do? </button>
      <button onClick={removeAllOptions} >Remove all</button>
      {app.options && getOptions(app.options)}
      <form onSubmit={onFormSubmit}>
        <input type="text" name="option" />
        <button>Add Option</button>
      </form>
    </div>
  );

  ReactDOM.render(template, appRoot);
};

renderOptions();



















//Just for scrolling
