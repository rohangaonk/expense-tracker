import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ParsedExpense {
  amount: number | null;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
}

export async function parseExpense(text: string): Promise<ParsedExpense> {
  const prompt = `
    Extract the following expense details from the user's input:
    - Amount (number)
    - Currency (always INR)
    - Category (e.g., Food, Transport, Shopping, Bills, etc.)
    - Description (brief summary)
    - Merchant (if applicable)
    - Date (YYYY-MM-DD, assume current year if not specified. Today is ${new Date().toISOString().split('T')[0]})
    - Time (HH:mm, if specified)

    User Input: "${text}"

    Return ONLY a valid JSON object with keys: amount, currency, category, description, merchant, date, time.
    Do not add markdown formatting.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expense tracking assistant. Parse the user input into structured JSON data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    console.log('Groq Response:', content); // Debug log

    if (!content) {
      throw new Error('No content returned from AI');
    }

    return JSON.parse(content) as ParsedExpense;
  } catch (error) {
    console.error('Error parsing expense in @repo/ai:', error);
    throw error;
  }
}
