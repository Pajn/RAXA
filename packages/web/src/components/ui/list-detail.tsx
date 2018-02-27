import glamorous from 'glamorous'
import React from 'react'
import {Section} from 'react-material-app'
import {
  Route,
  RouteComponentProps,
  Switch,
  matchPath,
  withRouter,
} from 'react-router'
import {compose, lifecycle, mapProps, withState} from 'recompose'
import {column, row} from 'style-definitions'
import {List, ListItem} from './list'
import {IsMobileProps, withIsMobile} from './mediaQueries'

const Container = glamorous.div(row({}), {displayName: 'Container'})
const Detail = glamorous.div(column({flex: {grow: 1}}), {displayName: 'Detail'})

export type ListDetailProps<E, T> = {
  path: string
  data?: T & {loading: boolean}
  getItems: (data: T & {loading: boolean}) => Array<E>
  getSection: (item: E) => {title: string; path: string} | null
  renderItem: (
    item: E,
    props: {isActive: boolean; activate?: () => void},
    index: number,
  ) => JSX.Element
  renderActiveItem: (item: E) => JSX.Element | null
  activeItem?: {
    item: E
    section: {title: string; path: string; onUnload?: () => void}
  }
  listHeader?: React.ReactElement<any>
}

export type PrivateListDetailProps = ListDetailProps<{}, {}> &
  IsMobileProps &
  RouteComponentProps<any> & {
    inList: boolean
    items: Array<{item: any; section: {title: string; path: string}}>
    beenInList: boolean
    setBeenInList: (value: boolean) => void
  }

const enhance = compose<PrivateListDetailProps, ListDetailProps<any, any>>(
  withIsMobile,
  withRouter,
  mapProps((props: PrivateListDetailProps) => {
    const inList = !!matchPath(location.pathname, {
      path: props.path,
      exact: true,
    })
    const inItem = !!matchPath(location.pathname, {path: props.path})
    return {
      ...props,
      inItem: inItem && !inList,
      inList: !(inItem && !inList),
      items:
        props.data &&
        !props.data.loading &&
        props
          .getItems(props.data)
          .map(item => ({item, section: props.getSection(item)})),
    }
  }),
  withState('beenInList', 'setBeenInList', false),
  lifecycle({
    componentWillReceiveProps(nextProps: PrivateListDetailProps) {
      const {
        path,
        isMobile,
        beenInList,
        setBeenInList,
        inList,
        items,
        history,
        location,
      } = nextProps
      if (isMobile && !inList && !beenInList) {
        // Make sure that we back to to the list
        history.replace(path)
        history.push(location.pathname, location.state)
        setBeenInList(true)
      } else if (inList && !beenInList) {
        setBeenInList(true)
      }
      if (inList && !isMobile && items && items.length > 0) {
        history.replace(items.find(i => !!i.section)!.section.path)
      }
    },
  }),
)

export const ListDetailView = ({
  renderItem,
  renderActiveItem,
  inList,
  items,
  history,
  location,
  isMobile,
  activeItem,
  listHeader,
}: PrivateListDetailProps) => {
  const onBack = () => history.goBack()

  return (
    <Container>
      {(!isMobile || inList) && (
        <List selectable>
          {listHeader}
          {!items ? (
            <span>loading</span>
          ) : (
            items.map((item, index) => {
              const activate = item.section
                ? () => {
                    if (inList) {
                      history.push(item.section.path)
                    } else {
                      history.replace(item.section.path)
                    }
                  }
                : undefined
              const isActive = item.section
                ? !!matchPath(location.pathname, {
                    path: item.section.path,
                  })
                : false
              const child = renderItem(
                item.item,
                {
                  activate,
                  isActive,
                },
                index,
              )

              if (!child) return child
              const c = child as React.ReactElement<any>
              if (c.type === ListItem) {
                return React.cloneElement(c, {
                  selected:
                    c.props.selected === undefined
                      ? isActive
                      : c.props.selected,
                  onClick: c.props.onClick || activate,
                })
              }
              return child
            })
          )}
        </List>
      )}
      {(!isMobile || !inList) && (
        <Detail>
          <Switch>
            {activeItem ? (
              isMobile ? (
                <Section {...activeItem.section} onBack={onBack}>
                  {renderActiveItem(activeItem.item)}
                </Section>
              ) : (
                renderActiveItem(activeItem.item)
              )
            ) : (
              items &&
              items.map(
                (item, index) =>
                  item.section ? (
                    <Route
                      location={location}
                      key={index}
                      path={item.section.path}
                      render={() =>
                        isMobile ? (
                          <Section {...item.section} onBack={onBack}>
                            {renderActiveItem(item.item)}
                          </Section>
                        ) : (
                          renderActiveItem(item.item)
                        )
                      }
                    />
                  ) : null,
              )
            )}
          </Switch>
        </Detail>
      )}
    </Container>
  )
}

export const ListDetail = (enhance(ListDetailView) as any) as <E, T>(
  props: ListDetailProps<E, T>,
) => JSX.Element
