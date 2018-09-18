import React from 'react'
import ReactDOM from 'react-dom'
import ReactTable from 'react-table'

class App extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      loading: false,
      proyectos: [],
      columnas: [
        {
          Header: 'ID',
          accessor: 'PSPNR'
        },{
          Header: 'Proyecto',
          accessor: 'PSPID'
        },{
          Header: 'Descripción',
          accessor: 'POST1'
        },{
          Header: 'Presupuesto base MXN',
          accessor: 'PPTOBASEMXN'
        },{
          Header: 'Presupuesto base USD',
          accessor: 'PPTOBASEUSD'
        }
      ]
    }

  }
  onBuscar(e){
    e.preventDefault()

    this.setState({
      loading: true
    })

    let proyectos = e.target.proyectos.value
    let host = `http://107.170.241.12/codeIgniter/index.php/welcome?format=json&divisiones=MXL1&proyectos=${proyectos}`
    // let host = "http://107.170.241.12/codeIgniter/index.php/welcome?format=json&proyectos=" + proyectos

    let username = 'chikorita';
    let password = '123456789';

    fetch(host).then(
      (response) => {
        console.log(response);
        return response.json()
      }
    ).then(
      items => {
        console.log(items);
        this.setState({
          proyectos: items,
          loading: false
        })
      }
    ).catch(e => {
      alert('Error: proyecto no encontrado')
      this.setState({
        loading: false
      })
    })

  }

  render(){

    return (
      <div>
        <form
          className="form"
          onSubmit={this.onBuscar.bind(this)}
        >
          <label>Ingresa proyectos</label>
          <input name="proyectos" type="text"/>
          <button>Buscar</button>
        </form>
        <ReactTable
          data={this.state.proyectos}
          columns={this.state.columnas}
          loading={this.state.loading}

          getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {

                let proyectos = rowInfo.original.PSPID.substring(0, 7);

                let host = `http://107.170.241.12/codeIgniter/index.php/welcome?format=json&detalle=1&proyectos=${proyectos}`

                console.log(host);

                fetch(host).then(
                  (response) => {
                    return response.json()
                  }
                ).then(
                  items => {
                    this.setState({
                      proyectos: items,
                      loading: false
                    })
                  }
                ).catch(e => {
                  alert('Error: proyecto no encontrado')
                  this.setState({
                    loading: false
                  })
                })

                if (handleOriginal) {
                  handleOriginal();
                }
              }
            };
          }}
        />
      </div>
    )
  }

}


ReactDOM.render(<App/>, document.getElementById('app'))
