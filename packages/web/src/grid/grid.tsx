import React from 'react'
import styled from 'styled-components'

export function repeat(s: string, times: number) {
  let repeated = ''

  for (let i = 0; i < times; i++) {
    repeated += s
  }

  return repeated
}

export type GridProps = {
  cols: number
  rows: number
  gap?: string | {column: string; row: string}
}

const InnerGrid = ({
  cols: _,
  rows: __,
  gap: ___,
  ...props,
}: React.HTMLProps<HTMLDivElement> & GridProps) => <div {...props} />

export const Grid = styled(InnerGrid)`
  display: grid;

  grid-template-columns: ${({cols}) => repeat('48px ', cols)};
  grid-template-rows: ${({rows}) => repeat('48px ', rows)};

  grid-column-gap: ${({gap}) =>
    (gap && (typeof gap === 'object' ? gap.column : gap)) || 0};
  grid-row-gap: ${({gap}) =>
    (gap && (typeof gap === 'object' ? gap.row : gap)) || 0};

  justify-content: center;
  align-content: center;

  justify-items: stretch;
  align-items: stretch;
`

export type CellProps = {
  x: number
  y: number
  width: number
  height: number
}

const InnerCell = ({
  x: _,
  y: __,
  width: ___,
  height: ____,
  ...props,
}: React.HTMLProps<HTMLDivElement> & CellProps) => <div {...props} />

export const Cell = styled(InnerCell)`
  grid-column-start: ${({x}) => x + 1};
  grid-column-end: ${({x, width}) => x + width + 1};
  grid-row-start: ${({y}) => y + 1};
  grid-row-end: ${({y, height}) => y + height + 1};
`
