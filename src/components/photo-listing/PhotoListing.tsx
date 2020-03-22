import { Button, Typography } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import Gallery from 'react-grid-gallery'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { fetchTrovePhotos } from '../../api/actions'
import { TroveWork, TroveWorkPhoto } from '../../api/types'
import { EmptyState } from '../../shared/empty-state/EmptyState'

type PhotoListingProps = {
  searchTerm: string
}

// const useStyles = makeStyles(theme => ({
//
// }))

const gutter = 2

const GalleryDiv = (props: any) => (
  <div
    style={{
      overflow: 'hidden',
      marginLeft: -gutter,
      marginRight: -gutter,
      display: 'none',
      // height: '200px',
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
)

const Image = (props: any) => (
  <div
    style={{
      // backgroundColor: '#eee',
      boxSizing: 'border-box',
      float: 'left',
      margin: gutter,
      overflow: 'hidden',
      paddingBottom: '16%',
      position: 'relative',
      width: `calc(50% - ${gutter * 2}px)`,
      height: `calc(50% - ${gutter * 2}px)`,

      ':hover': {
        opacity: 0.9,
      },
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
)

const PhotoListing: React.FC<PhotoListingProps> = ({ searchTerm }) => {
  // const classes = useStyles()

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
                  {work.issued} ({work.contributor})
                </Typography>
                <div
                  style={{
                    display: 'block',
                    minHeight: '1px',
                    width: '100%',
                    // border: '1px solid #ddd',
                    overflow: 'auto',
                  }}
                >
                  <Gallery
                    enableLightbox={false}
                    enableImageSelection={false}
                    onClickThumbnail={(index: number) => {
                      setLightboxPhotos({
                        photoIndex: index,
                        photos: work.photos!,
                      })
                    }}
                    images={work.photos!.map(item => ({
                      src: item.fullsize_url,
                      // thumbnail: item.thumbnail_url,
                      thumbnail: item.fullsize_url,
                      thumbnailWidth: 756,
                      thumbnailHeight: 760,
                    }))}
                  />
                </div>
                {/* <GalleryDiv>
                {work.photos!.map((item, index) => (
                  <Image
                    key={item.thumbnail_url}
                    onClick={() =>
                      setLightboxPhotos({
                        photoIndex: index,
                        photos: work.photos!,
                      })
                    }
                  >
                    <img
                      alt={item.caption}
                      src={item.fullsize_url}
                      style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        maxWidth: '100%',
                      }}
                    />
                  </Image>
                ))}
              </GalleryDiv>
              <br /> */}
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
                  download: item.fullsize_url,
                  fullscreen: item.fullsize_url,
                  regular: item.fullsize_url,
                  thumbnail: item.thumbnail_url,
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
