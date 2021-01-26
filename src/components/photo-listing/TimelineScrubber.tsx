import { Box, makeStyles, Slider, Theme, withStyles } from '@material-ui/core'
import ValueLabel from '@material-ui/core/Slider/ValueLabel'
import React, { Fragment } from 'react'
import styled from 'styled-components'
import { TroveAPIWorkDateCount } from '../../api/types'
import { getNumberParamFromQSOrNull, useQuery } from '../../shared/utils'
import useTroveAPI from './useTroveDateAPIHook'

type TimelineScrubberProps = {
  searchTerm: string
  onDateChange: (year: number) => void
}

const useStyles = makeStyles((theme: Theme) => ({
  timelineBar: {
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
  & .MuiSlider-markLabel[data-index='0'] {
    display: block;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  & .MuiSlider-markLabel[data-index='${(props: any) => props.marks.length - 1}'] {
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

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ searchTerm, onDateChange }: TimelineScrubberProps) => {
  const classes = useStyles()

  const {
    state: { response },
  } = useTroveAPI(searchTerm)

  const query = useQuery()

  const [searchYearLocal, setSearchYearLocal] = React.useState<number | null>(null)

  const [searchYearURL, setSearchYearURL] = React.useState<number | null>(getNumberParamFromQSOrNull(query, 'y'))

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

  if (getNumberParamFromQSOrNull(query, 'y') !== searchYearURL) {
    // console.log('Setting searchYearURL', getParamFromQSOrNull(query, 'y'))
    setSearchYearURL(getNumberParamFromQSOrNull(query, 'y'))
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
    response.metadata !== null &&
    response.metadata.min_year !== null &&
    response.metadata.min_year !== searchYearLocal
  ) {
    // console.log(
    //   '^ No one has a good search year, so set it from the response from',
    //   searchYearLocal,
    //   'to',
    //   response.metadata.min_year
    // )
    setSearchYearLocal(response.metadata.min_year)
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
      {response !== null && response.metadata !== null && worksPerYear !== null && (
        <Box className={classes.timelineBar}>
          <Fragment>
            <SliderSyled
              min={response.metadata.min_decade}
              max={response.metadata.max_decade}
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
