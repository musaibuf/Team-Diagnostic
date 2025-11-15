import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Grid, Paper, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SectionBreakdown() {
  const { filters } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    axios.get(`http://localhost:3001/api/dashboard-stats?${params}`)
      .then(response => setStats(response.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getSectionDoughnutData = (sectionName) => {
    const counts = stats?.sectionCounts?.[sectionName] || { Yes: 0, No: 0, Maybe: 0 };
    return {
      labels: ['Yes', 'No', 'Maybe'],
      datasets: [{
        data: [counts.Yes, counts.No, counts.Maybe],
        backgroundColor: ['#36b37e', '#ff5630', '#ffab00'],
        borderColor: theme.palette.background.paper,
        borderWidth: 3,
      }],
    };
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
        Section Breakdown
      </Typography>
      <Grid container spacing={3}>
        {stats.sectionScores && Object.entries(stats.sectionScores).map(([name, score]) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={name}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" noWrap>{name}</Typography>
              <Box sx={{ height: 150, my: 2 }}>
                <Doughnut
                  key={`doughnut-${name}-${stats.totalSubmissions}-${JSON.stringify(filters)}`}
                  data={getSectionDoughnutData(name)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                      legend: { display: true, position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${percentage}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}