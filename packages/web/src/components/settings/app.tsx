import Button from '@material-ui/core/Button'
import ListSubheader from '@material-ui/core/ListSubheader'
import React from 'react'
import {LocalSettings, localSettingsStore} from '../../lib/local-settings'
import {SettingForm} from '../ui/setting-form'
import {SettingDropdown, SettingValue} from '../ui/setting-input'

interface WrapperApp {
  reload(): void

  getHost(): string
  setHost(host: string): void

  updateGeofence?(): void
  getGeofenceDeviceId?(): string | null
  setGeofenceDeviceId?(geofenceDeviceId: string | null): void
}
declare global {
  interface Window {
    wrapperApp?: WrapperApp
  }
}

// window.wrapperApp = {reload() {}, getHost: () => '', setHost() {}}
const isInApp = window.wrapperApp !== undefined

type WrapperAppSettings = {host: string; geofenceDeviceId: null | string}
type AppSettings = LocalSettings & Partial<WrapperAppSettings>

const getWrapperAppSettings = (): WrapperAppSettings => ({
  host: window.wrapperApp!.getHost(),
  geofenceDeviceId: window.wrapperApp!.getGeofenceDeviceId
    ? window.wrapperApp!.getGeofenceDeviceId!()
    : null,
})

const getAppSettings = (): AppSettings => {
  if (isInApp) {
    return {...localSettingsStore.getState(), ...getWrapperAppSettings()}
  } else {
    return localSettingsStore.getState()
  }
}
const saveAppSettings = ({
  host,
  geofenceDeviceId: _,
  ...settings
}: AppSettings) => {
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
            ...(window.wrapperApp!.setGeofenceDeviceId
              ? [
                  <ListSubheader disableSticky>
                    Location tracking
                  </ListSubheader>,
                  true ? (
                    <div>
                      <div>
                        <Button
                          onClick={() =>
                            window.wrapperApp!.setGeofenceDeviceId!(null)
                          }
                        >
                          Stop location tracking
                        </Button>
                        <Button
                          onClick={() => window.wrapperApp!.updateGeofence!()}
                        >
                          Change home location
                        </Button>
                      </div>
                      <SettingValue label="Is Home" value={'no'} />
                    </div>
                  ) : (
                    <div>
                      <Button onClick={() => window.wrapperApp!.reload()}>
                        Set home location
                      </Button>
                    </div>
                  ),
                ]
              : []),
          ]
        : []),
    ]}
    onSave={saveAppSettings}
  />
)
