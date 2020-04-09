import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { Fragment, useState } from 'react'
import Gallery from 'react-grid-gallery'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { fetchTrovePhotos } from '../../api/actions'
import { TroveWork, TroveWorkPhoto } from '../../api/types'
import { EmptyState } from '../../shared/empty-state/EmptyState'

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

  const [photos, setPhotos] = useState<TroveWork[]>([])
  const [lightboxPhotos, setLightboxPhotos] = useState<{
    photoIndex: number
    photos: TroveWorkPhoto[]
  }>({ photoIndex: 0, photos: [] })
  const [isEmpty, setIsEmpty] = useState(false)

  React.useEffect(() => {
    ;(async () => {
      const data = await fetchTrovePhotos(searchTerm)
      setIsEmpty(data.length === 0)
      setPhotos(data)
    })()
  }, [searchTerm, setIsEmpty, setPhotos])

  return (
    <Fragment>
      {isEmpty && <EmptyState />}

      {!isEmpty &&
        photos
          .filter(work => work.photos!.length > 0)
          // .filter((work, index) => index <= 2)
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
                      setLightboxPhotos({
                        photoIndex: index,
                        photos: work.photos!,
                      })
                    }}
                    images={work.photos!.map(item => ({
                      src: item.photo.original.url,
                      thumbnail: item.photo.thumbnail.url,
                      thumbnailWidth: item.photo.thumbnail.width,
                      thumbnailHeight: item.photo.thumbnail.height,
                    }))}
                  />
                </div>
                <Button
                  color="primary"
                  aria-label="view-photo-gallery"
                  onClick={() =>
                    setLightboxPhotos({
                      photoIndex: 0,
                      photos: work.photos!,
                    })
                  }
                >
                  View Photos
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

      <ModalGateway>
        {lightboxPhotos.photos.length > 0 && (
          <Modal
            onClose={() =>
              setLightboxPhotos({
                photoIndex: 0,
                photos: [],
              })
            }
          >
            <Carousel
              // components={{ FooterCaption }}
              // formatters={{ getAltText }}
              currentIndex={lightboxPhotos.photoIndex}
              frameProps={{ autoSize: 'height' }}
              views={lightboxPhotos.photos.map(item => ({
                caption: item.caption,
                source: {
                  download: item.photo.original.url,
                  fullscreen: item.photo.original.url,
                  regular: item.photo.original.url,
                  thumbnail: item.photo.thumbnail.url,
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
