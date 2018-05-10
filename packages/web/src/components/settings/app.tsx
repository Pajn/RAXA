import Button from 'material-ui/Button'
import React from 'react'
import {LocalSettings, localSettingsStore} from '../../lib/local-settings'
import {SettingForm} from '../ui/setting-form'
import {SettingDropdown} from '../ui/setting-input'

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

const isInApp = window.wrapperApp !== undefined

type WrapperAppSettings = {host: string}
type AppSettings = LocalSettings & Partial<WrapperAppSettings>

const getWrapperAppSettings = (): WrapperAppSettings => ({
  host: window.wrapperApp!.getHost(),
})

const getAppSettings = (): AppSettings => {
  if (isInApp) {
    return {...localSettingsStore.getState(), ...getWrapperAppSettings()}
  } else {
    return localSettingsStore.getState()
  }
}
const saveAppSettings = ({host, ...settings}: AppSettings) => {
  if (isInApp) {
    window.wrapperApp!.setHost(host!)
  }
  localSettingsStore.update(settings)
}

export const AppSettings = () => (
  <SettingForm
    value={getAppSettings()}
    fields={[
      {
        path: ['theme'],
        label: 'Theme',
        component: SettingDropdown,
        source: [
          {value: 'white', label: 'White'},
          {value: 'dark', label: 'Dark'},
        ],
      },
      ...(isInApp
        ? [
            {
              path: ['host'],
              label: 'Host',
              required: true,
            },
            <div style={{marginTop: 16}}>
              <Button onClick={() => window.wrapperApp!.reload()}>
                Reload
              </Button>
            </div>,
          ]
        : []),
    ]}
    onSave={saveAppSettings}
  />
)
