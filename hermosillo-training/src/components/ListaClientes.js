import React from 'react';

export const ListaClientes = ({clientes}) => (
  <table>
    <tbody>
    <tr>
      <th>Nombre</th>
      <th>Edad</th>
      <th>Direccion</th>
      <th>Correo</th>
    </tr>
    {clientes.map(cliente => (
      <tr key={cliente.nombre}>
        <td>{cliente.nombre}</td>
        <td>{cliente.edad}</td>
        <td>{cliente.direccion}</td>
        <td>{cliente.correo}</td>
      </tr>
    ))}
    </tbody>
  </table>
)
