import React from 'react'
import ReactDOM from 'react-dom'
import ReactTable from 'react-table'
import faker from 'faker/locale/es_MX'
// import "react-table/react-table.css";

import {Formulario} from './components/Formulario'
import {ListaClientes} from './components/ListaClientes'

class App extends React.Component {

  constructor(props){
    super(props);
    this.agregarCliente = this.agregarCliente.bind(this);

    var fakerArray = [];
    for (var i = 0; i < 100; i++) {
      fakerArray.push({
        nombre: faker.name.firstName(),
        edad: Math.floor(Math.random() * 70) + 18,[]
        direccion: faker.address.streetAddress(),
        correo: faker.internet.email()
      });
    }

    this.state = {
      clientes: fakerArray
    }

  }

  agregarCliente(cliente){
    //console.log(event);
    // event.preventDefault();
    //
    // const {target} = event;
    //
    // var cliente = {
    //   nombre: target.Nombre.value,
    //   edad: target.Edad.value,
    //   direccion: target.Direccion.value,
    //   correo: target.Correo.value
    // }


    this.setState(
      (prevState) => ({
        clientes: prevState.clientes.concat(cliente)
      })
    )

  }

  render(){

    return (
      <div>
        <Formulario agregarCliente={this.agregarCliente}/>
        {/* <ListaClientes clientes={this.state.clientes}/> */}
        <ReactTable
          data={this.state.clientes}
          filterable={true}
          columns={[
            {
              Header: "Nombre",
              accessor: "nombre"
            },{
              Header: "Edad",
              accessor: "edad"
            },{
              Header: "Direccion",
              accessor: "direccion"
            },{
              Header: "Correo",
              accessor: "correo"
            }
          ]}
        />
      </div>
    )
  }

}


ReactDOM.render(<App/>, document.getElementById('app'))
