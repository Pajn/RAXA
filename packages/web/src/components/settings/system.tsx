import React from 'react'
import {SettingValue} from '../ui/setting-input'

export const SystemSettings = () => (
  <div style={{padding: '16px 8px'}}>
    <SettingValue label="Build date" value={process.env.REACT_APP_BUILD_DATE} />
    <span style={{padding: 2}} />
    <SettingValue
      label="Commit hash"
      value={process.env.REACT_APP_BUILD_HASH || 'HEAD'}
    />
  </div>
)
