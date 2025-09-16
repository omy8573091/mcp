'use client'

import { AppBar as MuiAppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material'
import { Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle } from '@mui/icons-material'
import { useLanguage } from '../hooks/useLanguage'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'

interface AppBarProps {
  onMenuClick: () => void
}

export function AppBar({ onMenuClick }: AppBarProps) {
  const { t } = useLanguage()

  return (
    <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('dashboard.title')}
        </Typography>
        <ThemeToggle />
        <LanguageSelector />
        <IconButton color="inherit">
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  )
}
