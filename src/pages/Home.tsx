import { Box, Container, Grid, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React, { Fragment } from 'react'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
}))

export const Home: React.FC = () => {
  const classes = useStyles()

  return (
    <Fragment>
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <Typography component="h1" variant="h1">
            <span role="img" aria-label="Whisky glass image">
              🕵️‍♀️
            </span>
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container style={{ marginTop: 25 }}>
              {/* <Grid item style={{ width: '100%' }}></Grid> */}
              <Grid item xs>
                <Link
                  href="https://www.reddit.com/r/Scotch/"
                  variant="overline"
                  display="block"
                  align="center"
                >
                  /r/Skotch{' '}
                  <span role="img" aria-label="Whisky glass image">
                    ❤️
                  </span>
                </Link>
              </Grid>
              <Grid item>
                {/* <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link> */}
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>{/* <Copyright /> */}</Box>
      </Container>
    </Fragment>
  )
}
