const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Quick regex check first (fast, free, catches obvious cases)
const cashPatterns = /(gpay|phonepe|paytm|google pay|upi|\b\d{10}\b|₹\s?\d+|rs\.?\s?\d+|cash)/i;

const checkMessage = async (text) => {
  // Fast local check first
  if (cashPatterns.test(text)) {
    return { flagged: true, reason: 'Mentions cash/payment terms' };
  }

  // AI deeper check (for indirect attempts)
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Does this message attempt to bypass a skill-barter platform by offering/requesting real money, payment apps, or sharing a phone number for off-platform payment? Reply ONLY "YES" or "NO".\n\nMessage: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();

    return { flagged: response.includes('YES'), reason: response.includes('YES') ? 'AI detected payment bypass attempt' : null };
  } catch (error) {
    console.error('Gemini check failed:', error.message);
    return { flagged: false, reason: null }; // fail-safe: don't block on API error
  }
};

module.exports = checkMessage;