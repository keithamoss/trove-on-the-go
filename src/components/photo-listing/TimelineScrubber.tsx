import { Box, makeStyles, Slider, Theme, ThemeProvider, Typography, withStyles, withTheme } from '@material-ui/core'
import ValueLabel from '@material-ui/core/Slider/ValueLabel'
import React, { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { TroveAPIWorkDateCount } from '../../api/types'
import useTroveAPI from './useTroveDateAPIHook'

// export interface GalleryPhotos {
//   photoIndex: number
//   photos: TrovePhotoMetadata[]
// }

type TimelineScrubberProps = {
  searchTerm: string
  // searchYear: number | null
  onDateChange: any
  theme: Theme
}

// const themeRTL = createMuiTheme({
//   direction: 'rtl',
// })
// console.log('themeRTL', themeRTL)

// eslint-disable-next-line @typescript-eslint/no-shadow
const useStyles = makeStyles((theme: Theme) => ({
  stickToBottom: {
    width: '100%',
    height: 56,
    position: 'fixed',
    padding: '0px 20px 0px 20px',
    [theme.breakpoints.up('md')]: {
      padding: '5px 20px 0px 20px',
    },
    top: 0,
    left: 0,
    justifyContent: 'center',
    // backgroundColor: '#424242',
    backgroundColor: `${theme.palette.background.default}`,
  },
  labelLeft: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    // color: 'rgba(255, 255, 255, 0.7)',
    // fontSize: '12px',
  },
  labelRight: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    // color: 'rgba(255, 255, 255, 0.7)',
    // fontSize: '12px',
  },
}))

// const iOSBoxShadow = '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)'

// const IOSSlider = withStyles({
//   // root: (props: any) => ({
//   //   '& .MuiSlider-markLabel': {
//   //     display: 'none',
//   //     // display: props.min,
//   //   },
//   //   '& .MuiSlider-markLabel[data-index="0"]': {
//   //     display: 'block',
//   //     transform: 'translateX(0%)',
//   //   },
//   //   '& .MuiSlider-markLabel[data-index="$props.min"]': {
//   //     display: 'block',
//   //     transform: 'translateX(-100%)',
//   //   },
//   // }),
//   // root: {
//   //   color: '#3880ff',
//   //   height: 2,
//   //   padding: '15px 0',
//   // },
//   // thumb: {
//   //   height: 28,
//   //   width: 28,
//   //   backgroundColor: "#fff",
//   //   boxShadow: iOSBoxShadow,
//   //   marginTop: -14,
//   //   marginLeft: -14,
//   //   "&:focus, &:hover, &$active": {
//   //     boxShadow:
//   //       "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)",
//   //     // Reset on touch devices, it doesn't add specificity
//   //     "@media (hover: none)": {
//   //       boxShadow: iOSBoxShadow
//   //     }
//   //   }
//   // }
//   // active: {}
//   // valueLabel: {
//   //   left: 'calc(-50% + 12px)',
//   //   top: -22,
//   //   '& *': {
//   //     background: 'transparent',
//   //     color: '#000',
//   //   },
//   // },
//   // track: {
//   //   height: 2,
//   // },
//   // rail: {
//   //   height: 2,
//   //   opacity: 0.5,
//   //   backgroundColor: '#bfbfbf',
//   // },
//   // mark: {
//   //   backgroundColor: '#bfbfbf',
//   //   height: 8,
//   //   width: 1,
//   //   marginTop: -3,
//   // },
//   mark: {
//     // backgroundColor: "#bfbfbf",
//     height: 8,
//     width: 1,
//     marginTop: -3,
//     marginLeft: -1,
//   },
//   markActive: {
//     opacity: 1,
//     backgroundColor: 'currentColor',
//   },
// })(Slider)

/**
 * Normalizes a value from one range (current) to another (new).
 *
 * @param  { Number } val    //the current value (part of the current range).
 * @param  { Number } minVal //the min value of the current value range.
 * @param  { Number } maxVal //the max value of the current value range.
 * @param  { Number } newMin //the min value of the new value range.
 * @param  { Number } newMax //the max value of the new value range.
 *
 * @returns { Number } the normalized value.
 */
const normalizeBetweenTwoRanges = (val: number, minVal: number, maxVal: number, newMin: number, newMax: number) => {
  return newMin + ((val - minVal) * (newMax - newMin)) / (maxVal - minVal)
}

const getDefaultSearchYear = (query: URLSearchParams): number | null => {
  if (query.get('y') !== null) {
    return Number.parseInt(query.get('y')!, 10)
  }

  return null
}

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const generateCSS = (props: any) => {
  const counts: number[] = props.worksPerYear.map((item: any) => item.count)

  // color: rgba(144, 202, 249, ${(item.count - Math.min(...counts)) / (Math.max(...counts) - Math.min(...counts))});
  const css = props.worksPerYear
    .map(
      (item: any, index: number) => `& span[class^=MuiSlider-mark-][data-index='${index}'] {
        color: rgba(144, 202, 249, ${normalizeBetweenTwoRanges(
          item.count,
          Math.min(...counts),
          Math.max(...counts),
          0.3,
          1
        )});
      }`
    )
    .join('\n')
  // console.log(css)
  return css
}

const IOSSlider1Point5 = (props: any) => {
  const { worksPerYear, ...other } = props
  return <Slider {...other} />
}

const IOSSlider2 = styled(IOSSlider1Point5)`
  & span[class^='MuiSlider-mark-'] {
    height: 8px;
    width: 1px;
    margin-top: -3px;
    margin-left: -1px;
  }
  & span[class^='MuiSlider-markActive-'] {
    opacity: 1;
    background-color: 'currentColor';
  }
  & span[class^='MuiSlider-markLabel-'] {
    display: none;
  }
  /* & span[class^='MuiSlider-markLabel-'][data-index='0'] {
    display: block;
  }
  & span[class^='MuiSlider-markLabel-'][data-index='${(props: any) => props.marks.length - 1}'] {
    display: block;
    right: 0% !important;
  } */
  ${(props: any) => generateCSS(props)}
`

const IOSSlider3 = (props: any) => {
  return <IOSSlider2 {...props} />
}

function valuetext(value: any) {
  return `${value}°C`
}

function valueLabelFormat(value: any) {
  // console.log('valueLabelFormat', value)
  // return `${value}°C`
  if (isNaN(value)) {
    return undefined
  }
  return value
  // return marks.findIndex((mark) => mark.value === value) + 1;
}

// https://github.com/mui-org/material-ui/issues/16547
const StyledValueLabel = withStyles((theme: Theme) => ({
  offset: {
    top: '-17px',
    transform: 'rotate(-180deg) scale(1) translateY(-10px) !important',
    // left: (props: any) => (props.index === 0 ? 'calc(-50% + -20px)' : 'calc(-50% + 12px)'),
  },
  thumb: {
    // backgroundColor: '#90caf9',
    backgroundColor: `${theme.palette.primary.light}`,
    // transform: (props: any) => (props.index === 0 ? 'rotate(-90deg)' : 'rotate(0deg)'),
  },
  circle: {
    // backgroundColor: '#90caf9',
    backgroundColor: `${theme.palette.primary.light}`,
    // transform: (props: any) => (props.index === 0 ? 'rotate(-90deg)' : 'rotate(0deg)'),
  },
  label: {
    transform: 'rotate(-135deg)',
    // transform: (props: any) => (props.index === 0 ? 'rotate(90deg)' : 'rotate(0deg)'),
  },
}))(ValueLabel)

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  searchTerm,
  // searchYear,
  onDateChange,
  theme,
}: TimelineScrubberProps) => {
  // const TimelineScrubber: React.FC<any> = () => {
  const classes = useStyles()

  console.log('! searchTerm', searchTerm)

  // console.log('TimelineScrubber.searchYear', searchYear)

  // const marks = [
  //   {
  //     value: 0,
  //     // label: '0°C',
  //   },
  //   {
  //     value: 20,
  //     // label: '20°C',
  //   },
  //   {
  //     value: 21,
  //   },
  //   {
  //     value: 22,
  //   },
  //   {
  //     value: 23,
  //   },
  //   {
  //     value: 24,
  //   },
  //   {
  //     value: 34,
  //   },
  //   {
  //     value: 37,
  //     // label: '37°C',
  //   },
  //   {
  //     value: 100,
  //     // label: '100°C',
  //   },
  // ]

  // console.log('searchTerm', searchTerm)
  const {
    // state: { isLoading, isError, hasMoreResults, response },
    // state: { isLoading, isError, response },
    state: { isLoading, response },
    // getNextPage,
  } = useTroveAPI(searchTerm)
  console.log('response', response)
  console.log('isLoading', isLoading)

  const query = useQuery()
  console.log('Year in URL', query.get('y'))

  const [searchYearLocal, setSearchYearLocal] = React.useState<number | null>(getDefaultSearchYear(query))
  console.log('searchYearLocal', searchYearLocal)

  const [searchYearURL, setSearchYearURL] = React.useState<number | null>(getDefaultSearchYear(query))

  const [sliderIsChanging, setSliderIsChanging] = React.useState<boolean>(false)
  console.log('sliderIsChanging', sliderIsChanging)

  if (response === null) {
    console.log('( Bail and do not bother trying to render')
    return null
  }

  // console.log('isLoading', isLoading)
  // console.log('isError', isError)
  // console.log('response', response)

  const getMarks = () => {
    if (response !== null && worksPerYear !== null) {
      return worksPerYear.map((item: TroveAPIWorkDateCount) => {
        return {
          value: item.year,
          // label: item.year,
        }
      })
    }
    return []
  }

  let worksPerYear: TroveAPIWorkDateCount[] | null = null
  if (response !== null) {
    // console.log(response.worksPerYear[0])
    worksPerYear = response.worksPerYear.reverse()
    // console.log(worksPerYear[0])

    // console.log(getMarks())
    // console.log(marks)
  }

  // & .MuiSlider-markLabel[data-index='0'] {
  //   display: block;
  // }

  // let IOSSlider3 = <Fragment />
  // if (response !== null) {
  //   const counts: number[] = worksPerYear.map((item: any) => item.count)

  //   const css = worksPerYear.map(
  //     (item: any, index: number) => `& .MuiSlider-markLabel[data-index='${index}'] {
  //       display: block;
  //       color: rgba(144, 202, 249, ${
  //         (item.count - Math.min(...counts)) / (Math.max(...counts) - Math.min(...counts))
  //       }) !important;
  //     }`
  //   )
  //   console.log(css.join('\n'))
  //   console.log('counts', counts)
  //   console.log('min count', Math.min(...counts))
  //   console.log('max count', Math.max(...counts))

  //   IOSSlider3 = styled(IOSSlider2)`
  //     ${css}
  //   `
  //   console.log('IOSSlider3', IOSSlider3)
  // }

  // @TODO Look at using this technique to scale years in a non-linear fashion:
  // https://stackoverflow.com/questions/61792449/material-ui-slider-changing-values-using-scale

  // console.log('theme', theme)
  // https://github.com/mui-org/material-ui/issues/18690
  const newTheme = { ...theme, direction: 'rtl' }
  // console.log('newTheme', newTheme)

  if (query.get('y') != searchYearURL) {
    console.log('Setting searchYearURL', query.get('y') === null ? null : Number.parseInt(query.get('y')!, 10))
    setSearchYearURL(query.get('y') === null ? null : Number.parseInt(query.get('y')!, 10))
  }

  // This happens when the URL year has a value and it changes in resonse to onChangeCommitted OR when history() changes it
  if (sliderIsChanging === false && searchYearURL != searchYearLocal && searchYearURL !== null) {
    // if (sliderIsChanging === false && searchYearURL != searchYearLocal) {
    console.log('> Setting searchYearLocal from searchYearURL', searchYearURL)
    setSearchYearLocal(searchYearURL)
  }

  // # This is what lets us load the year from the URL when navigate history() changes it
  // if (response !== null && query.get('y') !== null && query.get('y') != searchYearLocal) {
  // if (response !== null && query.get('y') != searchYearLocal) {
  //   if (query.get('y')! === null && searchYearLocal === null) {
  //     console.log('# Set from URL to null')
  //     setSearchYearLocal(null)
  //     setSearchYearURL(null)
  //   } else if (searchYearURL != Number.parseInt(query.get('y')!, 10) && searchYearLocal !== null) {
  //     console.log('# Set from URL', Number.parseInt(query.get('y')!, 10))
  //     setSearchYearLocal(Number.parseInt(query.get('y')!, 10))
  //     setSearchYearURL(Number.parseInt(query.get('y')!, 10))
  //   }
  // }

  // if searchYear is null THEN SET from response
  // if (
  //   response !== null &&
  //   searchYearLocal === null &&
  //   response.range !== null &&
  //   response.range.max_year !== null &&
  //   searchYearURL !== null
  // ) {
  //   console.log('& Setting searchYearLocal from response')
  //   setSearchYearLocal(response.range.max_year)
  // }

  // This happens when we change search terms and there's no year selected yet
  // OR when we load a page with no year in the URL
  // searchYearLocal === null &&
  if (
    sliderIsChanging === false &&
    searchYearURL === null &&
    response !== null &&
    response.range !== null &&
    response.range.max_year !== null &&
    response.range.max_year != searchYearLocal
  ) {
    console.log(
      '^ No one has a good search year, so set it from the response from',
      searchYearLocal,
      'to',
      response.range.max_year
    )
    setSearchYearLocal(response.range.max_year)
  }

  // if (searchYear !== searchYearLocal) {
  //   setSearchYearLocal(searchYear)
  // }

  const onChange = (_event: any, value: any) => {
    // console.log('onChange', value)
    setSliderIsChanging(true)
    if (value != searchYearLocal) {
      console.log('$ Set search year from dragging the slider')
      setSearchYearLocal(value)
    }
  }
  // const onChangeDebounced = debounce(onChange, 50, { maxWait: 100 })

  const onChangeCommitted = (_event: any, value: any) => {
    setSliderIsChanging(false)
    onDateChange(_event, value)
  }

  return (
    <Fragment>
      {response !== null && response.range !== null && worksPerYear !== null && (
        <Box className={classes.stickToBottom}>
          <Fragment>
            <ThemeProvider theme={newTheme}>
              <IOSSlider3
                min={response.range.min_decade}
                max={response.range.max_decade}
                worksPerYear={worksPerYear}
                // value={searchYearLocal !== null ? response.range.max_decade - searchYearLocal : searchYearLocal}
                value={searchYearLocal}
                // defaultValue={response.range.max_year}
                // defaultValue={searchYearLocal}
                // defaultValue={query.get('y') !== null ? Number.parseInt(query.get('y')!, 10) : response.range.max_year}
                // defaultValue={response.searchYear}
                // defaultValue={searchYear}
                // defaultValue={searchYear === null ? response.range.max_year : searchYear}
                // defaultValue={1931}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                // aria-labelledby="discrete-slider-restrict"
                step={null}
                track={false}
                valueLabelDisplay="on"
                marks={getMarks()}
                onChange={onChange}
                onChangeCommitted={onChangeCommitted}
                ValueLabelComponent={StyledValueLabel}
              />
            </ThemeProvider>

            <Box className={classes.labelLeft}>
              <Typography component="span" variant="caption">
                {response.range.max_decade}
              </Typography>
            </Box>
            <Box className={classes.labelRight}>
              <Typography component="span" variant="caption">
                {response.range.min_decade}
              </Typography>
            </Box>
          </Fragment>
        </Box>
      )}
    </Fragment>
  )
}

export default React.memo(withTheme(TimelineScrubber))
