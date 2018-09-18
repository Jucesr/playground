import React from 'react'
import { Form, Text, TextArea, asField} from 'informed'
import '../styles/formulario.css'
import {replaceAll, capitalizeFirstLetter, insertString} from '../utils'
import Cleave from 'cleave.js/dist/cleave-react';

// const validate = value => {
//   return !value || value.length < 5 ? 'Field must be at least five characters' : null;
// }
//
// const onCostChange = e => {
//   //let value = e.target.value
//   console.log(e);
//   return false;
//   // if (quantityValue.match(/^\d*(\.\d{0,5})?$/)) {
//   //   this.setState(() => ({ quantityValue }));
//   // }
// }

export default class Formulario extends React.Component {

  constructor(props){
    super(props);
  }

  render(){

    return (
      <Form
        onSubmit={(values) => console.log(values)}
        onSubmitFailure={(errors) => console.log(errors)}
        id="Modal-form"
        className='Modal_form'
        >
          { ({ formApi }) => (
            <div>
              <CustomInput
                field='reference_number'
                options={{
                  delimiter: '.',
                  blocks: [2, 2, 2, 2],
                  uppercase: true
                }}
              />
              <RegularInput textarea={true} field='description'/>

              <RegularInput field='unit_of_mesurement'/>

              <CustomInput
                field='quantity'
                options={{
                  numeral: true,
                  numeralDecimalScale: 5,
                  numeralThousandsGroupStyle: 'thousand'
                }}
                onValueChange={quantity => {
                  let cost = formApi.getValue('cost')
                  formApi.setValue('total', quantity * cost)
                }}
              />

              <CustomInput
                field='cost'
                options={{
                 prefix: '$',
                 numeral: true,
                 numeralThousandsGroupStyle: 'thousand',
                 rawValueTrimPrefix: true
                }}
                onValueChange={cost => {
                  let quantity = formApi.getValue('quantity')
                  formApi.setValue('total',quantity * cost)
                }}
               />

              <CustomInput
                field='total'
                options={{
                 prefix: '$',
                 numeral: true,
                 numeralThousandsGroupStyle: 'thousand',
                 rawValueTrimPrefix: true
                }}
                disabled={true}
               />
            <div className="Modal_form_section">
              <button className="Modal_form_submit" type="submit">
                Add
              </button>
            </div>

            </div>
          )}
      </Form>
    )
  };
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
    field,
    ...rest
  } = props

  return (
    <div className="Modal_form_section">
      <div className="Modal_form_field_label" htmlFor={field}>{replaceAll(capitalizeFirstLetter(field), '_', ' ')}</div>
      {/* <span className="CustomInput_prefix">{prefix}</span> */}
      <Cleave
        {...rest}
        value={value}
        field={field}
        className="Modal_form_field_input"
        onChange={e => {
            setValue(e.target.rawValue)
            if (onChange) {
              onChange(e)
            }
        }}
      />
    </div>
  )
})

const RegularInput = ({field, textarea = false, ...rest}) => (
  <div className="">
    <div className="Modal_form_field_label" htmlFor={field}>{replaceAll(capitalizeFirstLetter(field), '_', ' ')}</div>
    {textarea ? <TextArea {...rest} field={field} className="Modal_form_field_input"/> : <Text {...rest} field={field} className="Modal_form_field_input"/> }

  </div>
)
