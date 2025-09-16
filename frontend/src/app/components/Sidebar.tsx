'use client'

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { 
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../hooks/useLanguage'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const menuItems = [
    { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: t('nav.upload'), icon: <UploadIcon />, path: '/upload' },
    { text: t('nav.search'), icon: <SearchIcon />, path: '/search' },
    { text: t('nav.compliance'), icon: <AssessmentIcon />, path: '/reports' },
    { text: t('nav.risk'), icon: <SecurityIcon />, path: '/risk' },
    { text: 'Document Library', icon: <DescriptionIcon />, path: '/documents' },
    { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose?.()
  }

  return (
    <div style={{ width: 240, height: '100%' }}>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

function Toolbar() {
  return <div style={{ height: 64 }} />
}
