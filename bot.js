const BOT_TOKEN = "YOUR_BOT_TOKEN";
const API_ENDPOINT = "https://claudeai.anshppt19.workers.dev/api/chat?prompt=";
const RATE_LIMIT = new Map();

export default {
async fetch(request, env, ctx) {
if (request.method !== "POST") {
return new Response("🤖✨ Advanced AI Assistant Bot", { status: 200 });
}

try {  
  const update = await request.json();  
  const message = update.message || update.callback_query?.message;  
    
  if (!message) return new Response("OK");  

  const chatId = message.chat.id.toString();  
  const userId = message.from.id.toString();  
  const text = message.text || message.caption || "";  

  // Rate limiting  
  if (RATE_LIMIT.has(userId) && Date.now() - RATE_LIMIT.get(userId) < 1000) {  
    return new Response("OK");  
  }  
  RATE_LIMIT.set(userId, Date.now());  

  // Handle /start command with beautiful welcome page  
  if (text === "/start") {  
    await sendMessage(chatId,   
      "🌟━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌟\n\n" +  
      "🎉 *WELCOME TO AI ASSISTANT BOT* 🎉\n\n" +  
      "🌟━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌟\n\n" +  
      "🤖 *Hello! I'm your intelligent AI assistant*\n\n" +  
      "💡 *What can I do for you?*\n" +  
      "• Answer your questions\n" +  
      "• Help with homework\n" +  
      "• Provide information\n" +  
      "• Have conversations\n" +  
      "• Assist with tasks\n\n" +  
      "🚀 *Just type any message and I'll respond instantly!*\n\n" +  
      "🌟━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌟\n\n" +  
      "👨‍💻 *Developed with ❤️ by:*\n" +  
      "🔹 *@abbas_tech_india* 🔹\n\n" +  
      "🌟━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌟\n\n" +  
      "✨ *Let's start our amazing conversation!* ✨",   
      {   
        parse_mode: "Markdown",  
        reply_markup: {  
          inline_keyboard: [[  
            { text: "🤖 Start Chatting", callback_data: "start_chat" },  
            { text: "ℹ️ About Bot", callback_data: "about_bot" }  
          ], [  
            { text: "👨‍💻 Developer", url: "https://t.me/abbas_tech_india" }  
          ]]  
        }  
      }  
    );  
    return new Response("OK");  
  }  

  if (!text.trim()) return new Response("OK");  

  try {  
    // Send animated thinking message with multiple emojis  
    const thinkingMessage = await sendMessage(chatId,   
      "🧠⚡ *Processing your request...* ⚡🧠\n\n" +  
      "🔍 Analyzing your question...\n" +  
      "💫 Searching for the best answer...\n" +  
      "⏳ Almost there...",   
      { parse_mode: "Markdown" }  
    );  
      
    // Call AI with the API endpoint  
    const aiResponse = await fetch(`${API_ENDPOINT}${encodeURIComponent(text)}`);  
      
    if (!aiResponse.ok) {  
      throw new Error(`API responded with status: ${aiResponse.status}`);  
    }  
      
    const aiData = await aiResponse.json();  
    let answer = aiData.reply || "❌ Sorry, I couldn't process that.";  
      
    // Clean up the answer - remove extra spaces and fix formatting
    answer = answer.replace(/\s+/g, ' ').trim();
      
    // Delete thinking message and send the actual reply
    await deleteMessage(chatId, thinkingMessage.result.message_id);  
      
    // Format the response as requested
    const formattedResponse = `💎 AI Answer💎\n\n${answer}\n\n━━━━━━━━━━━━\n\n🔹 Bot by @abbas_tech_india`;  
      
    await sendMessage(chatId, formattedResponse, {   
      parse_mode: "Markdown",  
      disable_web_page_preview: true   
    });  

  } catch (error) {  
    console.error("AI Error:", error);  
    await sendMessage(chatId,   
      "😱 *Oops! Something went wrong!* 😱\n\n" +  
      "🔧 Service temporarily unavailable\n" +  
      "⏰ Please try again in a moment\n" +  
      "🙏 Thank you for your patience!\n\n" +  
      "💫 *We'll be back soon!* 💫\n\n" +  
      "🔹 *Bot by @abbas_tech_india* 🔹",   
      { parse_mode: "Markdown" }  
    );  
  }  

} catch (error) {  
  console.error("Bot Error:", error);  
  return new Response("Error processing request", { status: 500 });  
}  

return new Response("OK");

}
};

// Enhanced helper functions with emoji feedback
async function sendMessage(chatId, text, options = {}) {
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
chat_id: chatId,
text,
...options
})
});
return response.json();
}

async function deleteMessage(chatId, messageId) {
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
chat_id: chatId,
message_id: messageId
})
});
return response.json();
}