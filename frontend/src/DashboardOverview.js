import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ====== THIS IS THE FIX ======
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function DashboardOverview() {
  const { filters } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    // Use the API_URL variable
    axios.get(`${API_URL}/api/dashboard-stats?${params}`)
      .then(response => setStats(response.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const performanceRadarData = {
    labels: stats?.sectionScores ? Object.keys(stats.sectionScores) : [],
    datasets: [{
      label: 'Score',
      data: stats?.sectionScores ? Object.values(stats.sectionScores) : [],
      backgroundColor: 'rgba(245, 124, 0, 0.2)',
      borderColor: 'rgba(245, 124, 0, 1)',
      borderWidth: 2,
    }],
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpiCards = [
    { title: 'Overall Score', value: `${stats.overallScore}%`, icon: <SpeedIcon />, color: 'primary.main' },
    { title: 'Total Submissions', value: stats.totalSubmissions, icon: <GroupIcon />, color: 'secondary.main' },
    { title: 'Highest Scoring Area', value: stats.highestScoringSection.name, icon: <TrendingUpIcon />, color: 'success.main', subValue: `${stats.highestScoringSection.score}%` },
    { title: 'Lowest Scoring Area', value: stats.lowestScoringSection.name, icon: <TrendingDownIcon />, color: 'error.main', subValue: `${stats.lowestScoringSection.score}%` },
  ];

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpiCards.map(kpi => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography color="text.secondary" variant="body2">{kpi.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }} noWrap>{kpi.value}</Typography>
                {kpi.subValue && (
                  <Typography variant="body1" sx={{ color: kpi.color, fontWeight: 'bold' }}>
                    {kpi.subValue}
                  </Typography>
                )}
              </Box>
              {React.cloneElement(kpi.icon, { sx: { fontSize: 32, color: kpi.color } })}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'secondary.main' }}>
          Performance by Section
        </Typography>
        <Box sx={{ height: { xs: 300, md: 500 } }}>
          <Radar
            key={`radar-${stats.totalSubmissions}-${JSON.stringify(filters)}`}
            data={performanceRadarData}
            options={{ responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 100 } } }}
          />
        </Box>
      </Paper>
    </>
  );
}