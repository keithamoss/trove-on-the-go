import { createMuiTheme, CssBaseline, darken, ThemeProvider, useMediaQuery } from '@material-ui/core'
import { blue, pink } from '@material-ui/core/colors'
import React, { Fragment } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Home } from './pages/Home'

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    // @ts-ignore-next-line
    defaultMatches: null,
  })

  // Adapted from the custom dark mode colour scheme used by the Material-UI docs
  // https://github.com/mui-org/material-ui/blob/master/docs/src/modules/components/ThemeContext.js#L180
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          background: {
            default: prefersDarkMode ? '#303030' : '#ffffff',
          },
          primary: {
            main: prefersDarkMode ? blue[200] : blue[700],
          },
          secondary: {
            main: prefersDarkMode ? pink[200] : darken(pink.A400, 0.1),
          },
        },
      }),
    [prefersDarkMode]
  )

  // Wait until the media query resolves to show the app
  if (prefersDarkMode === null) {
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Switch>
          <Fragment>
            <CssBaseline />
            <div className="container">
              <Route path="/" component={Home} exact />
            </div>
          </Fragment>
        </Switch>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
