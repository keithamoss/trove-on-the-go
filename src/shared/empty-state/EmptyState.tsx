import { makeStyles, Typography } from '@material-ui/core'
import React, { Fragment } from 'react'
import { ReactComponent as EmptyStateArt } from './undraw_cup_of_tea.svg'

const useStyles = makeStyles({
  svg: {
    width: '100%',
    height: '200px',
  },
  title: {
    opacity: 0.5,
    fontWeight: 'normal',
  },
  message: {
    opacity: 0.5,
  },
})

export const EmptyState: React.FC = () => {
  const classes = useStyles()

  return (
    <Fragment>
      <EmptyStateArt className={classes.svg} />
      <Typography variant="h6" align="center" className={classes.title}>
        No results found
      </Typography>
      <Typography
        variant="body2"
        align="center"
        className={classes.message}
        gutterBottom
      >
        How about a cuppa?
      </Typography>
    </Fragment>
  )
}
