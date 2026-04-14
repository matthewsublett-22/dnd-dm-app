const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TOGETHER_API_KEY = 'tgp_v1_8YckZFFk3H4oj7J7QOVe7Sk-Wd9rUIffOFJ6Bx5cswU';
const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;

  try {
    const fetch = (await import('node-fetch')).default;

    const cleanMessages = messages.map(m => ({
      role: m.role,
      content: String(m.content || '').slice(0, 4000)
    }));

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        temperature: 0.82,
        messages: [
          { role: 'system', content: systemPrompt },
          ...cleanMessages
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Together API error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.choices?.[0]?.message?.content || '';
    res.json({ response: text });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});