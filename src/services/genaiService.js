/*
 * File Path: src/services/genaiService.js
 * Description: Service for communicating with GenAI Chatbot REST API (http://localhost:8090/api/chatbot/chat) or serving fallback responses.
 * Parameters: role (string), message (string).
 * Backend Integration: Connects to chatbot-service running on port 8090.
 */
export async function askGenAi({ role, message }) {
  const endpoint = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8090/api/chatbot/chat';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleName: role, message })
    });

    if (!response.ok) {
      return fallback(role, message);
    }

    const data = await response.json();
    return data.reply || fallback(role, message);
  } catch {
    return fallback(role, message);
  }
}

function fallback(role, message) {
  const text = message.toLowerCase();
  if (text.includes('plan')) return 'Open Plans to view, add, edit, delete, or choose membership plans.';
  if (text.includes('attendance')) return 'Attendance is month-wise. Admin can manage all; members and trainers can self check in.';
  if (text.includes('trainer')) return 'Members can request trainers, and trainers can accept or reject requests.';
  if (text.includes('class')) return 'Admin schedules classes; users can book only one class per day.';
  return `I can help the ${role} role with members, trainers, plans, classes, attendance, and payments.`;
}
