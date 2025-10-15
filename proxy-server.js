const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/generate', async (req, res) => {
    try {
        const { prompt, model } = req.query;
        const url = 'https://subnp.com/api/free/generate';
        const requestBody = { prompt, model: model || 'turbo' };
        
        console.log('\n=== IMAGE GENERATION REQUEST ===');
        console.log('URL:', url);
        console.log('Prompt:', prompt);
        console.log('Model:', model || 'turbo');
        console.log('Request Body:', JSON.stringify(requestBody));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const text = await response.text();
            console.error('API Error Response:', text);
            return res.status(response.status).json({ error: text });
        }
        
        let imageUrl = null;
        let buffer = '';
        
        console.log('\n=== STREAMING RESPONSE ===');
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for image'));
            }, 120000);
            
            response.body.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop();
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log('Status:', data.status);
                            
                            if (data.status === 'complete' && data.imageUrl) {
                                imageUrl = data.imageUrl;
                                console.log('✓ Image URL:', imageUrl);
                                clearTimeout(timeout);
                                resolve();
                            }
                            
                            if (data.status === 'error') {
                                console.log('Error message:', data.message);
                                console.log('Error details:', data.error);
                                clearTimeout(timeout);
                                reject(new Error(data.message || data.error || 'Generation failed'));
                            }
                        } catch (e) {}
                    }
                }
            });
            
            response.body.on('end', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            response.body.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
        
        console.log('\n=== FINAL RESULT ===');
        console.log('Image URL:', imageUrl || 'null');
        
        if (!imageUrl) {
            return res.status(500).json({ error: 'No image URL received' });
        }
        
        res.json({ imageUrl });
    } catch (error) {
        console.error('\n=== PROXY ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));
