import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function DepartmentComparison() {
  const { filters } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ ...filters, department: 'all' }).toString();
    axios.get(`${API_URL}/api/dashboard-stats?${params}`)
      .then(response => setStats(response.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const performanceByDeptData = {
    labels: stats?.performanceByDept ? Object.keys(stats.performanceByDept) : [],
    datasets: [{
      label: 'Overall Score',
      data: stats?.performanceByDept ? Object.values(stats.performanceByDept) : [],
      backgroundColor: 'rgba(179, 27, 27, 0.7)',
      borderColor: 'rgba(179, 27, 27, 1)',
      borderWidth: 1,
    }],
  };

  const numDepartments = performanceByDeptData.labels.length;
  const dynamicHeight = Math.max(600, numDepartments * 35);

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, color: 'secondary.main' }}>
        Department Comparison
      </Typography>
      <Paper sx={{ p: 3, height: dynamicHeight + 80 }}>
        <Typography variant="h6">Team Effectiveness by Department</Typography>
        <Box sx={{ height: dynamicHeight, mt: 2 }}>
          <Bar
            key={`comparison-bar-${stats.totalSubmissions}-${JSON.stringify(filters)}`}
            data={performanceByDeptData}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  left: 10,
                  right: 10
                }
              },
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (context) => context[0].label,
                    label: (context) => `Overall Score: ${context.parsed.x}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                      size: 11
                    },
                    padding: 5
                  },
                  grid: {
                    display: true,
                    drawBorder: true
                  }
                },
                x: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    stepSize: 10
                  },
                  grid: {
                    display: true
                  }
                }
              },
              barThickness: 20
            }}
          />
        </Box>
      </Paper>
    </>
  );
}