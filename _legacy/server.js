const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.xlsx');

app.use(cors());
app.use(bodyParser.json());

// Endpoint to check if a name already exists in the Excel database
app.get('/api/check-name/:name', (req, res) => {
    try {
        const nameToCheck = req.params.name.trim().toLowerCase();

        if (!fs.existsSync(DB_FILE)) {
            return res.json({ exists: false });
        }

        const workbook = XLSX.readFile(DB_FILE);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Check if there's any row where 'nome do campo' is 'NOME' (case-insensitive)
        // and 'valor do campo' matches the name sent
        const exists = data.some(row => {
            const fieldName = String(row['nome do campo'] || '').toUpperCase();
            const fieldValue = String(row['valor do campo'] || '').trim().toLowerCase();
            return fieldName === 'NOME' && fieldValue === nameToCheck;
        });

        res.json({ exists });
    } catch (error) {
        console.error('Erro ao verificar nome:', error);
        res.status(500).json({ success: false, error: 'Erro ao verificar duplicidade' });
    }
});

// Main endpoint to receive survey data
app.post('/api/submit', (req, res) => {
    try {
        const { respondentId, date, time, answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, error: 'Dados inválidos' });
        }

        // Prepare data for the worksheet
        // Format: ID, Data, Horário, Nome Campo, Valor
        const newRows = answers.map(ans => ({
            'ID respondente': respondentId,
            'data da resposta': date,
            'horario da resposta': time,
            'nome do campo': ans.field.toUpperCase(),
            'valor do campo': ans.value
        }));

        let workbook;
        let worksheet;

        // Check if file exists
        if (fs.existsSync(DB_FILE)) {
            workbook = XLSX.readFile(DB_FILE);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Get existing data and append new rows
            const existingData = XLSX.utils.sheet_to_json(worksheet);
            const combinedData = [...existingData, ...newRows];

            worksheet = XLSX.utils.json_to_sheet(combinedData);
            workbook.Sheets[workbook.SheetNames[0]] = worksheet;
        } else {
            // Create new workbook if it doesn't exist
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.json_to_sheet(newRows);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas');
        }

        // Save to file
        XLSX.writeFile(workbook, DB_FILE);

        console.log(`[${new Date().toISOString()}] Novo registro salvo: ID ${respondentId}`);
        res.json({ success: true });

    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar os dados' });
    }
});

// Basic health check
app.get('/', (req, res) => {
    res.send('LENS Partner Survey Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Banco de dados: ${DB_FILE}`);
});
