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

const CATEGORIES = [
  'Fuel', 'Fish', 'Gym', 'Bills', 'Junk',
  'Groceries', 'Family', 'Travel', 'Shopping',
  'Food & Dining', 'Personal Care', 'Health', 'House',
  'Entertainment', 'Other',
];

const CATEGORY_GUIDANCE = `
Category guidance (pick the BEST match — these are mutually exclusive):
- Fuel: petrol, diesel for any vehicle (Activa, car, Omni, Alto etc.)
- Fish: fish market, seafood, surmai, pomfret, prawns, mackerel
- Gym: gym membership, protein powder, supplements, eggs/paneer bought for gym, gym equipment
- Bills: electricity, water bill, Jio/broadband recharge, LIC premium, cooking gas, rent
- Junk: paav, mirchi paav, cold drinks, chips, samosa, snacks, street food
- Groceries: rice, vegetables, dal, oil, milk, bread, household staples
- Family: money given to mom/dad, parent expenses, family support
- Travel: trips, hotel stays, long-distance fuel, tourism
- Shopping: clothes, accessories, gadgets, gifts, personal purchases
- Food & Dining: restaurant meals, café, takeaway, proper dining
- Personal Care: haircut, moisturiser, face wash, cosmetics
- Health: doctor visit, medicine, pharmacy (non-gym)
- House: home renovation, hardware, painting, maintenance
- Entertainment: movies, events, subscriptions (Netflix, F1 etc.), museum
- Other: anything that doesn't clearly fit the above`;

const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Parse a single expense from natural language
export async function parseExpense(text: string): Promise<ParsedExpense> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    Extract the following expense details from the user's input:
    - Amount (number)
    - Currency (always INR)
    - Category (MUST be exactly one of: ${CATEGORIES.join(', ')})
    - Description (brief summary)
    - Merchant (if applicable, else null)
    - Date (YYYY-MM-DD, assume current year if not specified. Today is ${today})
    - Time (HH:mm, if specified, else null)
    ${CATEGORY_GUIDANCE}

    User Input: "${text}"

    Return ONLY a valid JSON object with keys: amount, currency, category, description, merchant, date, time.
    The category MUST be exactly one of the predefined values.
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
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI');
    return JSON.parse(content) as ParsedExpense;
  } catch (error) {
    console.error('Error parsing expense in @repo/ai:', error);
    throw error;
  }
}

// Parse multiple expenses from a single natural language string.
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
    ${CATEGORY_GUIDANCE}

    User Input: "${text}"

    Return ONLY a valid JSON object in this exact shape (never a bare array):
    { "items": [ { ...expense fields... }, ... ] }

    Rules:
    - Each item MUST have all keys: amount, currency, category, description, merchant, date, time.
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
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI');

    const parsed = JSON.parse(content) as { items: ParsedExpense[] };
    if (!Array.isArray(parsed.items)) throw new Error('AI did not return items array');

    return parsed.items;
  } catch (error) {
    console.error('Error parsing expenses in @repo/ai:', error);
    throw error;
  }
}
