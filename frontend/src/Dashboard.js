import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, CssBaseline, Paper, FormControl, InputLabel,
  Select, MenuItem, Button, Collapse
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// Icons for Sidebar
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListIcon from '@mui/icons-material/List';

const drawerWidth = 280;

// --- THEME (Unchanged) ---
let carneliantheme = createTheme({
  palette: {
    primary: { main: '#F57C00' },
    secondary: { main: '#B31B1B' },
    warning: { main: '#FFA000' },
    background: { default: '#f4f6f8', paper: '#FFFFFF' },
    text: { primary: '#172b4d', secondary: '#5e6c84' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h4: { fontWeight: 700, color: '#172b4d' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.07)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#172b4d',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          color: '#9CA3AF',
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '& .MuiListItemIcon-root': { color: '#9CA3AF' },
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(245, 124, 0, 0.08)',
            color: '#F57C00',
            '& .MuiListItemIcon-root': { color: '#F57C00' },
            '&:hover': { backgroundColor: 'rgba(245, 124, 0, 0.12)' }
          },
        }
      }
    }
  }
});
carneliantheme = responsiveFontSizes(carneliantheme);

function DashboardLayout() {
  const [filters, setFilters] = useState({ department: 'all', location: 'all' });
  const [filterOptions, setFilterOptions] = useState({ departments: [], locations: [] });
  const [questionsOpen, setQuestionsOpen] = useState(false); // State for dropdown
  const location = useLocation();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchFilterOptions = useCallback(() => {
    axios.get(`${API_URL}/api/filter-options`)
      .then(response => setFilterOptions(response.data))
      .catch(err => console.error("Failed to fetch filter options:", err));
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    if (location.pathname === '/dashboard/comparison') {
      setFilters(prevFilters => ({ ...prevFilters, department: 'all' }));
    }
  }, [location.pathname]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionsClick = () => {
    setQuestionsOpen(!questionsOpen);
  };

  const sidebarLinks = [
    { text: 'Overview', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Section Breakdown', path: '/dashboard/breakdown', icon: <PieChartIcon /> },
    { text: 'Actionable Insights', path: '/dashboard/insights', icon: <InsightsIcon /> },
    { text: 'Department Comparison', path: '/dashboard/comparison', icon: <BarChartIcon /> },
  ];

  const questionSections = [
    'Goals', 'Roles', 'Procedures', 'Internal Relationships', 'External Relationships'
  ];

  return (
    <ThemeProvider theme={carneliantheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              Team Diagnostic Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {sidebarLinks.map((link) => (
                <ListItem key={link.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={link.path}
                    selected={location.pathname === link.path || (link.path === '/dashboard' && location.pathname.endsWith('/dashboard'))}
                  >
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.text} />
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Collapsible Question Analysis Menu */}
              <ListItem disablePadding>
                <ListItemButton onClick={handleQuestionsClick}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Question Analysis" />
                  {questionsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={questionsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {questionSections.map((section) => (
                    <ListItemButton
                      key={section}
                      component={Link}
                      to={`/dashboard/questions/${encodeURIComponent(section)}`}
                      sx={{ pl: 4 }}
                      selected={location.pathname === `/dashboard/questions/${encodeURIComponent(section)}`}
                    >
                      <ListItemIcon>
                        <ListIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={section} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
          <Toolbar />
          <Paper sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <FormControl 
              sx={{ flex: '1 1 200px' }} 
              disabled={location.pathname === '/dashboard/comparison'}
            >
              <InputLabel>Department</InputLabel>
              <Select name="department" value={filters.department} label="Department" onChange={handleFilterChange}>
                <MenuItem value="all">All Departments</MenuItem>
                {filterOptions.departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: '1 1 200px' }}>
              <InputLabel>Location</InputLabel>
              <Select name="location" value={filters.location} label="Location" onChange={handleFilterChange}>
                <MenuItem value="all">All Locations</MenuItem>
                {filterOptions.locations.map(loc => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: '1 1 200px' }} disabled>
              <InputLabel>Organization</InputLabel>
              <Select value="Foodpanda" label="Organization"><MenuItem value="Foodpanda">Foodpanda</MenuItem></Select>
            </FormControl>
            <Button variant="contained" onClick={() => window.location.reload()} startIcon={<RefreshIcon />} sx={{ flex: '0 1 auto' }}>Refresh</Button>
          </Paper>
          
          <Outlet context={{ filters }} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardLayout />;
}