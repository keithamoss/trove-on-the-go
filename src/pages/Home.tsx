import { Container, Divider, Grid, IconButton, InputBase, Link, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ImageSearchTwoToneIcon from '@material-ui/icons/ImageSearchTwoTone'
import React, { Fragment } from 'react'
import { useDebounce } from 'use-debounce'
import PhotoListing from '../components/photo-listing'
import { isDev } from '../shared/utils'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}))

export const Home: React.FC = () => {
  const classes = useStyles()

  const [searchTermRaw, setSearchTerm] = React.useState<string | null>(
    isDev() ? 'raine square' : null
  )
  const [searchTerm] = useDebounce(searchTermRaw, 500)

  return (
    <Fragment>
      <Container component="main" maxWidth="sm">
        <div className={classes.root}>
          <Typography component="h1" variant="h1">
            <span role="img" aria-label="Female detective emoji">
              🕵️‍♀️
            </span>
          </Typography>
          <Grid
            container
            style={{ marginTop: 25 }}
            // alignItems="center"
            // alignContent="center"
          >
            <Grid item style={{ width: '100%' }}>
              <Paper component="form" className={classes.form}>
                <InputBase
                  className={classes.input}
                  placeholder="Search Trove"
                  inputProps={{ 'aria-label': 'search trove' }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value.length >= 5) {
                      setSearchTerm(event.target.value)
                    }
                  }}
                />
                <Divider className={classes.divider} orientation="vertical" />
                <IconButton
                  type="submit"
                  color="primary"
                  className={classes.iconButton}
                  aria-label="search"
                >
                  <ImageSearchTwoToneIcon />
                </IconButton>
              </Paper>
            </Grid>

            <Grid container style={{ marginTop: 25 }}>
              <Grid item>
                {searchTerm !== null && (
                  <PhotoListing searchTerm={searchTerm} />
                )}
              </Grid>
            </Grid>

            <Grid container style={{ marginTop: 25 }}>
              <Grid item xs>
                <Link
                  href="https://trove.nla.gov.au/"
                  variant="overline"
                  display="block"
                  align="center"
                >
                  Made with Trove{' '}
                  <span role="img" aria-label="Love heart emoji">
                    ❤️
                  </span>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Container>
    </Fragment>
  )
}
