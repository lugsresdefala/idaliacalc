import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Sample API endpoints for calculators
app.post('/api/calculate/gestational', (req, res) => {
  try {
    const { method, date, weeks, days, embryoDays } = req.body;
    
    // This would normally contain the calculation logic or call to your calculation functions
    // For now, returning a simple response
    res.json({
      success: true,
      result: {
        weeks: 12,
        days: 3,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        firstTrimesterEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        secondTrimesterEnd: new Date(new Date().setMonth(new Date().getMonth() + 3))
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.post('/api/calculate/fertility', (req, res) => {
  try {
    const { lastPeriodStart, lastPeriodEnd, cycleLength } = req.body;
    
    // This would normally contain the calculation logic
    res.json({
      success: true,
      result: {
        ovulationDay: new Date(new Date().setDate(new Date().getDate() + 14)),
        fertileStart: new Date(new Date().setDate(new Date().getDate() + 10)),
        fertileEnd: new Date(new Date().setDate(new Date().getDate() + 16)),
        nextPeriodStart: new Date(new Date().setDate(new Date().getDate() + 28)),
        nextPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 33))
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// In production, serve static files from the client build
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.resolve(__dirname, '../client/dist');
  
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});