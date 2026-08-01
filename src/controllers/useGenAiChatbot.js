/*
 * File Path: src/controllers/useGenAiChatbot.js
 * Description: Controller custom hook for managing chatbot widget state, user prompts, loading flags, and assistant replies.
 * Parameters: role (string).
 */
import { useState } from 'react';
import { askGenAi } from '../services/genaiService.js';

export function useGenAiChatbot(role) {
  const [messages, setMessages] = useState([
    { id: 'initial-1', sender: 'assistant', text: 'Hi, I can help with plans, attendance, classes, trainers, and payments.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { id: `msg-${Date.now()}-1`, sender: 'user', text };
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
    const reply = await askGenAi({ role, message: text });
    setMessages((current) => [...current, { id: `msg-${Date.now()}-2`, sender: 'assistant', text: reply }]);
    setIsLoading(false);
  };

  return { messages, isLoading, sendMessage };
}
