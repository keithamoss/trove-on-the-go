import { makeStyles, Typography } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import { ReactComponent as EmptyStateArt } from './undraw_cup_of_tea.svg'

const useStyles = makeStyles({
  paper: {
    backgroundColor: '#979797',
    padding: 10,
  },
  svg: {
    width: '100%',
    height: '200px',
  },
  title: {
    color: '#2f2e41',
    fontWeight: 'normal',
  },
  message: {
    color: '#2f2e41',
    paddingTop: '10px',
  },
})

const EmptyState: React.FC = () => {
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <EmptyStateArt className={classes.svg} />
      <Typography variant="h6" align="center" className={classes.title}>
        Sorry, we couldn&apos;t find any photos.
      </Typography>
      <Typography variant="body2" align="center" className={classes.message} gutterBottom>
        How about a cuppa?
      </Typography>
    </Paper>
  )
}

export default EmptyState
