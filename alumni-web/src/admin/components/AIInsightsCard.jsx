// src/components/AIInsightsCard.jsx
import React, { useState, useEffect } from 'react';
import AIService from '../services/AIService';
import './AIInsightsCard.css';

const AIInsightsCard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    const result = await AIService.getFeedbackInsights();
    
    if (result.status === 'success') {
      setInsights(result);
    } else if (result.status === 'no_data') {
      setInsights(null);
      setError('No feedback data available yet');
    } else {
      setError('Unable to fetch AI insights');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="ai-insights-card loading">
        <div className="ai-icon">🤖</div>
        <h3>AI Analysis</h3>
        <p>Analyzing alumni feedback...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-insights-card error">
        <div className="ai-icon">🤖</div>
        <h3>AI Insights</h3>
        <p>{error}</p>
        <button onClick={fetchInsights} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!insights || insights.total === 0) {
    return (
      <div className="ai-insights-card">
        <div className="ai-icon">🤖</div>
        <h3>AI Insights</h3>
        <p>No feedback data to analyze yet. Once alumni submit feedback, insights will appear here.</p>
      </div>
    );
  }

  return (
    <div className="ai-insights-card">
      <div className="ai-header">
        <div className="ai-icon">🤖</div>
        <h3>AI-Powered Insights</h3>
        <span className="ai-badge">Beta</span>
      </div>
      
      <p className="ai-summary">{insights.summary}</p>
      
      <div className="ai-sentiment">
        <h4>Sentiment Analysis</h4>
        <div className="sentiment-bars">
          <div className="sentiment-bar positive" style={{ width: `${insights.sentiment.positive_percentage}%` }}>
            <span>Positive {insights.sentiment.positive_percentage}%</span>
          </div>
          <div className="sentiment-bar neutral" style={{ width: `${insights.sentiment.neutral_percentage}%` }}>
            <span>Neutral {insights.sentiment.neutral_percentage}%</span>
          </div>
          <div className="sentiment-bar negative" style={{ width: `${insights.sentiment.negative_percentage}%` }}>
            <span>Negative {insights.sentiment.negative_percentage}%</span>
          </div>
        </div>
        <div className="sentiment-stats">
          <span>Total analyzed: {insights.total} feedback entries</span>
        </div>
      </div>
      
      {insights.themes && insights.themes.length > 0 && (
        <div className="ai-themes">
          <h4>Key Themes</h4>
          <div className="theme-chips">
            {insights.themes.map((theme, i) => (
              <span key={i} className="theme-chip">
                {theme.theme} ({theme.count})
              </span>
            ))}
          </div>
        </div>
      )}
      
      {insights.keywords && insights.keywords.length > 0 && (
        <div className="ai-keywords">
          <h4>Frequently Mentioned</h4>
          <div className="keyword-cloud">
            {insights.keywords.map((keyword, i) => (
              <span key={i} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button onClick={fetchInsights} className="refresh-insights">
        Refresh Analysis
      </button>
    </div>
  );
};

export default AIInsightsCard;