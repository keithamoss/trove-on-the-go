import { Box, makeStyles, Slider, Theme, withStyles } from '@material-ui/core'
import ValueLabel from '@material-ui/core/Slider/ValueLabel'
import { debounce } from 'lodash-es'
import React, { Fragment } from 'react'
import styled from 'styled-components'
import { TroveAPIWorkDateCount } from '../../api/types'
import { getNumberParamFromQSOrNull, useQuery } from '../../shared/utils'
import useTroveDateAPI from './useTroveDateAPIHook'

type TimelineScrubberProps = {
  searchTerm: string
  onDateChange: (year: number) => void
}

interface Mark {
  value: number
  label: number
}

const useStyles = makeStyles((theme: Theme) => ({
  timelineBar: {
    width: '100%',
    height: 66,
    position: 'fixed',
    padding: '0px 20px 0px 20px',
    [theme.breakpoints.up('md')]: {
      padding: '5px 20px 0px 20px',
    },
    top: 0,
    left: 0,
    backgroundColor: `${theme.palette.background.default}`,
  },
}))

// Thanks to Material-UI issues with typings for extended componnents, we can't have nicely typed props here
// AND need to wrap <Slider> because we define our own onChange and onChangeCommmitted functions
// https://github.com/mui-org/material-ui/issues/20191
// https://github.com/mui-org/material-ui/issues/17454
// @TODO According to the comments this should work fine in v5 (i.e. Using SliderProps and extending it)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SliderWrapped = (props: any) => {
  return <Slider {...props} />
}

const SliderSyled = styled(SliderWrapped)`
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
  & .MuiSlider-markLabel[data-index='0'],
  & .MuiSlider-markLabel[data-index='${(props: { marks: Mark[] }) => props.marks.length - 1}'] {
    display: block;
  }
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

const buildTimelineMarks = (worksPerYear: TroveAPIWorkDateCount[]) => {
  if (worksPerYear !== null) {
    return worksPerYear.map((item: TroveAPIWorkDateCount) => ({
      value: item.year,
      label: item.year,
    }))
  }
  return []
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ searchTerm, onDateChange }: TimelineScrubberProps) => {
  const classes = useStyles()

  const {
    state: { response },
  } = useTroveDateAPI(searchTerm)

  const [searchYearLocal, setSearchYearLocal] = React.useState<number | null>(null)

  const urlYearParam = getNumberParamFromQSOrNull(useQuery(), 'y')

  const [searchYearURL, setSearchYearURL] = React.useState<number | null>(urlYearParam)

  const [sliderIsChanging, setSliderIsChanging] = React.useState<boolean>(false)

  if (response === null) {
    return null
  }

  if (urlYearParam !== searchYearURL) {
    setSearchYearURL(urlYearParam)
  }

  // 1. Handles updates to the local searchYear when the year in the URL has a value and it:
  // (a) Changes in response to onChangeCommitted()
  // (b) Changes in response to history.push()
  // USE: The URL's search year
  if (sliderIsChanging === false && searchYearURL !== searchYearLocal && searchYearURL !== null) {
    setSearchYearLocal(searchYearURL)
  }

  // 2. Handle updates to the local searchYear when the URL doesn't have a year yet and:
  // (a) The page loads for the first time
  // (b) The search term changes
  // USE: The year from the API
  if (
    sliderIsChanging === false &&
    searchYearURL === null &&
    response.metadata !== null &&
    response.metadata.min_year !== null &&
    response.metadata.min_year !== searchYearLocal
  ) {
    setSearchYearLocal(response.metadata.min_year)
  }

  const onChange = (_event: React.SyntheticEvent, year: number) => {
    if (sliderIsChanging === false) {
      setSliderIsChanging(true)
    }

    // Our slider is a controller component, so this makes sure the position updates as the user drags the thumb control.
    if (year !== searchYearLocal) {
      setSearchYearLocal(year)
    }
  }

  const onChangeDebounced = debounce(onChange, 50, { maxWait: 100 })

  const onChangeCommitted = (_event: React.SyntheticEvent, year: number) => {
    setSliderIsChanging(false)
    onDateChange(year)
  }

  return (
    <Fragment>
      {response.metadata !== null && response.worksPerYear !== null && (
        <Box className={classes.timelineBar}>
          <Fragment>
            <SliderSyled
              min={response.metadata.min_decade}
              max={response.metadata.max_decade}
              value={searchYearLocal}
              step={null}
              track={false}
              valueLabelDisplay="on"
              marks={buildTimelineMarks(response.worksPerYear)}
              onChange={onChangeDebounced}
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
