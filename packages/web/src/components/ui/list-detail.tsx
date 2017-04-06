import Flexbox from 'flexbox-react'
import {History, Location} from 'history'
import * as React from 'react'
import {GraphQLDataProps} from 'react-apollo/lib/graphql'
import {Route, matchPath, withRouter} from 'react-router'
import compose from 'recompose/compose'
import lifecycle from 'recompose/lifecycle'
import mapProps from 'recompose/mapProps'
import withState from 'recompose/withState'
import {List, ListItem} from './list'
import {IsMobileProps, withIsMobile} from './mediaQueries'
import {Section} from './scaffold/section'

export type ListDetailProps<E, T> = {
  path: string
  data?: T & GraphQLDataProps
  getItems: (data: T & GraphQLDataProps) => Array<E>
  getSection: (item: E) => {title: string, path: string}
  renderItem: (item: E, props: {isActive: boolean, activate: () => void}) => JSX.Element
  renderActiveItem: (item: E) => JSX.Element
}

export type PrivateListDetailProps = ListDetailProps<any, any> & IsMobileProps & {
  inList: boolean
  items: Array<{item: any, section: {title: string, path: string}}>
  beenInList: boolean
  setBeenInList: (value: boolean) => void
  history: History
  location: Location
}

const enhance = compose(
  withIsMobile,
  withRouter,
  mapProps(props => {
    const inList = !!matchPath(location.pathname, {path: props.path, exact: true})
    const inItem = !!matchPath(location.pathname, {path: props.path})
    return {
      ...props,
      inItem: inItem && !inList,
      inList: !(inItem && !inList),
      items: props.data && !props.data.loading && props.getItems(props.data)
        .map(item => ({item, section: props.getSection(item)}))
    }
  }),
  withState('beenInList', 'setBeenInList', false),
  lifecycle({
    componentWillReceiveProps(nextProps: PrivateListDetailProps) {
      const {path, isMobile, beenInList, setBeenInList, inList, items, history, location} = nextProps
      if (isMobile && !inList && !beenInList) {
        // Make sure that we back to to the list
        history.replace(path)
        history.push(location.pathname, location.state)
        setBeenInList(true)
      } else if (inList && !beenInList) {
        setBeenInList(true)
      }
      if (inList && !isMobile && items && items.length > 0) {
        history.replace(items[0].section.path)
      }
    },
  })
)

export const ListDetailView = ({
  renderItem, renderActiveItem,
  inList, items, history, location, isMobile,
}: PrivateListDetailProps) => {
  const onBack = () => history.goBack()

  return (
    <Flexbox>
      {(!isMobile || inList) &&
        <List selectable>
          {!items
            ? <span>loading</span>
            : items.map(item => {
                const activate = () => {
                  if (inList) {
                    history.push(item.section.path)
                  } else {
                    history.replace(item.section.path)
                  }
                }
                const isActive = !!matchPath(location.pathname, {path: item.section.path})
                const child = renderItem(item.item, {
                  activate,
                  isActive,
                })

                if (!child) return child
                const c = child as React.ReactElement<any>
                if (c.type === ListItem) {
                    return React.cloneElement(c, {
                      selected: c.props.selected === undefined
                        ? isActive
                        : c.props.selected,
                      onClick: c.props.onClick || activate,
                    })
                  }
                return child
              })
          }
        </List>
      }
      {(isMobile || !inList) &&
        <Flexbox flexDirection="column" flexGrow={1}>
          {items && items.map(item =>
            <Route
              location={location}
              key={item.section.path}
              path={item.section.path}
              render={() =>
                isMobile
                  ? <Section {...item.section} onBack={onBack}>
                      {renderActiveItem(item.item)}
                    </Section>
                  : renderActiveItem(item.item)
              }
            />
          )}
        </Flexbox>
      }
    </Flexbox>
  )
}

export const ListDetail = enhance(ListDetailView) as <E, T>(props: ListDetailProps<E, T>) => JSX.Element
