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
  is_recurring: boolean;
  is_house: boolean;
  is_parents: boolean;
  is_gym: boolean;
}

const CATEGORIES = [
  'Food & Dining', 'Groceries', 'Transport', 'Shopping', 'Electronics',
  'Bills & Utilities', 'Entertainment', 'Health & Fitness', 'Education',
  'Travel', 'Personal Care', 'Home & Garden', 'Gifts & Donations', 'Insurance', 'Family', 'Other'
];

const FLAG_INSTRUCTIONS = `
    - is_recurring (boolean): true if the expense repeats (e.g., "monthly subscription", "daily coffee")
    - is_house (boolean): true if related to house renovation, construction, painting, hardware, etc.
    - is_parents (boolean): true if money given to/spent on parents (e.g., "sent to dad", "mom's meds"). If true, Category should usually be "Family".
    - is_gym (boolean): true if related to gym or fitness — gym membership, supplements (protein, creatine, etc.), sports/gym equipment, or if user explicitly mentions "gym" in context.`;

// Parse a single expense from natural language
export async function parseExpense(text: string): Promise<ParsedExpense> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    Extract the following expense details from the user's input:
    - Amount (number)
    - Currency (always INR)
    - Category (MUST be one of: ${CATEGORIES.join(', ')})
    - Description (brief summary)
    - Merchant (if applicable)
    - Date (YYYY-MM-DD, assume current year if not specified. Today is ${today})
    - Time (HH:mm, if specified)
    ${FLAG_INSTRUCTIONS}

    User Input: "${text}"

    Return ONLY a valid JSON object with keys: amount, currency, category, description, merchant, date, time, is_recurring, is_house, is_parents, is_gym.
    IMPORTANT: The category MUST be exactly one of the predefined categories listed above.
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
    console.log('Groq Response:', content);

    if (!content) throw new Error('No content returned from AI');

    return JSON.parse(content) as ParsedExpense;
  } catch (error) {
    console.error('Error parsing expense in @repo/ai:', error);
    throw error;
  }
}

// Parse multiple expenses from a single natural language string.
// Input example: "500 pizza, 180 petrol, 100 milk"
// Returns an array — one ParsedExpense per detected item.
export async function parseExpenses(text: string): Promise<ParsedExpense[]> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    The user has entered one or more expenses in a single input, separated by commas or "and".
    Extract EACH expense as a separate object.

    For each expense extract:
    - amount (number)
    - currency (always "INR")
    - category (MUST be exactly one of: ${CATEGORIES.join(', ')})
    - description (brief, clear summary)
    - merchant (string or null)
    - date (YYYY-MM-DD — default to today: ${today} unless the user specifies otherwise)
    - time (HH:mm or null)
    ${FLAG_INSTRUCTIONS}

    User Input: "${text}"

    Return ONLY a valid JSON object in this exact shape (never a bare array):
    { "items": [ { ...expense fields... }, ... ] }

    Rules:
    - Each item MUST have all keys: amount, currency, category, description, merchant, date, time, is_recurring, is_house, is_parents, is_gym.
    - Category MUST be exactly one of the predefined list.
    - Do not add markdown formatting or extra keys.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expense tracking assistant. Parse user input into structured JSON data. Always return a JSON object with an "items" array.',
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
    console.log('Groq Multi-parse Response:', content);

    if (!content) throw new Error('No content returned from AI');

    const parsed = JSON.parse(content) as { items: ParsedExpense[] };
    if (!Array.isArray(parsed.items)) throw new Error('AI did not return items array');

    return parsed.items;
  } catch (error) {
    console.error('Error parsing expenses in @repo/ai:', error);
    throw error;
  }
}
