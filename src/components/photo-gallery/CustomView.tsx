import { makeStyles } from '@material-ui/core'
import React from 'react'

// This was a WIP to see if we could work around the iOS PWA bug (can't long press to share images use the native share sheet).
// The idea was we'd use onClick to trigger the share sheet with navigator.share(), but that doesn't recognise it's an image (No "Add to Photos").
// Further testing suggests this is an iOS thing: You have to go directly to the JPEG url to get it to recognise it as a shareable image.
// Further testing:
// Can we share the image as a file object to trigger the desired functionality? (c.f. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

// CustomView component example taken from here:
// https://github.com/jossmac/react-images/issues/292

// Pass to <Carousel components={{ View: CustomView }} ... />

const useStyles = makeStyles({
  container: {
    height: 'auto',
    maxHeight: '100vh',
    maxWidth: '100%',
    userSelect: 'none',
  },
  image: {
    width: '100%',
    height: 'auto',
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomView = (props: any) => {
  const classes = useStyles()
  const { data } = props

  const onClick = () => {
    const shareData = {
      title: data.caption,
      url: data.source.regular,
    }

    if (navigator.canShare !== undefined && navigator.canShare(shareData) === true && navigator.share !== undefined) {
      navigator.share(shareData)
      // .then(() => console.log('Successful share! 🎉'))
      // .catch((err) => console.error(err))
    }
  }

  return (
    <div className={classes.container} onClick={onClick} onKeyPress={onClick} role="button" tabIndex={0}>
      <img src={data.source.regular} alt={data.caption} className={classes.image} />
    </div>
  )
}

export default React.memo(CustomView)
