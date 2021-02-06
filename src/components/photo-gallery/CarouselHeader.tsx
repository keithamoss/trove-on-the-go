import { Close, Fullscreen, FullscreenExit, GetAppOutlined, ShopOutlined } from '@material-ui/icons'
import React from 'react'
import { getFilenameFromPath } from '../../shared/utils'

// Cobbled together from the source at
// https://github.com/jossmac/react-images/blob/859ef021776186052bb9e46b208c28f51666c776/src/components/Header.js

// @TODO Replace with a more robust carousel that lets us inject our own custom buttons

const headerBaseClassName = 'header'

const openURL = (url: string) => window.open(url, '_blank')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CarouselHeader: React.FC<any> = (props: any) => {
  const { components, getStyles, getCloseLabel, getFullscreenLabel, isModal, modalProps, currentView } = props

  if (!isModal) return null

  const { allowFullscreen, isFullscreen, onClose, toggleFullscreen } = modalProps
  const FsIcon = isFullscreen ? FullscreenExit : Fullscreen
  const { CloseButton, FullscreenButton } = components
  const state = { isFullscreen, isModal }

  return (
    <div
      className="react-images__header react-images__header--isModal"
      style={{
        ...getStyles(headerBaseClassName, props),
        background: 'linear-gradient(rgba(0,0,0,0.33), rgba(0,0,0,0))',
      }}
      //   Suppress React warnings. Doesn't seem to break anything...
      //   {...innerProps}
    >
      <span />
      <span>
        <CloseButton
          getStyles={getStyles}
          innerProps={{
            onClick: () => openURL(currentView.metadata.catalogueURL),
            title: 'Order a copy of the original scan from SLWA',
          }}
        >
          <ShopOutlined fontSize="large" />
        </CloseButton>
        <CloseButton
          getStyles={getStyles}
          innerProps={{
            onClick: () =>
              openURL(
                `${process.env.REACT_APP_TROVE_API_URL}/slwa_image_builder?slwaItemId=${getFilenameFromPath(
                  currentView.metadata.catalogueURL
                )}`
              ),
            title: 'Download higher resolution photograph',
          }}
        >
          <GetAppOutlined fontSize="large" />
        </CloseButton>
        {allowFullscreen ? (
          <FullscreenButton
            getStyles={getStyles}
            innerProps={{
              onClick: toggleFullscreen,
              title: getFullscreenLabel(state),
            }}
          >
            <FsIcon fontSize="large" />
          </FullscreenButton>
        ) : null}
        <CloseButton
          getStyles={getStyles}
          innerProps={{
            onClick: onClose,
            title: getCloseLabel(state),
          }}
        >
          <Close fontSize="large" />
        </CloseButton>
      </span>
    </div>
  )
}

export default CarouselHeader
