import Button from 'material-ui/Button'
import React from 'react'
import {SettingForm} from '../ui/setting-form'

interface WrapperApp {
  reload(): void

  getHost(): string
  setHost(host: string): void
}
declare global {
  interface Window {
    wrapperApp?: WrapperApp
  }
}

export const isInApp = window.wrapperApp !== undefined

type WrapperAppSettings = {host: string}

const getWrapperAppSettings = (): WrapperAppSettings => ({
  host: window.wrapperApp!.getHost(),
})
const saveWrapperAppSettings = (settings: WrapperAppSettings) => {
  window.wrapperApp!.setHost(settings.host)
}

export const AppSettings = () => (
  <SettingForm
    value={getWrapperAppSettings()}
    fields={[
      {
        path: ['host'],
        label: 'Host',
        required: true,
      },
      <div style={{marginTop: 16}}>
        <Button onClick={() => window.wrapperApp!.reload()}>Reload</Button>
      </div>,
    ]}
    onSave={saveWrapperAppSettings}
  />
)
