import { Box, makeStyles, Slider, Theme, withStyles } from '@material-ui/core'
import ValueLabel from '@material-ui/core/Slider/ValueLabel'
import React, { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { TroveAPIWorkDateCount } from '../../api/types'
import useTroveAPI from './useTroveDateAPIHook'

type TimelineScrubberProps = {
  searchTerm: string
  onDateChange: (year: number) => void
}

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
    backgroundColor: `${theme.palette.background.default}`,
  },
  labelLeft: {
    position: 'absolute',
    bottom: 5,
    left: 10,
  },
  labelRight: {
    position: 'absolute',
    bottom: 5,
    right: 10,
  },
}))

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

const getSearchYearFromQS = (query: URLSearchParams): number | null => {
  const y = query.get('y')
  if (y !== null) {
    return Number.parseInt(y, 10)
  }

  return null
}

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateCSS = (props: any) => {
  const { worksPerYear }: { worksPerYear: TroveAPIWorkDateCount[] } = props
  const counts: number[] = worksPerYear.map((item) => item.count)

  const css = worksPerYear
    .map(
      (item, index) => `& .MuiSlider-mark[data-index='${index}'] {
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
  // console.log('!!!', css)
  return css
}

// Thanks to Material-UI issues with typings for extended componnents, we can't have nicely typed props here
// https://github.com/mui-org/material-ui/issues/20191
// https://github.com/mui-org/material-ui/issues/17454
// @TODO According to the comments this should work fine in v5 (i.e. Using SliderProps and extending it)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExtendedSlider = (props: any) => {
  const { worksPerYear, ...other } = props
  return <Slider {...other} />
}

const SliderSyled = styled(ExtendedSlider)`
  & .MuiSlider-mark {
    height: 8px;
    width: 1px;
    margin-top: -3px;
    margin-left: -1px;
  }
  & .MuiSlider-markActive {
    opacity: 1;
    background-color: 'currentColor';
  }
  & .MuiSlider-markLabel {
    display: none;
  }
  & .MuiSlider-markLabel[data-index='0'] {
    display: block;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  & .MuiSlider-markLabel[data-index='${(props: any) => props.marks.length - 1}'] {
    display: block;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ${(props: any) => generateCSS(props)}
`

// https://github.com/mui-org/material-ui/issues/16547
const StyledValueLabel = withStyles((theme: Theme) => ({
  offset: {
    top: '-17px',
    transform: 'rotate(-180deg) scale(1) translateY(-10px) !important',
  },
  thumb: {
    backgroundColor: `${theme.palette.primary.light}`,
  },
  circle: {
    backgroundColor: `${theme.palette.primary.light}`,
  },
  label: {
    transform: 'rotate(-135deg)',
  },
}))(ValueLabel)

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ searchTerm, onDateChange }: TimelineScrubberProps) => {
  const classes = useStyles()

  const {
    state: { response },
  } = useTroveAPI(searchTerm)

  const query = useQuery()

  const [searchYearLocal, setSearchYearLocal] = React.useState<number | null>(getSearchYearFromQS(query))

  const [searchYearURL, setSearchYearURL] = React.useState<number | null>(getSearchYearFromQS(query))

  const [sliderIsChanging, setSliderIsChanging] = React.useState<boolean>(false)

  if (response === null) {
    // console.log('( Bail and do not bother trying to render')
    return null
  }

  const getMarks = () => {
    if (response !== null && worksPerYear !== null) {
      return worksPerYear.map((item: TroveAPIWorkDateCount) => {
        return {
          value: item.year,
          label: item.year,
        }
      })
    }
    return []
  }

  let worksPerYear: TroveAPIWorkDateCount[] | null = null
  if (response !== null) {
    worksPerYear = response.worksPerYear
  }

  // @TODO Look at using this technique to scale years in a non-linear fashion:
  // https://stackoverflow.com/questions/61792449/material-ui-slider-changing-values-using-scale

  if (getSearchYearFromQS(query) !== searchYearURL) {
    // console.log('Setting searchYearURL', getSearchYearFromQS(query))
    setSearchYearURL(getSearchYearFromQS(query))
  }

  // This happens when the URL year has a value and it changes in resonse to onChangeCommitted OR when history() changes it
  if (sliderIsChanging === false && searchYearURL !== searchYearLocal && searchYearURL !== null) {
    // console.log('> Setting searchYearLocal from searchYearURL', searchYearURL)
    setSearchYearLocal(searchYearURL)
  }

  // This happens when we change search terms and there's no year selected yet
  // OR when we load a page with no year in the URL
  if (
    sliderIsChanging === false &&
    searchYearURL === null &&
    response !== null &&
    response.range !== null &&
    response.range.min_year !== null &&
    response.range.min_year !== searchYearLocal
  ) {
    // console.log(
    //   '^ No one has a good search year, so set it from the response from',
    //   searchYearLocal,
    //   'to',
    //   response.range.min_year
    // )
    setSearchYearLocal(response.range.min_year)
  }

  const onChange = (_event: React.SyntheticEvent, year: number) => {
    if (sliderIsChanging === false) {
      setSliderIsChanging(true)
    }

    if (year !== searchYearLocal) {
      // console.log('$ Set search year from dragging the slider')
      setSearchYearLocal(year)
    }
  }

  const onChangeCommitted = (_event: React.SyntheticEvent, year: number) => {
    setSliderIsChanging(false)
    onDateChange(year)
  }

  return (
    <Fragment>
      {response !== null && response.range !== null && worksPerYear !== null && (
        <Box className={classes.stickToBottom}>
          <Fragment>
            <SliderSyled
              min={response.range.min_decade}
              max={response.range.max_decade}
              worksPerYear={worksPerYear}
              value={searchYearLocal}
              step={null}
              track={false}
              valueLabelDisplay="on"
              marks={getMarks()}
              onChange={onChange}
              onChangeCommitted={onChangeCommitted}
              ValueLabelComponent={StyledValueLabel}
            />
          </Fragment>
        </Box>
      )}
    </Fragment>
  )
}

export default React.memo(TimelineScrubber)
