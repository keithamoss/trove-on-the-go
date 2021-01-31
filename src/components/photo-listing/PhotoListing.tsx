import { Button, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { Fragment } from 'react'
import Gallery from 'react-grid-gallery'
import { TroveWork } from '../../api/types'
import EmptyState from '../../shared/empty-state/EmptyState'
import ErrorState from '../../shared/error-state/ErrorState'
import PhotoPlaceholder from '../../shared/PhotoPlaceholder'
import { GalleryPhotos } from '../photo-gallery/PhotoGallery'
import useTroveAPI from './useTroveAPIHook'

type PhotoListingProps = {
  searchTerm: string
  searchYear: number | null
  page: string | undefined
  onChoosePhoto: React.Dispatch<React.SetStateAction<GalleryPhotos | null>>
}

const useStyles = makeStyles({
  galleryContainer: {
    display: 'block',
    minHeight: '1px',
    width: '100%',
    overflow: 'auto',
  },
})

const PhotoListing: React.FC<PhotoListingProps> = ({
  searchTerm,
  searchYear,
  page,
  onChoosePhoto,
}: PhotoListingProps) => {
  const classes = useStyles()

  const {
    state: { isLoading, isError, hasMoreResults, response },
    getNextPage,
  } = useTroveAPI(searchTerm, searchYear, page)

  return (
    <Fragment>
      {isError === true && <ErrorState />}

      {response !== null && response.photos.length === 0 && <EmptyState />}

      {response !== null &&
        response.photos
          .filter((work) => work.photos.length > 0)
          .map((work: TroveWork) => (
            <Fragment key={work.id}>
              <div>
                <Typography gutterBottom variant="h6" component="h6">
                  {work.title}
                </Typography>
                <Typography gutterBottom variant="caption">
                  {work.issued}
                  {work.contributor !== undefined && work.contributor.length > 0
                    ? ` (${work.contributor.join(', ')})`
                    : undefined}
                </Typography>
                <div className={classes.galleryContainer}>
                  <Gallery
                    enableLightbox={false}
                    enableImageSelection={false}
                    rowHeight={165}
                    onClickThumbnail={(index: number) => {
                      onChoosePhoto({
                        photoIndex: index,
                        photos: work.photos,
                      })
                    }}
                    images={work.photos.map((photo) => ({
                      src: photo.images.original.url,
                      thumbnail: photo.images.thumbnail.url,
                      thumbnailWidth: photo.images.thumbnail.width,
                      thumbnailHeight: photo.images.thumbnail.height,
                    }))}
                  />
                </div>
                <Button
                  color="primary"
                  aria-label="view-photo-gallery"
                  onClick={() =>
                    onChoosePhoto({
                      photoIndex: 0,
                      photos: work.photos,
                    })
                  }
                >
                  Open Photo Gallery
                </Button>
                <Button aria-label="open-link" href={work.troveUrl} target="_blank">
                  View on Trove
                </Button>
                <br />
                <br />
              </div>
            </Fragment>
          ))}

      {response !== null && hasMoreResults && isLoading === false && (
        <Grid container direction="row" justify="center">
          <Button variant="outlined" color="primary" onClick={() => getNextPage()}>
            load more
          </Button>
        </Grid>
      )}

      {isLoading === true && (
        <Fragment>
          <PhotoPlaceholder />
          <PhotoPlaceholder />
          <PhotoPlaceholder />
        </Fragment>
      )}
    </Fragment>
  )
}

export default React.memo(PhotoListing)
