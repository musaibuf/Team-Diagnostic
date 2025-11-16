require('dotenv').config();
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { google } = require('googleapis');
const { formatInTimeZone } = require('date-fns-tz');
const { Pool } = require('pg');
const path = require('path'); // Import the 'path' module

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Question Text Mapping ---
const questionMap = {
  1: 'Clear mission statement', 2: 'Measurable objectives', 3: 'Objectives are prioritized', 4: 'Goals are set in all key task areas',
  5: 'Individual roles, relationships, and accountabilities are clear', 6: 'Style of leadership is appropriate for the team tasks', 
  7: 'Each individual is competent to perform key tasks', 8: 'The mix of roles is appropriate to the team tasks',
  9: 'Decisions reached are effective', 10: 'Management information is effectively shared', 11: 'Key activities are effectively coordinated', 
  12: 'Product and services are of a high quality', 13: 'Conflict is managed effectively within the team', 14: 'Adequate resources are available', 
  15: 'People work in a disciplined way', 16: 'There are no areas of mistrust', 17: 'Feedback is constructive', 
  18: 'Relationships are not competitive and unsupportive', 19: 'There is no sub-grouping', 20: 'There are no personal or hidden agendas', 
  21: "People don’t fear sharing ideas and asking for help", 22: 'Honest mistakes are seen as learning opportunities',
  23: 'Relationship with key external groups are effective', 24: 'Mechanisms are in place to integrate with each group', 
  25: 'Time and effort is spent on identifying, building and monitoring key external relationships'
};

// --- PostgreSQL Database Connection ---
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTableSQL = `CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, department TEXT NOT NULL,
  organization TEXT NOT NULL, location TEXT NOT NULL, answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`;
db.query(createTableSQL)
  .then(() => console.log('Responses table ready.'))
  .catch(err => console.error('Table Creation Error:', err.stack));


// --- GOOGLE SHEETS HELPER FUNCTION ---
async function appendToSheet(data) {
  try {
    // Parse the credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials, // Pass parsed credentials directly
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = '1W9gykJyWD7PTp_RYmzpvvSkHNVNv4tHPj5O7He1tDXo';
    const timeZone = 'Asia/Karachi';
    const formattedDate = formatInTimeZone(new Date(), timeZone, 'dd-MM-yyyy hh:mm:ss a');
    const newRow = [
      formattedDate, data.name, data.department, data.location, JSON.stringify(data.answers)
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [newRow] },
    });
    console.log('Data successfully appended to Google Sheet.');
  } catch (err) {
    console.error('Error appending to Google Sheet:', err.message);
  }
}

// --- Your other endpoints (submit, filter-options, dashboard-stats, etc.) are unchanged ---
// Make sure to include them here.
app.post('/api/submit', async (req, res) => {
    const { name, department, organization, location, answers } = req.body;
    if (!name || !department || !organization || !location || !answers) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const insertSQL = `INSERT INTO responses (name, department, organization, location, answers) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const params = [name, department, organization, location, answers];
    try {
        const result = await db.query(insertSQL, params);
        res.status(201).json({
            message: "Success! Your response has been submitted.",
            id: result.rows[0].id
        });
        appendToSheet({ name, department, location, answers });
    } catch (err) {
        console.error('Insert Error:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/filter-options', async (req, res) => {
    try {
        const departmentsResult = await db.query("SELECT DISTINCT department FROM responses ORDER BY department");
        const locationsResult = await db.query("SELECT DISTINCT location FROM responses ORDER BY location");
        res.json({
            departments: departmentsResult.rows.map(d => d.department),
            locations: locationsResult.rows.map(l => l.location),
        });
    } catch (err) {
        console.error('Filter Options Error:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dashboard-stats', async (req, res) => {
    const { department, location } = req.query;
    let sql = "SELECT department, answers FROM responses";
    const params = [];
    const whereClauses = [];
    let paramIndex = 1;
    if (department && department !== 'all') {
        whereClauses.push(`department = $${paramIndex++}`);
        params.push(department);
    }
    if (location && location !== 'all') {
        whereClauses.push(`location = $${paramIndex++}`);
        params.push(location);
    }
    if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
    }
    try {
        const { rows } = await db.query(sql, params);
        if (rows.length === 0) {
            return res.json({
                totalSubmissions: 0, sectionScores: {}, overallScore: 0,
                highestScoringSection: { name: 'N/A', score: 0 }, lowestScoringSection: { name: 'N/A', score: 0 },
                sectionCounts: {}, topStrengths: [], topProblems: [], performanceByDept: {}
            });
        }
        const processRows = (filteredRows) => {
            const questionCounts = {};
            for (let i = 1; i <= 25; i++) { questionCounts[i] = { Yes: 0, No: 0, Maybe: 0 }; }
            const sectionCounts = { Goals: { Yes: 0, No: 0, Maybe: 0 }, Roles: { Yes: 0, No: 0, Maybe: 0 }, Procedures: { Yes: 0, No: 0, Maybe: 0 }, 'Internal Relationships': { Yes: 0, No: 0, Maybe: 0 }, 'External Relationships': { Yes: 0, No: 0, Maybe: 0 } };
            const sectionRanges = { Goals: [1, 4], Roles: [5, 8], Procedures: [9, 15], 'Internal Relationships': [16, 22], 'External Relationships': [23, 25] };
            filteredRows.forEach(row => {
                const answersObj = row.answers;
                for (const qId in answersObj) {
                    const answer = answersObj[qId];
                    if (questionCounts[qId]) { questionCounts[qId][answer]++; }
                    for (const [section, [start, end]] of Object.entries(sectionRanges)) {
                        if (parseInt(qId) >= start && parseInt(qId) <= end) { sectionCounts[section][answer]++; break; }
                    }
                }
            });
            const allQuestions = Object.entries(questionCounts).map(([id, counts]) => ({ id, text: questionMap[id], yesCount: counts.Yes, noCount: counts.No }));
            const topStrengths = [...allQuestions].sort((a, b) => b.yesCount - a.yesCount).slice(0, 5).filter(q => q.yesCount > 0);
            const topProblems = [...allQuestions].sort((a, b) => b.noCount - a.noCount).slice(0, 5).filter(q => q.noCount > 0);
            const sectionScores = {};
            Object.entries(sectionCounts).forEach(([section, counts]) => {
                const totalAnswers = counts.Yes + counts.No + counts.Maybe;
                const weightedSum = (counts.Yes * 100) + (counts.Maybe * 50);
                sectionScores[section] = totalAnswers > 0 ? Math.round(weightedSum / totalAnswers) : 0;
            });
            const scores = Object.values(sectionScores);
            const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            return { sectionScores, overallScore, topStrengths, topProblems, sectionCounts };
        };
        const mainResults = processRows(rows);
        let highest = { name: 'N/A', score: -1 };
        let lowest = { name: 'N/A', score: 101 };
        Object.entries(mainResults.sectionScores).forEach(([name, score]) => {
            if (score > highest.score) highest = { name, score };
            if (score < lowest.score) lowest = { name, score };
        });
        const responsePayload = {
            totalSubmissions: rows.length,
            ...mainResults,
            highestScoringSection: highest,
            lowestScoringSection: lowest,
        };
        if (!department || department === 'all') {
            let deptPerfSql = "SELECT department, answers FROM responses";
            const deptPerfParams = [];
            if (location && location !== 'all') {
                deptPerfSql += " WHERE location = $1";
                deptPerfParams.push(location);
            }
            const deptPerfResult = await db.query(deptPerfSql, deptPerfParams);
            const allRows = deptPerfResult.rows;
            const groupedByDept = allRows.reduce((acc, row) => {
                acc[row.department] = acc[row.department] || [];
                acc[row.department].push(row);
                return acc;
            }, {});
            const performanceByDept = {};
            for (const dept in groupedByDept) {
                performanceByDept[dept] = processRows(groupedByDept[dept]).overallScore;
            }
            responsePayload.performanceByDept = performanceByDept;
            res.json(responsePayload);
        } else {
            res.json(responsePayload);
        }
    } catch (err) {
        console.error('Stats Query Error:', err.stack);
        res.status(500).json({ error: err.message });
    }
});


// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});