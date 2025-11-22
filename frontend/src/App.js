import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Paper, Stepper, Step, StepLabel,
  Alert, CircularProgress, Select, MenuItem, InputLabel, Autocomplete
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// --- ICONS ---
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


// --- THEME AND STYLES ---
let theme = createTheme({
  palette: {
    primary: {
      main: '#F57C00', // Orange for primary actions
      light: 'rgba(245, 124, 0, 0.08)',
    },
    secondary: {
      main: '#B31B1B', // Deep Red for headings
    },
    text: {
      primary: '#2c3e50',
      secondary: '#34495e',
    },
    background: {
      default: '#f8f9fa',
      paper: '#FFFFFF',
    },
    action: {
      hover: 'rgba(245, 124, 0, 0.04)'
    }
  },
  typography: {
    fontFamily: 'sans-serif',
    h1: {
      fontWeight: 700,
      color: '#B31B1B',
      textAlign: 'center',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      color: '#B31B1B',
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: '2rem',
    },
    h5: {
      color: '#F57C00',
      fontWeight: 600,
      borderBottom: '2px solid #F57C00',
      paddingBottom: '0.5rem',
      marginBottom: '1rem',
      fontSize: '1.4rem',
    },
    body1: {
      fontSize: '1rem',
    }
  },
});
theme = responsiveFontSizes(theme);

const containerStyles = {
  padding: { xs: 2, sm: 3, md: 4 },
  margin: { xs: '1rem auto', md: '2rem auto' },
  borderRadius: '15px',
  backgroundColor: 'background.paper',
  border: '1px solid #e9ecef',
  maxWidth: { xs: '100%', sm: '700px', md: '900px' },
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

// --- DATA (Questions & Dropdown Options) ---
const sections = [
    {
      title: 'Goals',
      questions: [
        { id: 1, text: '1. Clear mission statement' },
        { id: 2, text: '2. Measurable objectives' },
        { id: 3, text: '3. Objectives are prioritized' },
        { id: 4, text: '4. Goals are set in all key task areas' },
      ],
    },
    {
      title: 'Roles',
      questions: [
        { id: 5, text: '5. Individual roles, relationships, and accountabilities are clear' },
        { id: 6, text: '6. Style of leadership is appropriate for the team tasks' },
        { id: 7, text: '7. Each individual is competent to perform key tasks' },
        { id: 8, text: '8. The mix of roles is appropriate to the team tasks' },
      ],
    },
    {
      title: 'Procedures',
      questions: [
        { id: 9, text: '9. Decisions reached are effective' },
        { id: 10, text: '10. Management information is effectively shared' },
        { id: 11, text: '11. Key activities are effectively coordinated' },
        { id: 12, text: '12. Product and services are of a high quality' },
        { id: 13, text: '13. Conflict is managed effectively within the team' },
        { id: 14, text: '14. Adequate resources are available' },
        { id: 15, text: '15. People work in a disciplined way' },
      ],
    },
    {
      title: 'Internal Relationships',
      questions: [
        { id: 16, text: '16. There are no areas of mistrust' },
        { id: 17, text: '17. Feedback is constructive' },
        { id: 18, text: '18. Relationships are not competitive and unsupportive' },
        { id: 19, text: '19. There is no sub-grouping' },
        { id: 20, text: '20. There are no personal or hidden agendas' },
        { id: 21, text: '21. People don’t fear sharing ideas and asking for help' },
        { id: 22, text: '22. Honest mistakes are seen as learning opportunities' },
      ],
    },
    {
      title: 'External Relationships',
      questions: [
        { id: 23, text: '23. Relationship with key external groups are effective' },
        { id: 24, text: '24. Mechanisms are in place to integrate with each group' },
        { id: 25, text: '25. Time and effort is spent on identifying, building and monitoring key external relationships' },
      ],
    },
];

// Updated Comprehensive Department List
const departmentOptions = [
  'Accounting',
  'Administration',
  'Audit',
  'Business Development',
  'Compliance',
  'Corporate Social Responsibility (CSR)',
  'Corporate Strategy',
  'Customer Service',
  'Data Analytics',
  'Design',
  'Engineering',
  'Facilities Management',
  'Finance',
  'Government Relations',
  'Health & Safety (HSE)',
  'Human Resources',
  'Information Technology (IT)',
  'Internal Communications',
  'Legal',
  'Logistics',
  'Maintenance',
  'Manufacturing',
  'Marketing',
  'Medical Affairs',
  'Operations',
  'Procurement',
  'Product Management',
  'Project Management',
  'Public Relations (PR)',
  'Quality Assurance (QA)',
  'Regulatory Affairs',
  'Research & Development (R&D)',
  'Risk Management',
  'Sales',
  'Security',
  'Software Development',
  'Strategic Planning',
  'Supply Chain',
  'Support',
  'Taxation',
  'Training & Development',
  'Treasury',
  'Other'
];

// Updated Comprehensive Location List (Sorted with Other at end)
const locationOptions = [
  'Abbottabad',
  'Abdul Hakim',
  'Ahmedpur East',
  'Aliabad (Hunza)',
  'Alpurai',
  'Arif Wala',
  'Athmuqam',
  'Attock',
  'Awaran',
  'Badin',
  'Bagh',
  'Bahawalnagar',
  'Bahawalpur',
  'Bannu',
  'Barikot',
  'Barkhan',
  'Batkhela',
  'Battagram',
  'Bhakkar',
  'Bhalwal',
  'Bhimber',
  'Bholari',
  'Buner',
  'Burewala',
  'Chagai',
  'Chakwal',
  'Chaman',
  'Charsadda',
  'Chichawatni',
  'Chilas',
  'Chiniot',
  'Chishtian',
  'Chitral',
  'Dadu',
  'Daggar',
  'Dainyor',
  'Dalbandin',
  'Daska',
  'Dasu',
  'Dera Allahyar',
  'Dera Bugti',
  'Dera Ghazi Khan',
  'Dera Ismail Khan',
  'Dera Murad Jamali',
  'Dipalpur',
  'Dunyapur',
  'Eidgah',
  'Faisalabad',
  'Farooqabad',
  'Ferozwala',
  'Gadani',
  'Gakuch',
  'Gandava',
  'Ghotki',
  'Gilgit',
  'Gojra',
  'Gujar Khan',
  'Gujranwala',
  'Gujranwala Cantonment',
  'Gujrat',
  'Gwadar',
  'Hafizabad',
  'Hangu',
  'Haripur',
  'Haroonabad',
  'Hasilpur',
  'Hassan Abdal',
  'Hattar',
  'Haveli Lakha',
  'Hub',
  'Hujra Shah Muqim',
  'Hyderabad',
  'Islamabad',
  'Jacobabad',
  'Jalalpur Jattan',
  'Jamshoro',
  'Jampur',
  'Jaranwala',
  'Jatoi',
  'Jauharabad',
  'Jhang',
  'Jhelum',
  'Kabal',
  'Kabirwala',
  'Kalat',
  'Kamalia',
  'Kamber Ali Khan',
  'Kamoke',
  'Kandhkot',
  'Karachi',
  'Karak',
  'Kasur',
  'Khairpur',
  'Khanewal',
  'Khanpur',
  'Kharan',
  'Kharian',
  'Khushab',
  'Khuzdar',
  'Kohat',
  'Kohlu',
  'Kot Abdul Malik',
  'Kot Addu',
  'Kot Radha Kishan',
  'Kotli',
  'Kotri',
  'Kulachi',
  'Kundian',
  'Lahore',
  'Lakki Marwat',
  'Lala Musa',
  'Larkana',
  'Layyah',
  'Lodhran',
  'Loralai',
  'Ludhewala Waraich',
  'Mailsi',
  'Malakand',
  'Mandi Bahauddin',
  'Mansehra',
  'Mardan',
  'Mastung',
  'Matiari',
  'Mian Channu',
  'Mianwali',
  'Mingora',
  'Mirpur',
  'Mirpur Khas',
  'Mithi',
  'Moro',
  'Multan',
  'Muridke',
  'Murree',
  'Musa Khel Bazar',
  'Muzaffarabad',
  'Muzaffargarh',
  'Nankana Sahib',
  'Narowal',
  'Naushahro Firoz',
  'Nawabshah',
  'Nowshera',
  'Okara',
  'Pakpattan',
  'Panjgur',
  'Parachinar',
  'Pasrur',
  'Pattoki',
  'Peshawar',
  'Phool Nagar',
  'Pishin',
  'Qila Saifullah',
  'Quetta',
  'Rahim Yar Khan',
  'Rajanpur',
  'Rawalakot',
  'Rawalpindi',
  'Renala Khurd',
  'Risalpur Cantonment',
  'Sadiqabad',
  'Sahiwal',
  'Saidu Sharif',
  'Sambrial',
  'Samundri',
  'Sanghar',
  'Sangla Hill',
  'Sargodha',
  'Shabqadar',
  'Shahdadkot',
  'Shahdadpur',
  'Shakargarh',
  'Sheikhupura',
  'Shikarpur',
  'Shujabad',
  'Sialkot',
  'Sibi',
  'Skardu',
  'Sukkur',
  'Swabi',
  'Swat',
  'Talagang',
  'Tando Adam',
  'Tando Allahyar',
  'Tando Muhammad Khan',
  'Tank',
  'Taunsa',
  'Taxila',
  'Thar',
  'Thatta',
  'Timergara',
  'Toba Tek Singh',
  'Turbat',
  'Umerkot',
  'Upper Dir',
  'Uthal',
  'Vehari',
  'Wah Cantonment',
  'Wazirabad',
  'Zhob',
  'Ziarat',
  'Other'
];


function App() {
  const [step, setStep] = useState('welcome'); // welcome, assessment, thankyou
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    organization: 'Foodpanda', // Defaulted and disabled
    location: ''
  });
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, activeSectionIndex]);

  const handleStart = () => {
    if (userInfo.name && userInfo.department && userInfo.organization && userInfo.location) {
      setError('');
      setStep('assessment');
    } else {
      setError('Please fill out all fields.');
    }
  };

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) {
      setError('Please answer all questions in this section to submit.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const payload = { ...userInfo, answers };

    try {
      await axios.post(`${API_URL}/api/submit`, payload);
      setStep('thankyou'); // Move to thank you page on success
    } catch (err) {
      console.error("Could not save results to the database:", err);
      setError('Submission failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentSection = () => {
    const currentQuestions = sections[activeSectionIndex].questions;
    return currentQuestions.every(q => answers.hasOwnProperty(q.id));
  };

  const handleNextSection = () => {
    if (validateCurrentSection()) {
      setError('');
      if (activeSectionIndex < sections.length - 1) {
        setActiveSectionIndex(prev => prev + 1);
      }
    } else {
      setError('Please answer all questions in this section to continue.');
    }
  };

  const handlePreviousSection = () => {
    setError('');
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(prev => prev - 1);
    }
  };

  const renderWelcome = () => (
    <Paper elevation={3} sx={containerStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box component="img" src="/logo.png" alt="Company Logo" sx={{ maxWidth: { xs: '100px', sm: '120px' }, height: 'auto' }} />
        <Typography variant="h1">Team Diagnostic Tool</Typography>
      </Box>
      <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal', px: { xs: 1, sm: 2 } }}>
        Evaluate your team's effectiveness across key areas to identify strengths and opportunities for growth.
      </Typography>
      <Box sx={{ maxWidth: { xs: '100%', sm: 450 }, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2.5, px: { xs: 1, sm: 0 } }}>
        <TextField fullWidth label="Your Name" variant="outlined" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />

        {/* Updated to Autocomplete for Department */}
        <Autocomplete
          disablePortal
          id="department-select"
          options={departmentOptions}
          value={userInfo.department || null}
          onChange={(event, newValue) => {
            setUserInfo({ ...userInfo, department: newValue || '' });
          }}
          renderInput={(params) => <TextField {...params} label="Department" />}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="organization-label">Organization</InputLabel>
          <Select labelId="organization-label" value={userInfo.organization} label="Organization" disabled>
            <MenuItem value="Foodpanda">Foodpanda</MenuItem>
          </Select>
        </FormControl>

        {/* Updated to Autocomplete for Location */}
        <Autocomplete
          disablePortal
          id="location-select"
          options={locationOptions}
          value={userInfo.location || null}
          onChange={(event, newValue) => {
            setUserInfo({ ...userInfo, location: newValue || '' });
          }}
          renderInput={(params) => <TextField {...params} label="Location" />}
          fullWidth
        />

        {error && <Alert severity="error">{error}</Alert>}
        <Button variant="contained" size="large" color="primary" onClick={handleStart} startIcon={<RocketLaunchIcon />} sx={{ mt: 2, py: 1.5, width: { xs: '100%', sm: 'auto' }, alignSelf: 'center' }}>
          Start Diagnostic
        </Button>
      </Box>
    </Paper>
  );

  const renderAssessment = () => {
    const currentSection = sections[activeSectionIndex];
    return (
      <Paper sx={containerStyles}>
        <Box sx={{ mb: 3, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, pt: 2, px: { xs: 1, sm: 2 } }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Team Diagnostic</Typography>
          <Stepper activeStep={activeSectionIndex} alternativeLabel>
  {sections.map((sec) => (
    <Step key={sec.title}>
      <StepLabel
        sx={{ '& .MuiStepLabel-label': { display: 'none' } }} // hide label text
      />
    </Step>
  ))}
</Stepper>
        </Box>
        <Box>
          <Typography variant="h5">{currentSection.title}</Typography>
          {currentSection.questions.map((q) => (
            <FormControl key={q.id} component="fieldset" fullWidth sx={{ mb: 2, borderTop: '1px solid #eee', pt: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1.5, color: 'text.primary', lineHeight: 1.4 }}>{q.text}</FormLabel>
              <RadioGroup row value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'center' }}>
                {['Yes', 'Maybe', 'No'].map((option) => {
                  const isSelected = answers[q.id] === option;
                  return (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio sx={{ display: 'none' }} />}
                      label={option}
                      sx={{
                        m: 0,
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.5,
                        px: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : '#ddd',
                        backgroundColor: isSelected ? 'primary.light' : 'transparent',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          ))}
        </Box>
        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
          <Button variant="outlined" onClick={handlePreviousSection} disabled={activeSectionIndex === 0} startIcon={<ArrowBackIcon />}>Back</Button>
          {activeSectionIndex < sections.length - 1 ? (
            <Button variant="contained" onClick={handleNextSection} endIcon={<ArrowForwardIcon />}>Next</Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          )}
        </Box>
      </Paper>
    );
  };

  const renderThankYou = () => (
    <Paper sx={containerStyles}>
        <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 } }}>
            <CheckCircleOutlineIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'primary.main', mb: 2 }} />
            <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
                Thank You!
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Your responses have been successfully submitted.
            </Typography>
        </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        {step === 'welcome' && renderWelcome()}
        {step === 'assessment' && renderAssessment()}
        {step === 'thankyou' && renderThankYou()}
      </Container>
    </ThemeProvider>
  );
}

export default App;