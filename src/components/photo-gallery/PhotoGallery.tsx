import React from 'react'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { TrovePhotoMetadata } from '../../api/types'

export interface GalleryPhotos {
  photoIndex: number
  photos: TrovePhotoMetadata[]
}

type PhotoGalleryProps = {
  galleryPhotos: GalleryPhotos
  onClose: Function
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ galleryPhotos, onClose }) => {
  return (
    <ModalGateway>
        {galleryPhotos.photos !== undefined && galleryPhotos.photos.length > 0 && (
          <Modal
            onClose={() => onClose()}
          >
            <Carousel
              // components={{ FooterCaption }}
              // formatters={{ getAltText }}
              currentIndex={galleryPhotos.photoIndex}
              frameProps={{ autoSize: 'width' }}
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
  )
}

export default React.memo(PhotoGallery)
