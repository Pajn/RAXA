import * as React from 'react'
import {withMedia} from 'react-with-media'
import {compose} from 'recompose'
import {ListItem} from './list'

export type SettingInputProps = {
  type?: 'number'
  label: string
  value: any
  onChange: (newValue: string) => void
}
export type PrivateSettingInputProps = SettingInputProps & {
  isMobile: true
  children: any
}

export const enhance = compose(
  withMedia('(max-width: 700px)', {name: 'isMobile'})
)

export const SettingInputView = ({
  label, type, value, onChange,
  isMobile
}: PrivateSettingInputProps) =>
  isMobile
    ? <ListItem />
    : <div>
        <label>
          <span>{label}</span>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </label>
      </div>

export const SettingInput: React.ComponentClass<SettingInputProps> = enhance(SettingInputView)
