import React from 'react'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { TrovePhotoMetadata } from '../../api/types'
import CarouselHeader from './CarouselHeader'

export interface GalleryPhotos {
  photoIndex: number
  photos: TrovePhotoMetadata[]
}

type PhotoGalleryProps = {
  galleryPhotos: GalleryPhotos
  onClose: () => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ galleryPhotos, onClose }: PhotoGalleryProps) => (
  <ModalGateway>
    {galleryPhotos.photos !== undefined && galleryPhotos.photos.length > 0 && (
      <Modal onClose={() => onClose()}>
        <Carousel
          // Force the caption to always show (hidden by default on mobile)
          // https://github.com/jossmac/react-images/issues/335
          styles={{
            footer: (base) => ({
              ...base,
              opacity: 1,
              // Seemingly not required to work around this issue?
              // transform: 'translateY(0px)',
              // WebkitTransform: 'translateY(0px)',
            }),
          }}
          components={{ Header: CarouselHeader }}
          // components={{ FooterCaption }}
          // formatters={{ getAltText }}
          currentIndex={galleryPhotos.photoIndex}
          // This breaks the CSS of the frame
          // frameProps={{ autoSize: 'width' }}
          views={galleryPhotos.photos.map((photo: TrovePhotoMetadata) => ({
            caption: photo.caption,
            source: {
              download: photo.images.original.url,
              fullscreen: photo.images.original.url,
              regular: photo.images.original.url,
              thumbnail: photo.images.thumbnail.url,
            },
            metadata: {
              catalogueURL: photo.catalogueURL,
            },
          }))}
        />
      </Modal>
    )}
  </ModalGateway>
)

export default React.memo(PhotoGallery)
