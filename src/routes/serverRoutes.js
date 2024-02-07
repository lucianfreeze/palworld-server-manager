const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const archiver = require('archiver');
const WebSocket = require('ws');
const env = require('dotenv').config({ path: '../.env' });

/// Server state
let serverState = 'stopped'; // 'running', 'stopped', 'updating'

// Set up a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    ws.send('Connected to server management');
});

// Function to execute command with WebSocket streaming
const execWithStreaming = (command, res) => {
    const process = exec(command);

    process.stdout.on('data', (data) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    process.on('exit', (code) => {
        serverState = 'stopped';
        res.send(`Process exited with code ${code}`);
    });
};

// Start Server
router.post('/start', (req, res) => {
    if (serverState === 'running') {
        res.status(400).send('Server is already running');
        return;
    }
    serverState = 'running';
    execWithStreaming('start-server-command', res);
});

// Stop Server
router.post('/stop', (req, res) => {
    if (serverState === 'stopped') {
        res.status(400).send('Server is already stopped');
        return;
    }
    serverState = 'stopped';
    execWithStreaming('stop-server-command', res);
});

// Update Server
router.post('/update', (req, res) => {
    if (serverState === 'running') {
        res.status(400).send('Cannot update while server is running');
        return;
    }
    serverState = 'updating';
    execWithStreaming('steamcmd +login anonymous +app_update 2394010 validate +quit', res);
});

// Download Game Save
router.get('/download-save', (req, res) => {
    const path = env.parsed.PALWORLD_SAVE_PATH;
    const output = fs.createWriteStream(env.parsed.ZIP_PATH);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        res.download(env.parsed.ZIP_PATH, 'palworld-save.zip', (err) => {
            if (err) {
                throw err;
            }
            fs.unlink(env.parsed.ZIP_PATH, (err) => {
                if (err) {
                    throw err;
                }
            });
        });
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(path, false);
    archive.finalize();
});

module.exports = router;
