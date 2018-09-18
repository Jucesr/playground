import React from 'react';

export const List = (props) => {

  return (
    <div style={{display : 'flex'}}>
      {props.items.map(item => {
        return <div style={{width : `${item.width}px`}} key={item.id}>{item.name}</div>
      })}
    </div>

  );
}
