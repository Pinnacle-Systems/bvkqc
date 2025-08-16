import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

// Import your routes
import {
  employees, states, countries, cities,
  departments, companies, branches, users, pages, roles, subscriptions, finYear,
  employeeCategories, pageGroup,
  party,
  partyCategories,
  project,
  processMaster,
  taxTemplate, taxTerm,
  termsAndCondition,
  dispatched,
  order,
  po,
  styleSheetRoutes,
  sendMail,
  excessQty,
  email, orderImport,
  controlPanel,
  TagType,LineMaster,sizeTable, allocation,aql,
  InchargeLineListMaster
} from './src/routes/index.js';

import { socketMain } from './src/sockets/socket.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(cors());

// Static files and routes
const path = join(__dirname, 'client/build/');
app.use(express.static(path));

app.get('/', function (req, res) {
  res.sendFile(join(path, "index.html"));
});

// BigInt JSON serialization
BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};

// Your existing routes
app.use("/employees", employees);
app.use("/countries", countries);
app.use("/states", states);
app.use("/cities", cities);
app.use("/departments", departments);
app.use("/companies", companies);
app.use("/branches", branches);
app.use("/allocation", allocation);
app.use("/users", users);
app.use("/pages", pages);
app.use("/pageGroup", pageGroup);
app.use("/roles", roles);
app.use("/subscriptions", subscriptions);
app.use("/finYear", finYear);
app.use("/employeeCategories", employeeCategories);
app.use("/partyCategories", partyCategories);
app.use("/party", party);
app.use('/project', project);
app.use("/process", processMaster);
app.use("/taxTemplate", taxTemplate);
app.use("/taxTerm", taxTerm);
app.use("/termsAndCondition", termsAndCondition);
app.use("/dispatched", dispatched);
app.use("/order", order);
app.use("/po", po);
app.use("/stylesheet", styleSheetRoutes);
app.use("/email", email);
app.use("/percentage", excessQty);
app.use("/orderImport", orderImport);
app.use("/controlPanel", controlPanel);
app.use("/tagType", TagType);
app.use("/lineMaster", LineMaster);
app.use("/sizeTable", sizeTable);
app.use("/aql", aql);
app.use("/InchargeLineList", InchargeLineListMaster);

app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params;
  res.sendFile(join(__dirname, "uploads", fileName));
});

app.use('/uploads', express.static('uploads'));
app.use("/sendMail", sendMail);

// PDF Extraction Endpoint
app.post('/api/extract-page-tables', async (req, res) => {
  try {
    const { pdfData, targetPage = 6 } = req.body;
    
    if (!pdfData) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Create temp directory
    const tempDir = join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      await mkdirAsync(tempDir);
    }

    // Save PDF to temp file
    const tempFilePath = join(tempDir, `upload_${Date.now()}.pdf`);
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    await writeFileAsync(tempFilePath, pdfBuffer);

    // Execute Python script
    const pythonProcess = spawn('python3', [
      join(__dirname, 'pdf_extractor.py'),
      tempFilePath,
      targetPage.toString()
    ]);

    let resultData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      // Clean up temp file
      try {
        await unlinkAsync(tempFilePath);
      } catch (cleanupErr) {
        console.error('Temp file cleanup error:', cleanupErr);
      }
      
      if (code !== 0 || errorData) {
        return res.status(500).json({ 
          error: `Python process failed: ${errorData || 'Exit code: ' + code}` 
        });
      }

      try {
        const result = JSON.parse(resultData);
        res.json(result);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        res.status(500).json({ 
          error: 'Failed to parse Python output',
          rawOutput: resultData
        });
      }
    });
  } catch (err) {
    console.error('PDF extraction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socketMain);

// Start server
const PORT = process.env.PORT || 9057;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`PDF extraction endpoint: POST /api/extract-page-tables`);
  
  // Verify Python environment
  const pythonCheck = spawn('python3', ['--version']);
  pythonCheck.stderr.on('data', (data) => {
    console.error(`Python check error: ${data}`);
  });
  pythonCheck.stdout.on('data', (data) => {
    console.log(`Python version: ${data}`);
  });
  pythonCheck.on('close', (code) => {
    if (code !== 0) {
      console.error('Python is not available. PDF extraction will fail.');
    }
  });
});