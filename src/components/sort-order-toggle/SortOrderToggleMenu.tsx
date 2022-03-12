import { IconButton } from '@material-ui/core'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import DoneTwoToneIcon from '@material-ui/icons/DoneTwoTone'
import SortTwoToneIcon from '@material-ui/icons/SortTwoTone'
import React from 'react'
import { TroveSortOrder } from '../../api/types'

type SortOrderToggleMenuProps = {
  sortOrder: TroveSortOrder
  onSortChange: (sortOrder: TroveSortOrder) => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    paper: {
      marginRight: theme.spacing(2),
    },
  })
)

const SortOrderToggleMenu: React.FC<SortOrderToggleMenuProps> = ({
  sortOrder,
  onSortChange,
}: SortOrderToggleMenuProps) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    const li = event.target as HTMLElement
    const sortOrderChoice = li.dataset.sortOrder as TroveSortOrder
    if (sortOrderChoice !== undefined) {
      onSortChange(sortOrderChoice)
    }

    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false && anchorRef.current !== null) {
      anchorRef.current.focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <div className={classes.root}>
      <div>
        <IconButton
          ref={anchorRef}
          onClick={handleToggle}
          type="button"
          aria-label="choose an option to sort by"
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
        >
          <SortTwoToneIcon />
        </IconButton>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem data-sort-order={TroveSortOrder.DATE_ASC} onClick={handleClose}>
                      <ListItemIcon>
                        {sortOrder === TroveSortOrder.DATE_ASC ? <DoneTwoToneIcon fontSize="small" /> : null}
                      </ListItemIcon>
                      Date
                    </MenuItem>
                    <MenuItem data-sort-order={TroveSortOrder.RELEVANCE} onClick={handleClose}>
                      <ListItemIcon>
                        {sortOrder === TroveSortOrder.RELEVANCE ? <DoneTwoToneIcon fontSize="small" /> : null}
                      </ListItemIcon>
                      Relevance
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  )
}

export default React.memo(SortOrderToggleMenu)
