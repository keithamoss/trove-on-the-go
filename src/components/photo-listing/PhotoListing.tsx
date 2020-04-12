import { Button, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { Fragment, useState } from 'react'
import Gallery from 'react-grid-gallery'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { TrovePhotoMetadata, TroveWork } from '../../api/types'
import { EmptyState } from '../../shared/empty-state/EmptyState'
import { useTroveAPI } from './useTroveAPIHook'

type PhotoListingProps = {
  searchTerm: string
}

const useStyles = makeStyles({
  galleryContainer: {
    display: 'block',
    minHeight: '1px',
    width: '100%',
    overflow: 'auto',
  },
})

const PhotoListing: React.FC<PhotoListingProps> = ({ searchTerm }) => {
  const classes = useStyles()

  const {
    state: { isLoading, hasMoreResults, response },
    getNextPage,
  } = useTroveAPI(searchTerm)

  const [galleryPhotos, setGalleryPhotos] = useState<
    | {
        photoIndex: number
        photos: TrovePhotoMetadata[]
      }
    | undefined
  >()

  return (
    <Fragment>
      <h3>
        photos.length:{' '}
        {`${response != null ? response.photos.length : undefined}`}
      </h3>

      {response !== null && response.photos.length === 0 && <EmptyState />}

      {response !== null &&
        response.photos
          .filter(work => work.photos.length > 0)
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
                      setGalleryPhotos({
                        photoIndex: index,
                        photos: work.photos,
                      })
                    }}
                    images={work.photos.map(photo => ({
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
                    setGalleryPhotos({
                      photoIndex: 0,
                      photos: work.photos!,
                    })
                  }
                >
                  Open Photo Gallery
                </Button>
                <Button
                  color="secondary"
                  aria-label="open-link"
                  href={work.troveUrl}
                  target="_blank"
                >
                  View on Trove
                </Button>
                <br />
                <br />
              </div>
            </Fragment>
          ))}

      {response !== null && hasMoreResults && (
        <Grid container direction="row" justify="center">
          <Button
            variant="outlined"
            color="primary"
            disabled={isLoading}
            onClick={() => getNextPage()}
          >
            load more
          </Button>
        </Grid>
      )}

      <ModalGateway>
        {galleryPhotos !== undefined && galleryPhotos.photos.length > 0 && (
          <Modal
            onClose={() =>
              setGalleryPhotos({
                photoIndex: 0,
                photos: [],
              })
            }
          >
            <Carousel
              // components={{ FooterCaption }}
              // formatters={{ getAltText }}
              currentIndex={galleryPhotos.photoIndex}
              frameProps={{ autoSize: 'height' }}
              views={galleryPhotos.photos.map(photo => ({
                caption: photo.caption,
                source: {
                  download: photo.images.original.url,
                  fullscreen: photo.images.original.url,
                  regular: photo.images.original.url,
                  thumbnail: photo.images.thumbnail.url,
                },
              }))}
            />
          </Modal>
        )}
      </ModalGateway>
    </Fragment>
  )
}

export default React.memo(PhotoListing)
