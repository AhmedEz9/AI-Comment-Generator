import { Request, Response, NextFunction } from 'express';
import fetchData from '../../lib/fetchData';

// Define a type for the expected OpenAI API response
type OpenAIResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

const commentPost = async (
  req: Request<{}, {}, { text: string; style: string }>,
  res: Response<{ response: string }>,
  next: NextFunction
) => {
  try {
    // Set up the prompt for generating a response in a specific style
    const prompt = `Respond to the following comment in a ${req.body.style} style: "${req.body.text}"`;

    // Make a request to OpenAI API using fetchData
    const response = await fetchData<OpenAIResponse>(process.env.OPENAI_API_URL + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // May not be necessary if using VPN
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are responding as a YouTube commenter.` },
          { role: 'user', content: prompt },
        ],
      }),
    });

    // Access the response content safely
    const aiResponse = response.choices[0]?.message?.content || "No response generated";

    // Send back the AI response as JSON
    res.json({ response: aiResponse });
  } catch (error) {
    next(error);
  }
};

export { commentPost };