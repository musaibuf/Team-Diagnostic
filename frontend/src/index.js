import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import App from './App';
import Dashboard from './Dashboard'; // This is your DashboardLayout
import DashboardOverview from './DashboardOverview';
import SectionBreakdown from './SectionBreakdown';
import ActionableInsights from './ActionableInsights';
import DepartmentComparison from './DepartmentComparison';
import QuestionAnalysis from './QuestionAnalysis'; // <--- 1. IMPORT THE NEW COMPONENT

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: "breakdown", element: <SectionBreakdown /> },
      { path: "insights", element: <ActionableInsights /> },
      { path: "comparison", element: <DepartmentComparison /> },
      
      // <--- 2. ADD THIS NEW ROUTE HERE
      { path: "questions/:sectionId", element: <QuestionAnalysis /> }, 
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>
);