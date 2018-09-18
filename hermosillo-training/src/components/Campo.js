import React from 'react';

export const Campo = ({input, meta, otroprop}) => (
  <div>
    {console.log(input)}
    {console.log(otroprop)}
    <label>{input.name}</label>
    <input
      type="text"
      {...input}
    />
    {meta.error && meta.touched && <span style={{color: 'red'}}>{meta.error}</span>}
  </div>
)
