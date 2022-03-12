import { Container, Grid, IconButton, InputAdornment, InputBase, Link, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ClearTwoToneIcon from '@material-ui/icons/ClearTwoTone'
import ImageSearchTwoToneIcon from '@material-ui/icons/ImageSearchTwoTone'
import React, { Fragment, MutableRefObject, useRef } from 'react'
// eslint-disable-next-line import/named
import { RouteComponentProps, useParams } from 'react-router-dom'
import { TroveSortOrder } from '../api/types'
import PhotoGallery, { GalleryPhotos } from '../components/photo-gallery/PhotoGallery'
import PhotoListing from '../components/photo-listing'
import TimelineScrubber from '../components/photo-listing/TimelineScrubber'
import SortOrderToggleMenu from '../components/sort-order-toggle/SortOrderToggleMenu'
import { getNumberParamFromQSOrNull, getStringParamFromQSOrNull, useQuery } from '../shared/utils'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
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

interface RouteParams {
  search: string | undefined
  page: string | undefined
}

const getDefaultSearchTerm = (search: string | undefined): string | null => {
  if (search !== undefined) {
    return search
  }

  // return isDev() ? 'trinity arcade' : null
  return null
}

const getDefaultSortDirection = (sortOrder: string | null): TroveSortOrder => {
  if (sortOrder !== null && Object.values(TroveSortOrder).includes(sortOrder as TroveSortOrder) === true) {
    return sortOrder as TroveSortOrder
  }

  // If changing this, also change the code that calls setSortOrder() in the component body
  return TroveSortOrder.DATE_ASC
}

const Home: React.FC<RouteComponentProps> = ({ history }: RouteComponentProps) => {
  const classes = useStyles()

  const { search: urlSearchParam, page: urlPageParam } = useParams<RouteParams>()
  const urlYearParam = getNumberParamFromQSOrNull(useQuery(), 'y')
  const urlSortOrderParam = getStringParamFromQSOrNull(useQuery(), 'sort')

  const [searchTerm, setSearchTerm] = React.useState<string | null>(getDefaultSearchTerm(urlSearchParam))

  // if (isDev() && searchTerm === null) {
  //   history.push('/trinity%20arcade')
  // }

  const [galleryPhotos, setGalleryPhotos] = React.useState<GalleryPhotos | null>(null)
  const onCloseGallery = () => setGalleryPhotos(null)

  // https://stackoverflow.com/a/58636291
  const textInput = useRef() as MutableRefObject<HTMLInputElement>

  const [searchYear, setSearchYear] = React.useState<number | null>(null)

  const [sortOrder, setSortOrder] = React.useState<TroveSortOrder>(getDefaultSortDirection(urlSortOrderParam))

  // 1. We've navigated to a URL that already has a searchTerm, so update local state and let the <input> field know.
  // Note: This doesn't apply to new page loads, just back/forward navigation through history()
  // New page loads are taken care of by getDefaultSearchTerm()
  if (urlSearchParam !== undefined && urlSearchParam !== searchTerm) {
    setSearchTerm(urlSearchParam)

    if (textInput.current !== undefined) {
      textInput.current.value = urlSearchParam
    }
  }

  // 2. We've navigated to a URL that doesn't have a searchTerm, so update local state and let the <input> field know.
  // Note: This doesn't apply to new page loads, just back/forward navigation through history()
  // New page loads are taken care of by getDefaultSearchTerm()
  if (urlSearchParam === undefined && searchTerm !== null) {
    setSearchTerm(null)

    if (textInput.current !== undefined) {
      textInput.current.value = ''
    }
  }

  // Whenever the search year changes in the URL, make sure we keep local state in sync.
  if (urlYearParam !== searchYear) {
    setSearchYear(urlYearParam)
  }

  // Whenever the search sort order changes in the URL, make sure we keep local state in sync.
  if (urlSortOrderParam === null && sortOrder !== TroveSortOrder.DATE_ASC) {
    // Required for when the user is on the page and navigates to a state where the URL no longer contains the `sort` parameter
    // If changing this, also change getDefaultSortDirection()
    setSortOrder(TroveSortOrder.DATE_ASC)
  } else if (urlSortOrderParam !== sortOrder && urlSortOrderParam !== null) {
    // Required for all other cases of when the user has changed the value of the sortOrder parameter
    setSortOrder(urlSortOrderParam as TroveSortOrder)
  }

  const onDateChange = (year: number) => {
    setSearchYear(year)
    history.push({
      pathname: `/${searchTerm}`,
      search: `y=${year}`,
    })
  }

  const onSortOrderChange = (sortOrderValue: TroveSortOrder) => {
    setSortOrder(sortOrderValue)

    const searchParams = new URLSearchParams(history.location.search)
    searchParams.set('sort', sortOrderValue)
    searchParams.delete('y')

    history.push({
      // Blow away the page indicator when we change direction
      pathname: `/${searchTerm}`,
      search: searchParams.toString(),
    })
  }

  return (
    <Fragment>
      <Container component="main" maxWidth="sm">
        <div className={classes.root}>
          {/* marginTop to add padding for TimelineScrubber being position: fixed */}
          <Typography component="a" variant="h1" href="/" style={{ textDecoration: 'none', marginTop: 25 }}>
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
                  const input: HTMLInputElement | null = form.elements.namedItem('search') as HTMLInputElement
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
                  inputRef={textInput}
                  inputProps={{
                    name: 'search',
                    enterKeyHint: 'search',
                    'aria-label': 'search trove',
                  }}
                  defaultValue={searchTerm}
                  onBlur={(e) => {
                    // This allows the user to type a thing, tap on the sort order button, and then choose an option and have it all work
                    // Without this, the text entered into the field is lost (set to null) once the user clicks the sort order button.
                    const input: HTMLInputElement | null = e.target as HTMLInputElement
                    if (input !== null && input.value.length > 0) {
                      setSearchTerm(input.value)
                    }

                    history.push(`/${input.value}`)
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton type="submit" color="primary" aria-label="submit search field">
                        <ImageSearchTwoToneIcon />
                      </IconButton>
                      <SortOrderToggleMenu sortOrder={sortOrder} onSortChange={onSortOrderChange} />
                      <IconButton
                        type="button"
                        color="default"
                        aria-label="clear search field"
                        onClick={() => {
                          if (textInput !== null && textInput.current !== null) {
                            textInput.current.value = ''
                            textInput.current.focus()
                          }
                        }}
                      >
                        <ClearTwoToneIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Paper>
            </Grid>

            {/* marginTop to add space below the emoji icon */}
            <Grid container style={{ marginTop: 25, marginBottom: 25 }}>
              <Grid item style={{ width: '100%' }}>
                {searchTerm !== null && (
                  <PhotoListing
                    searchTerm={searchTerm}
                    searchYear={searchYear}
                    sortOrder={sortOrder}
                    page={urlPageParam}
                    onChoosePhoto={setGalleryPhotos}
                  />
                )}

                {searchTerm !== null && sortOrder === TroveSortOrder.DATE_ASC && (
                  <TimelineScrubber searchTerm={searchTerm} onDateChange={onDateChange} />
                )}

                {galleryPhotos !== null && galleryPhotos.photos.length > 0 && (
                  <PhotoGallery galleryPhotos={galleryPhotos} onClose={onCloseGallery} />
                )}
              </Grid>
            </Grid>

            <Grid container style={{ marginTop: 25 }}>
              <Grid item xs>
                <Link href="https://trove.nla.gov.au/" variant="overline" display="block" align="center">
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

export default Home
