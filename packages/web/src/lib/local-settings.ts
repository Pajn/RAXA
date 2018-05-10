import React, {ReactNode} from 'react'

type Subscriber = (settings: LocalSettings) => void
export type LocalSettings = {
  theme: 'white' | 'dark'
}
type LocalSettingsStore = {
  getState: () => LocalSettings
  update: (settings: Partial<LocalSettings>) => void
  subscribe: (subscriber: Subscriber) => void
  unsubscribe: (subscriber: Subscriber) => void
}

export const createStore = (): LocalSettingsStore => {
  const subscribers = new Set<Subscriber>()
  let settings: LocalSettings = {
    theme: 'white',
  }

  try {
    settings = {
      ...settings,
      ...JSON.parse(localStorage.getItem('raxaSettings') || '{}'),
    }
  } catch (_) {}

  return {
    getState: () => settings,
    update: (updated: Partial<LocalSettings>) => {
      settings = {...settings, ...updated}
      localStorage.setItem('raxaSettings', JSON.stringify(settings))
      for (const subscriber of subscribers) {
        subscriber(settings)
      }
    },
    subscribe: subscriber => subscribers.add(subscriber),
    unsubscribe: subscriber => subscribers.delete(subscriber),
  }
}

export const localSettingsStore = createStore()

export class LocalSettingsProvider extends React.Component<
  {children: (settings: LocalSettings) => ReactNode; store: LocalSettingsStore},
  {settings?: LocalSettings}
> {
  state: {settings?: LocalSettings} = {settings: this.props.store.getState()}

  subscriber = (settings: LocalSettings) => {
    this.setState({settings})
  }

  componentDidMount() {
    this.props.store.subscribe(this.subscriber)
  }

  componentWillUnmount() {
    this.props.store.unsubscribe(this.subscriber)
  }

  render() {
    return this.state.settings === undefined
      ? null
      : this.props.children(this.state.settings)
  }
}
