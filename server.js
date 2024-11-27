require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint na zaznamenanie návštevníkov
app.post('/log', async (req, res) => {
    try {
        // Získanie IP adresy z hlavičky x-forwarded-for (Vercel ju pridáva pre reálne IP)
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

        // Volanie geolokačného API, napríklad ipapi.co
        const ipData = await fetch(`https://ipapi.co/${ip}/json/`)
            .then(response => response.json())
            .catch(() => ({})); // Ak API zlyhá, použijeme prázdny objekt

        // Príprava správy na odoslanie cez Discord webhook
        const message = {
            content: `@everyone 🚨 **NEW VISITOR DETECTED** 🚨\n\n` +
                `🌐 **IP Address:** ${ip || 'Unknown'}\n` +
                `📍 **Location:** ${ipData.city || 'Unknown'}, ${ipData.region || 'Unknown'}, ${ipData.country_name || 'Unknown'}\n` +
                `🌍 **Coordinates:** ${ipData.latitude || 'Unknown'}, ${ipData.longitude || 'Unknown'}\n` +
                `🔍 **Browser:** ${req.headers['user-agent']}\n` +
                `⏰ **Time:** ${new Date().toISOString()}`
        };

        // Posielanie správy na Discord cez webhook
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        // Odpoveď pre klienta
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false });
    }
});

// Nastavenie portu (Vercel automaticky spravuje port, takže PORT je nepotrebné)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

