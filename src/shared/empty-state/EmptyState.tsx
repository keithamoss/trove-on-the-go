import { makeStyles, Typography } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import { ReactComponent as EmptyStateArt } from './undraw_cup_of_tea.svg'

const useStyles = makeStyles({
  paper: {
    backgroundColor: '#6C747A',
    padding: 10,
  },
  svg: {
    width: '100%',
    height: '200px',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  message: {
    color: '#FFFFFF',
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
