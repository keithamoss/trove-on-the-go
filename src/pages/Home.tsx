import {
 Container, Grid, IconButton, InputAdornment, InputBase, Link, Paper,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ImageSearchTwoToneIcon from '@material-ui/icons/ImageSearchTwoTone'
import React from 'react'
import { RouteComponentProps, useParams } from 'react-router-dom'
import PhotoGallery, { GalleryPhotos } from '../components/photo-gallery/PhotoGallery'
import PhotoListing from '../components/photo-listing'
import { isDev } from '../shared/utils'

const useStyles = makeStyles((theme) => ({
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
    marginTop: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
    marginLeft: theme.spacing(1.25),
    flex: 1,
  },
}))

const Home: React.FC<RouteComponentProps> = ({ history }) => {
  const classes = useStyles()

  const { search, page } = useParams()

  const [searchTerm, setSearchTerm] = React.useState<string | null>(
    search !== undefined ? search : isDev() ? 'raine square' : null,
  )

  const [galleryPhotos, setGalleryPhotos] = React.useState<GalleryPhotos | null>(null)
  const onCloseGallery = () => setGalleryPhotos(null)

  return (
    <>
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
              <Paper
                component="form"
                className={classes.form}
                onSubmit={(e) => {
                  e.preventDefault()

                  const form = e.target as HTMLFormElement
                  const input: HTMLInputElement | null = form.elements.namedItem(
                    'search',
                  ) as HTMLInputElement
                  if (input !== null && input.value.length > 0) {
                    setSearchTerm(input.value)
                  }

                  // Let mobile browsers know we want to close the soft keyboard
                  input.blur()

                  history.push(`/${input.value}`)
                }}
              >
                <InputBase
                  className={classes.input}
                  placeholder="Search Trove"
                  inputProps={{
                    name: 'search',
                    enterkeyhint: 'search',
                    'aria-label': 'search trove',
                  }}
                  defaultValue={searchTerm}
                  endAdornment={(
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        color="primary"
                        aria-label="submit search form"
                      >
                        <ImageSearchTwoToneIcon />
                      </IconButton>
                    </InputAdornment>
                  )}
                />
              </Paper>
            </Grid>

            <Grid container style={{ marginTop: 25 }}>
              <Grid item style={{ width: "100%" }}>
                {searchTerm !== null && (
                  <PhotoListing searchTerm={searchTerm} page={page} onChoosePhoto={setGalleryPhotos} />
                )}

                {galleryPhotos !== null && galleryPhotos.photos.length > 0 && <PhotoGallery galleryPhotos={galleryPhotos} onClose={onCloseGallery} />}
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
                  Made with Trove
                  {' '}
                  <span role="img" aria-label="Love heart emoji">
                    ❤️
                  </span>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Container>
    </>
  )
}

export default Home
