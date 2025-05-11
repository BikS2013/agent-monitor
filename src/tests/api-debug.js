// API Debug Script
// Add this to your browser console to debug API issues

(function() {
  // Check localStorage settings
  function checkSettings() {
    console.log('=== API Settings Debug ===');
    console.log('apiEnabled:', localStorage.getItem('apiEnabled'));
    console.log('apiAuthMethod:', localStorage.getItem('apiAuthMethod'));
    console.log('agent_monitor_api_token:', localStorage.getItem('agent_monitor_api_token'));
    console.log('apiClientSecret:', localStorage.getItem('apiClientSecret'));
    console.log('apiClientId:', localStorage.getItem('apiClientId'));
  }
  
  // Override the fetch API to monitor requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    console.log('Fetch intercepted:', {
      url: url,
      method: options ? options.method : 'GET',
      headers: options ? options.headers : {},
      body: options ? options.body : null
    });
    
    return originalFetch.apply(this, arguments)
      .then(response => {
        console.log('Fetch response:', {
          url: url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        return response;
      })
      .catch(error => {
        console.error('Fetch error:', {
          url: url,
          error: error.message
        });
        throw error;
      });
  };
  
  // Override XMLHttpRequest to monitor API calls
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function() {
    this._url = arguments[1];
    this._method = arguments[0];
    console.log('XHR intercepted:', {
      url: this._url,
      method: this._method
    });
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    
    // Listen for load event
    xhr.addEventListener('load', function() {
      console.log('XHR response:', {
        url: xhr._url,
        status: xhr.status,
        statusText: xhr.statusText,
        responseType: xhr.responseType,
        response: xhr.responseText && xhr.responseText.length < 1000 ? xhr.responseText : '[Response too large]'
      });
    });
    
    // Listen for error event
    xhr.addEventListener('error', function() {
      console.error('XHR error:', {
        url: xhr._url,
        status: xhr.status,
        statusText: xhr.statusText
      });
    });
    
    return originalXHRSend.apply(this, arguments);
  };
  
  // Add a test function to check if API is reachable
  window.testApi = function(url) {
    const apiUrl = url || 'http://localhost:8000/system/health';
    console.log(`Testing API connectivity to ${apiUrl}...`);
    
    return fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Short timeout to detect connectivity issues quickly
      timeout: 5000
    })
    .then(response => {
      if (response.ok) {
        console.log('✅ API connectivity test successful!');
        return response.json().then(data => {
          console.log('API response:', data);
          return data;
        });
      } else {
        console.error('❌ API connectivity test failed with status:', response.status);
        return response.text().then(text => {
          console.error('API error response:', text);
          return { error: `Status ${response.status}`, message: text };
        });
      }
    })
    .catch(error => {
      console.error('❌ API connectivity test failed with error:', error.message);
      return { error: 'Network Error', message: error.message };
    });
  };
  
  // Run initial checks
  checkSettings();
  console.log('=== API Debug Tools Installed ===');
  console.log('Use window.testApi() to test API connectivity');
})();