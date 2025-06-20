import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppSelector } from '../../redux/hooks';

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
}

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer }) => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role || 'student';

  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      path: '/',
      icon: <DashboardIcon />,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      text: 'Calendar',
      path: '/calendar',
      icon: <CalendarMonthIcon />,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      text: 'Students',
      path: '/students',
      icon: <PeopleIcon />,
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Teachers',
      path: '/teachers',
      icon: <SchoolIcon />,
      roles: ['admin'],
    },
    {
      text: 'Materials',
      path: '/materials',
      icon: <LibraryMusicIcon />,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      text: 'Reports',
      path: '/reports',
      icon: <AssessmentIcon />,
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Settings',
      path: '/settings',
      icon: <SettingsIcon />,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 73,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        '& .MuiDrawer-paper': {
          position: 'relative',
          whiteSpace: 'nowrap',
          width: open ? 240 : 73,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          boxSizing: 'border-box',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {filteredMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              minHeight: 48,
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
