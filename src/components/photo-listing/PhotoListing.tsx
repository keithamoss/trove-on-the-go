import { Button, makeStyles, Typography } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import Carousel, { Modal, ModalGateway } from 'react-images'
import { fetchTrovePhotos } from '../../api/actions'
import { TroveWork, TroveWorkPhoto } from '../../api/types'
import { EmptyState } from '../../shared/empty-state/EmptyState'

type PhotoListingProps = {
  searchTerm: string
}

const useStyles = makeStyles(theme => ({
  card: {
    // maxWidth: '80%',
    marginBottom: 15,
  },
  media: {
    height: 400,
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
}))

const gutter = 2

const Gallery = (props: any) => (
  <div
    style={{
      overflow: 'hidden',
      marginLeft: -gutter,
      marginRight: -gutter,
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
      width: `calc(25% - ${gutter * 2}px)`,

      ':hover': {
        opacity: 0.9,
      },
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
)

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
      // console.log(data)
    })()
  }, [searchTerm, setIsEmpty, setPhotos])

  console.log('lightboxPhotos', lightboxPhotos)

  // photos.forEach(async (work: TroveWork) => {
  //   if ('photo' in work) {
  //     const response = await axios.get(work.photo!.thumbnail_url)
  //     console.log(work.photo!.thumbnail_url, response)
  //   }
  // })

  return (
    <Fragment>
      {isEmpty && <EmptyState />}
      {!isEmpty &&
        photos
          .filter(work => work.photos!.length > 0)
          .filter((work, index) => index === 1)
          .map((work: TroveWork) => {
            return (
              <Fragment key={work.id}>
                <Typography gutterBottom variant="h6" component="h6">
                  {work.title}
                </Typography>
                <Gallery>
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
                        // src={item.thumbnail_url}
                        src={item.fullsize_url}
                        style={{
                          cursor: 'pointer',
                          position: 'absolute',
                          maxWidth: '100%',
                        }}
                      />
                    </Image>
                  ))}
                </Gallery>
                <br />
                <Button
                  // variant="contained"
                  color="primary"
                  aria-label="open"
                  href={work.troveUrl}
                  target="_blank"
                >
                  Open Trove
                </Button>
              </Fragment>
            )
          })}

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
              currentIndex={lightboxPhotos.photoIndex}
              // formatters={{ getAltText }}
              frameProps={{ autoSize: 'height' }}
              views={lightboxPhotos.photos.map(item => ({
                caption: item.caption,
                // source: item.fullsize_url,
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
      {/* {!isEmpty &&
        photos.length > 0 &&
        'photos' in photos[0] &&
        photos[0].photos !== undefined && (
          <Carousel
            views={photos[0].photos.map(item => {
              return {
                caption: 'Foobar',
                source: item.thumbnail_url,
                // source: {
                //   thumbnail: item.thumbnail_url,
                // },
                // {
                //   caption?: string | Node,
                //   source: string | {
                //     download?: string,
                //     fullscreen?: string,
                //     regular: string,
                //     thumbnail?: string,
                //   },
                // }
              }
            })}
          />
        )} */}
      {/* {!isEmpty &&
        photos.map(
          (work: TroveWork) => {
            <div>{work.title}</div>
          // <GridList
          //   key={work.id}
          //   // cellHeight={160}
          //   className={classes.gridList}
          //   cols={4}
          // >
          //   <GridListTile key="Subheader" cols={3} style={{ height: 'auto' }}>
          //     <ListSubheader component="div">{work.title}</ListSubheader>
          //   </GridListTile>
          //   {work.photos !== undefined &&
          //     work.photos
          //       // .filter(
          //       //   item => item.type === 'url' && item.linktype === 'restricted'
          //       // )
          //       .map(item => (
          //         <GridListTile key={item.thumbnail_url} cols={2}>
          //           <img src={item.thumbnail_url} alt={'item.linktext'} />
          //         </GridListTile>
          //         // <GridListitem key={item.value} cols={item.cols || 1}>
          //         //   <img src={item.img} alt={item.title} />
          //         // </GridListTile>
          //       ))}
          // </GridList>

          // <Card
          //   key={work.id}
          //   className={classes.card}
          //   variant="outlined"
          //   // href={work.troveUrl}
          //   // target="_blank"
          //   onClick={(event: any) => {
          //     console.log(event, event.target)
          //   }}
          // >
          //   <CardActionArea>
          //     {'photo' in work && (
          //       <CardMedia
          //         className={classes.media}
          //         component="img"
          //         alt="Contemplative Reptile"
          //         image={work.photo?.fullsize_url}
          //         title="Contemplative Reptile"
          //       />
          //     )}
          //     <CardContent>
          //       <Typography gutterBottom variant="h5" component="h5">
          //         {work.title}
          //       </Typography>
          //       <Typography variant="body2" color="textSecondary" component="p">
          //         {work.issued} ({work.contributor})
          //       </Typography>
          //     </CardContent>
          //   </CardActionArea>
          //   <CardActions>
          //     <Button
          //       variant="contained"
          //       color="primary"
          //       aria-label="open"
          //       href={work.troveUrl}
          //       target="_blank"
          //     >
          //       Open Trove
          //     </Button>
          //     <IconButton aria-label="share">
          //       <ShareIcon />
          //     </IconButton>
          //   </CardActions>
          // </Card>
        }) */}
    </Fragment>
  )
}

export default React.memo(PhotoListing)
