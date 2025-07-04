import { DEFAULT_API_URLS } from '../hooks/useApiUrls';

const getApiUrl = (useOllama: boolean = false): string => {
  if (typeof window === 'undefined') {
    return useOllama 
      ? DEFAULT_API_URLS.ollamaApiUrl 
      : (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URLS.backendUrl);
  }

  try {
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      const { backendUrl, ollamaApiUrl } = JSON.parse(settings);
      return useOllama 
        ? (ollamaApiUrl || DEFAULT_API_URLS.ollamaApiUrl)
        : (backendUrl || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URLS.backendUrl);
    }
  } catch (error) {
    console.error('Error getting API URL:', error);
  }

  return useOllama 
    ? DEFAULT_API_URLS.ollamaApiUrl 
    : (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URLS.backendUrl);
};

export const makeApiCall = async (
  endpoint: string,
  options: RequestInit & { useOllama?: boolean } = {}
) => {
  const { useOllama = false, ...fetchOptions } = options;
  const baseUrl = getApiUrl(useOllama);

  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Failed to parse response');
    }

    if (!response.ok) {
      const errorMessage = 
        (typeof responseData === 'object' && responseData !== null && 'message' in responseData)
          ? responseData.message
          : `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const makeOllamaApiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    let baseUrl = getApiUrl(true);
    
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    
    const apiPath = cleanEndpoint === 'api/generate' ? 'api/generate' : `api/${cleanEndpoint}`;
    const url = `${baseUrl}/${apiPath}`;
    
    console.log('Making Ollama API call to:', url);
    
    let apiKey = null;
    if (typeof window !== 'undefined') {
      try {
        const settings = localStorage.getItem('app_settings');
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.ollamaApiKey) {
            apiKey = parsed.ollamaApiKey;
          } else {
            apiKey = localStorage.getItem('ollama_api_key');
          }
        } else {
          apiKey = localStorage.getItem('ollama_api_key');
        }
      } catch (error) {
        console.error('Error reading API key from localStorage:', error);
        apiKey = localStorage.getItem('ollama_api_key');
      }
    }
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      ...(options.headers || {})
    });
    
    console.log('Request headers:', Object.fromEntries(headers.entries()));
    
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      let errorMessage = `Ollama API request failed with status ${response.status}`;
      let errorDetails: any = { status: response.status, statusText: response.statusText };
      
      try {
        const errorData = await response.text();
        try {
          const parsedError = JSON.parse(errorData);
          errorDetails.errorData = parsedError;
          if (parsedError && parsedError.error) {
            errorMessage = `Ollama API error: ${parsedError.error}`;
          }
        } catch (e) {
          errorDetails.errorText = errorData;
          errorMessage = `Ollama API error: ${errorData || response.statusText}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      
      console.error('Ollama API error details:', {
        ...errorDetails,
        url,
        method: options.method || 'GET',
        headers: Object.fromEntries(headers.entries())
      });
      
      if (response.status === 403) {
        errorMessage = 'API authentication failed. Please check your API key in Settings.';
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found. Please check the API endpoint.';
      } else if (response.status >= 500) {
        errorMessage = 'The Ollama server encountered an error. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
    
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('Ollama API response:', { 
      status: response.status, 
      contentType,
      responseData: typeof responseData === 'string' ? 
        (responseData.length > 200 ? responseData.substring(0, 200) + '...' : responseData) : 
        responseData 
    });
    
    if (typeof responseData === 'string') {
      try {
        const lines = responseData.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          try {
            const parsed = JSON.parse(lastLine);
            responseData = parsed;
          } catch (e) {
            try {
              responseData = JSON.parse(lines[0]);
            } catch (e) {
              console.warn('Could not parse Ollama response as JSON, returning raw text');
            }
          }
        }
      } catch (e) {
        console.warn('Error processing Ollama response:', e);
      }
    }
    
    if (responseData && typeof responseData === 'object') {
      return responseData;
    }
    
    return responseData;
  } catch (error) {
    console.error('Ollama API call failed:', error);
    throw error;
  }
};
