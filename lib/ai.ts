import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY?.trim();
const allowedChatTopics = [
  {
    keywords: ["menu", "recommend", "pair", "upsell", "dish", "drink"],
    response:
      "For a quick upsell, pair mains with one starter, one bread or rice add-on, and a beverage. Popular Indian combos are paneer tikka with naan, biryani with raita, and kebabs with lime soda.",
  },
  {
    keywords: ["order", "kot", "kitchen", "ticket"],
    response:
      "For smoother kitchen flow, send KOTs early, keep item notes short and precise, and move tickets through pending, preparing, and ready in real time so service and kitchen stay aligned.",
  },
  {
    keywords: ["table", "dine", "guest", "reservation"],
    response:
      "For dine-in service, confirm pax count, mark occupied tables promptly, and close the table only after payment so reporting and floor visibility stay accurate.",
  },
  {
    keywords: ["payment", "bill", "settle", "upi", "cash", "card"],
    response:
      "Use the bill flow for quick cash settlement, and keep the settle flow for split or assisted payments. For public demos, the app records a safe simulated payment without hitting a live gateway.",
  },
  {
    keywords: ["inventory", "stock", "supplier", "purchase"],
    response:
      "Track your highest-use ingredients daily, map them to best-selling items, and review low-stock alerts before service so purchase orders stay ahead of demand.",
  },
  {
    keywords: ["report", "dashboard", "sales", "customer"],
    response:
      "The live dashboard now reads from recent orders and day-end reports. Watch sales, average order value, new customers, and hourly peaks to guide staffing and promotions.",
  },
];

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function buildMenuIntelligenceFallback(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("biryani")) {
    return "Try pairing the biryani with raita, kebabs, or a chilled lime soda for a fuller meal.";
  }

  if (lowerPrompt.includes("paneer") || lowerPrompt.includes("naan")) {
    return "A strong pairing here would be dal makhani, garlic naan, and a sweet lassi or masala cola.";
  }

  if (lowerPrompt.includes("tandoor") || lowerPrompt.includes("kebab")) {
    return "These work well with mint chutney, roomali roti, and a sparkling lemon drink.";
  }

  return "Good add-ons for this basket: one shareable starter, one bread or rice side, and a refreshing drink like lime soda or iced tea.";
}

function buildChatFallback(message: string) {
  const lowerMessage = message.toLowerCase();
  const match = allowedChatTopics.find((topic) =>
    topic.keywords.some((keyword) => lowerMessage.includes(keyword)),
  );

  return (
    match?.response ??
    "I’m running in demo mode right now, so I can still help with menu suggestions, order flow, billing, kitchen tickets, and dashboard metrics even without a live Gemini key."
  );
}

export async function getMenuIntelligence(prompt: string) {
  if (!ai) {
    return buildMenuIntelligenceFallback(prompt);
  }

  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });
    const response = await model;
    return response.text ?? buildMenuIntelligenceFallback(prompt);
  } catch (error) {
    console.warn("[AI_MENU_FALLBACK]", error);
    return buildMenuIntelligenceFallback(prompt);
  }
}

export async function getChatResponse(message: string) {
  if (!ai) {
    return buildChatFallback(message);
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction:
          "You are a helpful assistant for Bhukkad, a restaurant operations system. You help staff with menu items, orders, kitchen flow, guest service, and general restaurant operations.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text ?? buildChatFallback(message);
  } catch (error) {
    console.warn("[AI_CHAT_FALLBACK]", error);
    return buildChatFallback(message);
  }
}
