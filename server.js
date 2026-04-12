const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TOGETHER_API_KEY = 'tgp_v1_FYDRswdoKZnrqDlvufyObVI_X29cAFfBS53ny4p4OC4';
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.85,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });
    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ response: text });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DnD DM server running at http://localhost:${PORT}`);
});