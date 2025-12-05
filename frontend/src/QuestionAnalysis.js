import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Paper, Typography, LinearProgress, Grid, Chip, Divider, CircularProgress 
} from '@mui/material';

// Define which IDs belong to which section
const sectionRanges = {
  'Goals': [1, 4],
  'Roles': [5, 8],
  'Procedures': [9, 15],
  'Internal Relationships': [16, 22],
  'External Relationships': [23, 25]
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function QuestionAnalysis() {
  const { filters } = useOutletContext();
  const { sectionId } = useParams(); // We will pass the section name in the URL
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data (reusing your existing logic)
  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    axios.get(`${API_URL}/api/dashboard-stats?${params}`)
      .then(response => setStats(response.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  // Filter questions based on the selected section
  const range = sectionRanges[sectionId];
  
  // Handle case where URL might be wrong
  if (!range) {
    return <Typography variant="h6">Select a valid section from the sidebar.</Typography>;
  }

  const [start, end] = range;
  
  // Filter the 'allQuestions' array we added in Step 1
  const sectionQuestions = stats.allQuestions
    .filter(q => parseInt(q.id) >= start && parseInt(q.id) <= end)
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));

  const total = stats.totalSubmissions || 1; // Avoid divide by zero

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: 'primary.main', textTransform: 'capitalize' }}>
        Detailed Analysis: {sectionId}
      </Typography>

      <Grid container spacing={3}>
        {sectionQuestions.map((q) => {
          const yesPct = (q.yesCount / total) * 100;
          const maybePct = (q.maybeCount / total) * 100;
          const noPct = (q.noCount / total) * 100;

          return (
            <Grid item xs={12} key={q.id}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {q.text}
                </Typography>
                
                {/* Visual Bar Representation */}
                <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', my: 2, bgcolor: '#eee' }}>
                  <Box sx={{ width: `${yesPct}%`, bgcolor: '#4caf50' }} />
                  <Box sx={{ width: `${maybePct}%`, bgcolor: '#ff9800' }} />
                  <Box sx={{ width: `${noPct}%`, bgcolor: '#f44336' }} />
                </Box>

                {/* Legend / Stats */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Yes: ${Math.round(yesPct)}% (${q.yesCount})`} 
                    size="small" 
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} 
                  />
                  <Chip 
                    label={`Maybe: ${Math.round(maybePct)}% (${q.maybeCount})`} 
                    size="small" 
                    sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }} 
                  />
                  <Chip 
                    label={`No: ${Math.round(noPct)}% (${q.noCount})`} 
                    size="small" 
                    sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 'bold' }} 
                  />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}