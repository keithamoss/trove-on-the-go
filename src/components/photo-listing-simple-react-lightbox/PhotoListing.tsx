import { Button, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React from 'react'
import Gallery from 'react-grid-gallery'
import SimpleReactLightbox, { SRLWrapper, useLightbox } from 'simple-react-lightbox'
import { TroveWork } from '../../api/types'
import EmptyState from '../../shared/empty-state/EmptyState'
import ErrorState from '../../shared/error-state/ErrorState'
import PhotoPlaceholder from '../../shared/PhotoPlaceholder'
import useTroveAPI from '../photo-listing/useTroveAPIHook'

// This is a WIP.
// Simple-React-Ligthbox is actively maintained (unlike react-grid-gallery and react-images)
// This partially works - it needs some cleaning up of the code and the following issues addressed:
// 1. Make the photos take up as much of the width or height of the screen as possible
// 2. If we're reliant on injecting our own buttons/onClick handlers, a way to do that.

// If using this, the following CSS is required
/*
// This is a hacky fix for PWA mode having a gap below the overlay the bottom.
// Posisbly we could actually fix the calc() logic that's used, rather than falling back on this.
#SRLLightbox {
  height: 100vh;
}

.SRLElementWrapper {
  height: 100% !important;
}
*/

type PhotoListingProps = {
  searchTerm: string
  page: string | undefined
  // onChoosePhoto: React.Dispatch<React.SetStateAction<GalleryPhotos | null>>
  onChoosePhoto: any
}

type PhotoListingProps2 = {
  work: any
}

const useStyles = makeStyles({
  galleryContainer: {
    display: 'block',
    minHeight: '1px',
    width: '100%',
    overflow: 'auto',
  },
})

const PhotoListing: React.FC<PhotoListingProps> = ({ searchTerm, page, onChoosePhoto }: PhotoListingProps) => {
  const classes = useStyles()

  const {
    state: { isLoading, isError, hasMoreResults, response },
    getNextPage,
  } = useTroveAPI(searchTerm, page)

  // const { openLightbox } = useLightbox()

  return (
    <React.Fragment>
      {isError === true && <ErrorState />}

      {response !== null && response.photos.length === 0 && <EmptyState />}

      {response !== null &&
        response.photos
          .filter((work) => work.photos.length > 0)
          .map((work: TroveWork) => (
            <React.Fragment key={work.id}>
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
                  <SimpleReactLightbox>
                    <GalleryBoxMemo work={work} />
                  </SimpleReactLightbox>
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
            </React.Fragment>
          ))}

      {response !== null && hasMoreResults && (
        <Grid container direction="row" justify="center">
          <Button variant="outlined" color="primary" disabled={isLoading} onClick={() => getNextPage()}>
            load more
          </Button>
        </Grid>
      )}

      {isLoading === true && (
        <React.Fragment>
          <PhotoPlaceholder />
          <PhotoPlaceholder />
          <PhotoPlaceholder />
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

const GalleryBox: React.FC<PhotoListingProps2> = ({ work }: PhotoListingProps2) => {
  const { openLightbox } = useLightbox()

  return (
    <React.Fragment>
      <Gallery
        enableLightbox={false}
        enableImageSelection={false}
        rowHeight={165}
        // onClickImage={() => {}}
        onClickThumbnail={() => {
          openLightbox()
        }}
        images={work.photos.map((photo: any) => ({
          src: photo.images.original.url,
          thumbnail: photo.images.thumbnail.url,
          thumbnailWidth: photo.images.thumbnail.width,
          thumbnailHeight: photo.images.thumbnail.height,
          caption: photo.caption,
        }))}
      />

      <SRLWrapper
        options={{
          settings: {
            lightboxTransitionSpeed: 0,
            slideAnimationType: 'both',
            // slideSpringValues: [1200, 100],
            slideTransitionSpeed: 0.025,
            slideTransitionTimingFunction: 'easeIn',
            // disableWheelControls: true,
            disablePanzoom: true,
          },
          buttons: {
            showAutoplayButton: false,
            showThumbnailsButton: false,
            showFullscreenButton: false,
          },
          thumbnails: {
            showThumbnails: true,
          },
        }}
        // callbacks={{
        //   onLightboxClosed: () => {
        //     console.log('onLightboxClosed')
        //     // onClose()
        //   },
        // }}
        elements={work.photos.map((photo: any) => ({
          src: photo.images.original.url,
          caption: photo.caption,
          // caption: <div>{photo.caption}</div>,
          width: photo.images.original.width,
          height: photo.images.original.height,
          showControls: true,
          // width: 'auto',
          // height: 'auto',
        }))}
      />
    </React.Fragment>
  )
}

const GalleryBoxMemo = React.memo(GalleryBox)

// const _MyGallery = (props: any) => (
//   <SimpleReactLightbox>
//     <PhotoListing {...props} />
//   </SimpleReactLightbox>
// )

export default React.memo(PhotoListing)
