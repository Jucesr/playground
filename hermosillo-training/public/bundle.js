"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import React from 'react';
// import ReactDOM from 'react-dom';

// -------------------- COMPONENTES --------------------
//Stateless
var Formulario = function Formulario(_ref) {
  var agregarCliente = _ref.agregarCliente;
  return React.createElement(
    "form",
    { onSubmit: agregarCliente },
    React.createElement(
      "h2",
      null,
      "Datos personales"
    ),
    React.createElement(Campo, { etiqueta: "Nombre", tipo: "text" }),
    React.createElement(Campo, { etiqueta: "Edad", tipo: "number" }),
    React.createElement(Campo, { etiqueta: "Direccion", tipo: "text" }),
    React.createElement(Campo, { etiqueta: "Correo", tipo: "text" }),
    React.createElement(
      "button",
      null,
      "Agregar"
    )
  );
};

var Campo = function Campo(_ref2) {
  var etiqueta = _ref2.etiqueta,
      tipo = _ref2.tipo;
  return React.createElement(
    "div",
    null,
    React.createElement(
      "label",
      null,
      etiqueta
    ),
    React.createElement("input", { name: etiqueta, type: tipo })
  );
};

var ListaClientes = function ListaClientes(_ref3) {
  var clientes = _ref3.clientes;
  return React.createElement(
    "table",
    null,
    React.createElement(
      "tbody",
      null,
      React.createElement(
        "tr",
        null,
        React.createElement(
          "th",
          null,
          "Nombre"
        ),
        React.createElement(
          "th",
          null,
          "Edad"
        ),
        React.createElement(
          "th",
          null,
          "Direccion"
        ),
        React.createElement(
          "th",
          null,
          "Correo"
        )
      ),
      clientes.map(function (cliente) {
        return React.createElement(
          "tr",
          { key: cliente.nombre },
          React.createElement(
            "td",
            null,
            cliente.nombre
          ),
          React.createElement(
            "td",
            null,
            cliente.edad
          ),
          React.createElement(
            "td",
            null,
            cliente.direccion
          ),
          React.createElement(
            "td",
            null,
            cliente.correo
          )
        );
      })
    )
  );
};

//State components

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.agregarCliente = _this.agregarCliente.bind(_this);
    _this.state = {
      clientes: []
    };

    return _this;
  }

  _createClass(App, [{
    key: "agregarCliente",
    value: function agregarCliente(event) {

      event.preventDefault();

      var target = event.target;


      var cliente = {
        nombre: target.Nombre.value,
        edad: target.Edad.value,
        direccion: target.Direccion.value,
        correo: target.Correo.value
      };

      this.setState(function (prevState) {
        return {
          clientes: prevState.clientes.concat(cliente)
        };
      });
    }
  }, {
    key: "render",
    value: function render() {

      return React.createElement(
        "div",
        null,
        React.createElement(Formulario, { agregarCliente: this.agregarCliente }),
        React.createElement(ListaClientes, { clientes: this.state.clientes }),
        React.createElement(ListaClientes, { clientes: [{
            nombre: 'Julio',
            edad: 23
          }, {
            nombre: 'Juan',
            direccion: 'Asti'

          }] })
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));
