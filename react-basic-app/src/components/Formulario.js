import React from 'react';
import { Form, Text, asField } from 'informed';
import Cleave from 'cleave.js/dist/cleave-react';
// import CleavePhone from 'cleave.js/dist/addons/cleave-phone.mx';

export default class Formulario extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      costCleave: null
    }

  }

  render(){
    return (
      <Form id="state-form"
        // initialValues={{name: 'Julio'}}
        onSubmit={(values) => console.log(values)}
        onSubmitFailure={(errors) => console.log(errors)}
        >

        <CustomInput
          field='reference_number'
          placeholder="Reference number"
          options={{
            delimiter: '.',
            blocks: [2, 2, 2, 2],
            uppercase: true
          }}
        />
        <CustomInput
          field='quantity'
          placeholder="Quantity"
          options={{
            numeral: true,
            numeralThousandsGroupStyle: 'thousand'
          }}
        />
        <CustomInput
          field='cost'
          placeholder="Cost"
          prefix="$"
          options={{
            // prefix: '$',
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            rawValueTrimPrefix: true
          }}
        />

        <button type="submit">Aceptar</button>

      </Form>
    )
  }
}

const CustomInput = asField(({ fieldState, fieldApi,  ...props }) => {
  const {
    value
  } = fieldState;
  const {
    setValue,
    setTouched
  } = fieldApi;
  const {
    onChange,
    onBlur,
    forwardedRef,
    prefix,
    ...rest
  } = props

  return (
    <React.Fragment>
      <div className="CustomInput">
        <span className="CustomInput_prefix">{prefix}</span>
        <Cleave
          {...rest}
          //onFocus={this.onCreditCardFocus}
          className="CustomInput_input"
          onChange={e => {
              setValue(e.target.rawValue)
              if (onChange) {
                onChange(e)
              }
          }}
        />
      </div>
    </React.Fragment>
  )
})


const CustomInput = ({props}) => {
  return (
    <div className="CustomInput">
      <span className="CustomInput_prefix">{prefix}</span>
      <Cleave
        {...props}
        className="CustomInput_input"
      />
    </div>
  )
}
