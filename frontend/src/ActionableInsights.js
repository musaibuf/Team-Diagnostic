import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Grid, Paper, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ====== THIS IS THE FIX ======
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ActionableInsights() {
  const { filters } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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

  const totalSubmissions = stats?.totalSubmissions || 0;

  const topStrengthsData = {
    labels: (stats?.topStrengths || []).map(q => q.text),
    datasets: [{
      label: 'Percentage (%)',
      data: (stats?.topStrengths || []).map(q => totalSubmissions > 0 ? (q.yesCount / totalSubmissions * 100) : 0),
      backgroundColor: theme.palette.success.main,
    }],
  };

  const topProblemsData = {
    labels: (stats?.topProblems || []).map(q => q.text),
    datasets: [{
      label: 'Percentage (%)',
      data: (stats?.topProblems || []).map(q => totalSubmissions > 0 ? (q.noCount / totalSubmissions * 100) : 0),
      backgroundColor: theme.palette.error.main,
    }],
  };

  const barChartOptions = (chartType) => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 20,
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: () => '', 
          label: function(context) {
            const actualCount = chartType === 'strengths' 
              ? (stats?.topStrengths || [])[context.dataIndex]?.yesCount 
              : (stats?.topProblems || [])[context.dataIndex]?.noCount;
            const percentage = totalSubmissions > 0 ? ((actualCount / totalSubmissions) * 100).toFixed(1) : 0;
            const answerType = chartType === 'strengths' ? 'Yes' : 'No';
            return `${answerType}: ${percentage}% (${actualCount} of ${totalSubmissions})`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          stepSize: 20,
        }
      },
      y: {
        ticks: {
          autoSkip: false,
          font: {
            size: 11,
          },
          maxRotation: 0,
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.length > 60 ? label.substring(0, 60) + '...' : label;
          }
        }
      }
    }
  });

  if (loading || !stats) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, color: 'warning.main' }}>
        Actionable Insights
      </Typography>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6">Top 5 Strengths (Most "Yes" Answers)</Typography>
            <Box sx={{ height: 430, mt: 2 }}>
              {stats.topStrengths && stats.topStrengths.length > 0 ? (
                <Bar
                  key={`strengths-bar-${stats.totalSubmissions}-${JSON.stringify(filters)}`}
                  options={barChartOptions('strengths')}
                  data={topStrengthsData}
                />
              ) : (
                <Typography>Not enough data.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6">Top 5 Problem Areas (Most "No" Answers)</Typography>
            <Box sx={{ height: 430, mt: 2 }}>
              {stats.topProblems && stats.topProblems.length > 0 ? (
                <Bar
                  key={`problems-bar-${stats.totalSubmissions}-${JSON.stringify(filters)}`}
                  options={barChartOptions('problems')}
                  data={topProblemsData}
                />
              ) : (
                <Typography>No "No" answers recorded.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}