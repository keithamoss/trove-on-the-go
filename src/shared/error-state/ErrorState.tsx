import { makeStyles, Typography } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import { ReactComponent as ErrorStateArt } from './undraw_fixing_bugs.svg'

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

const ErrorState: React.FC = () => {
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <ErrorStateArt className={classes.svg} />
      <Typography variant="h6" align="center" className={classes.title}>
        Well, this is embarrasing. There&apos;s been an error.
      </Typography>
      <Typography variant="body2" align="center" className={classes.message} gutterBottom>
        Shoot me an <a href="mailto:keithamoss@gmail.com?subject=Trove%20on%20the%20Go">email</a> and I&apos;ll take a
        look. (It&apos;ll be helpful if you could let me know what you were searching for too.)
      </Typography>
    </Paper>
  )
}

export default ErrorState
