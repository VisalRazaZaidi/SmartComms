import { Router } from 'express';
const router = Router();
import { JWT } from 'google-auth-library';

router.post('/', async (req, res) => {
  // console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  // console.log(process.env.GOOGLE_API_KEY);
  
  try {
    const response = await 
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: '{\n  "contents": [{\n    "parts":[{"text": "Explain how AI works"}]\n    }]\n   }',
      body: JSON.stringify({
        'system_instruction': {
          'parts': {
            'text': 'Suggest appropriate reply for the following message:'
          }
        },
        'contents': [
          {
            'parts': [
              {
                'text': req.body.message
              }
            ]
          }
        ]
      })
    });
    // const client = new JWT({
    //   email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //   key: process.env.GOOGLE_API_KEY,
    //   scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    // });

    // const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    // const response = await client.request({ 
    //   url, 
    //   method: 'POST', 
    //   data: { content: req.body.message } 
    // });
    // Parse the JSON data from the API response
    const data = await response.json();

    // Send the data back as the Express response
    // res.json(data);
    res.json({ replies: data?.candidates[0]?.content?.parts[0]?.text?.trim() ?? 'No suggestions available' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate smart replies' });
  }
});


export default router;

