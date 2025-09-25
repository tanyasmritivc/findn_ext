// Background script for Findn AI extension
// Handles API communication with backend server

class FindnAIBackground {
  constructor() {
    // Use production backend URL when published
    this.backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-url.railway.app'  // Replace with your deployed URL
      : 'http://localhost:3002';
    this.setupMessageListeners();
    this.keepAlive();
  }

  keepAlive() {
    // Keep the service worker alive with chrome.alarms API (more reliable)
    chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'keepAlive') {
        console.log('Background script keepalive');
      }
    });
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request.action, request);
      
      try {
        if (request.action === 'analyzeProfile') {
          console.log('Handling analyzeProfile request');
          this.handleProfileAnalysis(request.profileData, sendResponse);
          return true; // Keep the message channel open for async response
        } else if (request.action === 'checkBackendStatus') {
          console.log('Handling checkBackendStatus request');
          this.checkBackendStatus(sendResponse);
          return true; // Keep the message channel open for async response
        }
        
        console.log('Unhandled message action:', request.action);
        return false;
      } catch (error) {
        console.error('Error in message listener:', error);
        sendResponse({ success: false, error: error.message });
        return true;
      }
    });
  }

  async handleProfileAnalysis(profileData, sendResponse) {
    try {
      const aiResponse = await this.callBackendAPI(profileData);
      sendResponse({ success: true, data: aiResponse });
    } catch (error) {
      console.error('Profile analysis error:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Failed to analyze profile. Please try again.' 
      });
    }
  }

  async callBackendAPI(profileData) {
    try {
      const response = await fetch(`${this.backendUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileData: profileData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Backend returned unsuccessful response');
      }

      return data.data;
    } catch (fetchError) {
      console.error('Network error calling backend:', fetchError);
      
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
        throw new Error('Cannot connect to Findn AI backend. Make sure the server is running on http://localhost:3002');
      }
      
      throw fetchError;
    }
  }

  async checkBackendStatus(sendResponse) {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (response.ok) {
        sendResponse({ success: true, status: 'connected' });
      } else {
        sendResponse({ success: false, status: 'error' });
      }
    } catch (error) {
      sendResponse({ success: false, status: 'offline' });
    }
  }

}

// Initialize background service
new FindnAIBackground();
