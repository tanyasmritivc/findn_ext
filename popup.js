// Popup script for Findn AI extension
// Handles UI interactions and communication with background script

class FindnAIPopup {
  constructor() {
    this.currentTab = null;
    this.isAnalyzing = false;
    this.setupEventListeners();
    this.initializePopup();
  }

  setupEventListeners() {
    // Main analyze button
    document.getElementById('analyzeBtn').addEventListener('click', () => {
      this.analyzeProfile();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.showSettings();
    });

    // Close settings button
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      this.hideSettings();
    });

    // Save settings button
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Retry button
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.analyzeProfile();
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.copyCardContent(e.target.dataset.card);
      });
    });
  }

  async initializePopup() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;

      // Check if we're on a supported platform
      const isSupported = this.isSupportedPlatform(tab.url);
      const isProfile = this.isProfilePage(tab.url);

      if (!isSupported || !isProfile) {
        this.showNotProfileMessage();
        return;
      }

      // Load saved settings
      await this.loadSettings();

      // Show main content
      this.showMainContent();

    } catch (error) {
      console.error('Error initializing popup:', error);
      this.showError('Failed to initialize. Please try again.');
    }
  }

  isSupportedPlatform(url) {
    return url.includes('linkedin.com') || url.includes('instagram.com');
  }

  isProfilePage(url) {
    if (url.includes('linkedin.com')) {
      return url.includes('/in/') || url.includes('/profile/');
    } else if (url.includes('instagram.com')) {
      return !url.includes('/explore') && !url.includes('/reels') && url !== 'https://www.instagram.com/' && url !== 'https://instagram.com/';
    }
    return false;
  }

  async analyzeProfile() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.showLoading();

    try {
      // Scrape profile data from content script
      const profileResult = await chrome.tabs.sendMessage(this.currentTab.id, { 
        action: 'scrapeProfile' 
      });

      if (!profileResult.success) {
        throw new Error('Failed to scrape profile data');
      }

      // Send profile data to background script for AI analysis
      console.log('Sending analyzeProfile message to background');
      
      let analysisResult;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          analysisResult = await chrome.runtime.sendMessage({
            action: 'analyzeProfile',
            profileData: profileResult.data
          });
          break; // Success, exit retry loop
        } catch (error) {
          console.error(`Message sending error (attempt ${retryCount + 1}):`, error);
          
          if (error.message.includes('Receiving end does not exist')) {
            if (retryCount < maxRetries) {
              console.log('Retrying in 1 second...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
              continue;
            } else {
              throw new Error('Extension background script disconnected. Please reload the extension and try again.');
            }
          }
          throw error;
        }
      }

      console.log('Received analysis result:', analysisResult);

      if (!analysisResult) {
        throw new Error('No response from background script. Try reloading the extension.');
      }

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Display results
      this.displayResults(analysisResult.data);

    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(error.message || 'Failed to analyze profile. Please try again.');
    } finally {
      this.isAnalyzing = false;
    }
  }

  displayResults(data) {
    // Show main content
    this.showMainContent();

    // Populate connections card
    this.populateConnectionsCard(data.connections || []);

    // Populate communication starters card
    this.populateStartersCard(data.communication_starters || []);

    // Populate interest expansions card
    this.populateExpansionsCard(data.interest_expansions || []);
  }

  populateConnectionsCard(connections) {
    const container = document.getElementById('connectionsContent');
    container.innerHTML = '';

    if (connections.length === 0) {
      container.innerHTML = '<p style="color: #666; font-size: 13px; text-align: center; padding: 20px;">No connection suggestions available.</p>';
      return;
    }

    connections.forEach(connection => {
      const item = document.createElement('div');
      item.className = 'connection-item';
      item.innerHTML = `
        <div class="connection-title">${this.escapeHtml(connection.title || 'Connection Suggestion')}</div>
        <div class="connection-subtitle">${this.escapeHtml(connection.subtitle || 'No description available')}</div>
      `;
      container.appendChild(item);
    });
  }

  populateStartersCard(starters) {
    const container = document.getElementById('startersContent');
    container.innerHTML = '';

    if (starters.length === 0) {
      container.innerHTML = '<p style="color: #666; font-size: 13px; text-align: center; padding: 20px;">No conversation starters available.</p>';
      return;
    }

    starters.forEach(starter => {
      const item = document.createElement('div');
      item.className = 'starter-item';
      item.innerHTML = `
        <div class="starter-prompt">${this.escapeHtml(starter.prompt || 'No prompt available')}</div>
      `;
      container.appendChild(item);
    });
  }

  populateExpansionsCard(expansions) {
    const container = document.getElementById('expansionsContent');
    container.innerHTML = '';

    if (expansions.length === 0) {
      container.innerHTML = '<p style="color: #666; font-size: 13px; text-align: center; padding: 20px;">No interest expansions available.</p>';
      return;
    }

    expansions.forEach(expansion => {
      const item = document.createElement('div');
      item.className = 'expansion-item';
      item.innerHTML = `
        <div class="expansion-topic">${this.escapeHtml(expansion.topic || 'Interest Topic')}</div>
        <div class="expansion-why">${this.escapeHtml(expansion.why || 'No description available')}</div>
      `;
      container.appendChild(item);
    });
  }

  async copyCardContent(cardType) {
    const button = document.querySelector(`[data-card="${cardType}"]`);
    let content = '';

    try {
      if (cardType === 'connections') {
        const items = document.querySelectorAll('#connectionsContent .connection-item');
        content = Array.from(items).map(item => {
          const title = item.querySelector('.connection-title').textContent;
          const subtitle = item.querySelector('.connection-subtitle').textContent;
          return `${title}\n${subtitle}`;
        }).join('\n\n');
      } else if (cardType === 'starters') {
        const items = document.querySelectorAll('#startersContent .starter-prompt');
        content = Array.from(items).map(item => item.textContent).join('\n\n');
      } else if (cardType === 'expansions') {
        const items = document.querySelectorAll('#expansionsContent .expansion-item');
        content = Array.from(items).map(item => {
          const topic = item.querySelector('.expansion-topic').textContent;
          const why = item.querySelector('.expansion-why').textContent;
          return `${topic}\n${why}`;
        }).join('\n\n');
      }

      await navigator.clipboard.writeText(content);
      
      // Show feedback
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);

    } catch (error) {
      console.error('Copy failed:', error);
      button.textContent = '❌ Failed';
      setTimeout(() => {
        button.textContent = '📋 Copy All';
      }, 2000);
    }
  }

  showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('notProfileMessage').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
  }

  showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorState').style.display = 'flex';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('notProfileMessage').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = false;
  }

  showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('notProfileMessage').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = false;
  }

  showNotProfileMessage() {
    document.getElementById('notProfileMessage').style.display = 'flex';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
  }

  showSettings() {
    document.getElementById('settingsPanel').style.display = 'block';
  }

  hideSettings() {
    document.getElementById('settingsPanel').style.display = 'none';
  }

  async loadSettings() {
    try {
      // Load platform settings (from local storage)
      const result = await chrome.storage.local.get(['linkedinEnabled', 'instagramEnabled']);
      document.getElementById('linkedinToggle').checked = result.linkedinEnabled !== false;
      document.getElementById('instagramToggle').checked = result.instagramEnabled !== false;

      // Check backend status
      this.checkBackendStatus();

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async checkBackendStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    try {
      const result = await chrome.runtime.sendMessage({ action: 'checkBackendStatus' });
      if (result.success && result.status === 'connected') {
        statusIndicator.textContent = '🟢';
        statusText.textContent = 'Backend connected';
      } else {
        statusIndicator.textContent = '🔴';
        statusText.textContent = 'Backend offline - Start the server';
      }
    } catch (error) {
      statusIndicator.textContent = '🔴';
      statusText.textContent = 'Backend offline - Start the server';
    }
  }

  async saveSettings() {
    try {
      const linkedinEnabled = document.getElementById('linkedinToggle').checked;
      const instagramEnabled = document.getElementById('instagramToggle').checked;

      // Save platform settings
      await chrome.storage.local.set({
        linkedinEnabled: linkedinEnabled,
        instagramEnabled: instagramEnabled
      });

      // Show feedback
      const saveBtn = document.getElementById('saveSettingsBtn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.background = '#28a745';

      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '#000000';
        this.hideSettings();
      }, 1500);

    } catch (error) {
      console.error('Error saving settings:', error);
      const saveBtn = document.getElementById('saveSettingsBtn');
      saveBtn.textContent = '❌ Error';
      saveBtn.style.background = '#dc3545';
      
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
        saveBtn.style.background = '#000000';
      }, 2000);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FindnAIPopup();
});
