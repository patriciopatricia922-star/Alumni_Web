// src/services/AIService.js
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api`;

class AIService {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/health`);
      const data = await response.json();
      this.isAvailable = data.status === 'available';
      console.log('AI Service:', this.isAvailable ? '✅ Available' : '❌ Not available');
    } catch (error) {
      console.error('AI Service check failed:', error);
      this.isAvailable = false;
    }
  }

  async getFeedbackInsights() {
    if (!this.isAvailable) {
      return { status: 'unavailable', message: 'AI service not available' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/feedback-insights`);
      if (!response.ok) throw new Error('Failed to get insights');
      return await response.json();
    } catch (error) {
      console.error('Feedback insights error:', error);
      return { status: 'error', message: error.message };
    }
  }

  async analyzeSingleFeedback(text) {
    if (!this.isAvailable) {
      return { label: 'neutral', score: 0.5 };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return await response.json();
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { label: 'neutral', score: 0.5 };
    }
  }
}

export default new AIService();