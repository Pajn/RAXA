import glamorous from 'glamorous'
import TimePicker from 'material-ui-old/TimePicker'
import {fromPairs, toPairs} from 'ramda'
import React from 'react'
import Button from 'react-toolbox/lib/button/Button'
import Dialog from 'react-toolbox/lib/dialog/Dialog'
import Input from 'react-toolbox/lib/input/Input'
import {Tab, Tabs} from 'react-toolbox/lib/tabs'
import {compose, withState} from 'recompose'
import {row} from 'style-definitions'
import {IsMobileProps, withIsMobile} from './mediaQueries'
import {ListItemLayout} from './setting-input'

type Days = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sun' | 'sat'
const days = ['sat', 'mon', 'tue', 'wed', 'thu', 'fri', 'sun', 'sat']
const dayNames = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sun: 'Sun',
  sat: 'Sat',
}

const DayRow = glamorous.div(row({horizontal: 'center', vertical: 'center'}))
const weekdayCronPattern = /^(\d\d?) (\d\d?) \* \* (\d(?:-\d)?(?:,\d(?:-\d)?)+)$/

const isWeekdayExpression = (cronExpression: string) =>
  weekdayCronPattern.test(cronExpression)

const timeFromWeekdayExpression = (cronExpression: string): Date => {
  const [, minutes, hours] = weekdayCronPattern.exec(cronExpression) || [
    '',
    '0',
    '12',
  ]
  const date = new Date()
  date.setMilliseconds(0)
  date.setSeconds(0)
  date.setUTCMinutes(+minutes)
  date.setUTCHours(+hours)
  return date
}
const daysFromWeekdayExpression = (cronExpression: string): Array<Days> => {
  const parsedDays = new Set<string>()
  ;(weekdayCronPattern.exec(cronExpression) || ['', '', '', ''])[3]
    .split(',')
    .forEach(pattern => {
      pattern = pattern.trim()
      pattern = pattern || '1-7'
      if (pattern.includes('-')) {
        const [start, end] = pattern.split('-')
        if (start > end) return []
        for (let i = +start; i <= +end; i++) {
          parsedDays.add(days[i] || '')
        }
      } else {
        parsedDays.add(days[+pattern] || '')
      }
    })
  parsedDays.delete('')
  return [...(parsedDays as Set<Days>)]
}

const isActive = (keys: Array<string>, active: Array<string>) => {
  const obj = fromPairs(keys.map(key => [key, false] as [Days, boolean]))
  active.forEach(key => (obj[key] = true))
  return toPairs<Days, boolean>(obj)
}

type SchedulePickerDialogProps = {
  value: string
  onChange: (value: string) => void
}
type PrivateSchedulePickerDialogProps = SchedulePickerDialogProps & {
  index: number
  setIndex: (index: number) => void
}

const SchedulePickerDialog = compose<
  PrivateSchedulePickerDialogProps,
  SchedulePickerDialogProps
>(
  withState(
    'index',
    'setIndex',
    (props: SchedulePickerDialogProps) =>
      isWeekdayExpression(props.value) ? 0 : 1,
  ),
)(({value, onChange, index, setIndex}) => (
  <Tabs index={index} onChange={setIndex} fixed>
    <Tab label="Weekdays">
      <TimePicker
        format="24hr"
        value={timeFromWeekdayExpression(value)}
        onChange={(_, date: Date) => {
          const weekdays = daysFromWeekdayExpression(value)
          const minutes = date.getUTCMinutes()
          const hours = date.getUTCHours()

          onChange(
            `${minutes} ${hours} * * ${weekdays
              .map(day => days.indexOf(day, 1))
              .sort()
              .join(',')}`,
          )
        }}
      />
      <DayRow>
        {isActive(
          days.slice(1),
          daysFromWeekdayExpression(value),
        ).map(([day, active]) => (
          <Button
            key={day}
            onClick={() => {
              const weekdays = daysFromWeekdayExpression(value)
              const date = timeFromWeekdayExpression(value)
              const minutes = date.getMinutes()
              const hours = date.getHours()

              if (active) {
                weekdays.splice(weekdays.indexOf(day), 1)
              } else {
                weekdays.push(day)
              }

              onChange(
                `${minutes} ${hours} * * ${weekdays
                  .map(day => days.indexOf(day, 1))
                  .sort()
                  .join(',')}`,
              )
            }}
            raised={active}
            primary={active}
            style={{marginLeft: 4, marginRight: 4, minWidth: 0}}
          >
            {dayNames[day]}
          </Button>
        ))}
      </DayRow>
    </Tab>
    <Tab label="Advanced">
      <Input value={value} onChange={onChange} />
    </Tab>
  </Tabs>
))

const StyledDialog = glamorous(Dialog)({
  '& section': {outline: 'none'},
})

export type SchedulePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
}
export type PrivateSchedulePickerProps = SchedulePickerProps & IsMobileProps

export const ScheduleInput = compose<
  PrivateSchedulePickerProps,
  SchedulePickerProps
>(withIsMobile)(
  class ScheduleInput extends React.Component<PrivateSchedulePickerProps> {
    state = {
      displaySchedulePicker: false,
    }

    handleClick = () => {
      this.setState({displaySchedulePicker: !this.state.displaySchedulePicker})
    }

    handleClose = () => {
      this.setState({displaySchedulePicker: false})
    }

    render() {
      return [
        <ListItemLayout
          key="ListItem"
          caption={this.props.label}
          legend={this.props.value}
          onClick={this.handleClick}
        />,
        <StyledDialog
          key="Dialog"
          active={this.state.displaySchedulePicker}
          onEscKeyDown={this.handleClose}
          onOverlayClick={this.handleClose}
        >
          <SchedulePickerDialog
            value={this.props.value}
            onChange={this.props.onChange}
          />
        </StyledDialog>,
      ]
    }
  },
)
