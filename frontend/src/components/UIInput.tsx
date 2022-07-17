import React from 'react'

interface InputProps {
  name: string
  label: string
  placeholder?: string
  value?: string
  type?: React.HTMLInputTypeAttribute
  error?: string
  textarea?: boolean
  rows?: number
  onChange?: (e: React.ChangeEvent<any>) => void
}

interface RenderInputProps extends InputProps {
  id: string
  className: string
}

const RenderInput = (props: RenderInputProps) => {
  if (props.textarea)
    return (
      <textarea
        id={props.id}
        name={props.name}
        value={props.value}
        className={props.className}
        placeholder={props.placeholder || props.label}
        rows={props.rows || 3}
        onChange={props.onChange}
      />
    )
  return (
    <input
      id={props.id}
      name={props.name}
      value={props.value}
      type={props.type || 'text'}
      className={props.className}
      placeholder={props.placeholder || props.label}
      onChange={props.onChange}
    />
  )
}

export default function UIInput(props: InputProps) {
  const { name, label, error } = props
  return (
    <div className="mb-3">
      <label htmlFor={'input-' + name} className="form-label">
        {label}
      </label>
      <RenderInput
        id={'input-' + name}
        className={error ? 'form-control is-invalid' : 'form-control'}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}
