import { ApiUrls } from '../hooks/useApiUrls';

export const makeApiCall = async (
  endpoint: string,
  options: RequestInit & { useOllama?: boolean } = {}
) => {
  const { useOllama = false, ...fetchOptions } = options;
  
  let baseUrl: string;
  try {
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      const { backendUrl, ollamaApiUrl } = JSON.parse(settings);
      baseUrl = useOllama ? ollamaApiUrl : backendUrl;
    } else {
      baseUrl = useOllama 
        ? 'http://localhost:11434' 
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
  } catch (error) {
    console.error('Error loading API settings:', error);
    baseUrl = useOllama 
      ? 'http://localhost:11434' 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

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
    const response = await makeApiCall(endpoint, { 
      ...options, 
      useOllama: true,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    
    if (response && typeof response === 'object') {
      return response;
    }
    
    throw new Error('Unexpected response format from Ollama API');
  } catch (error) {
    console.error('Ollama API call failed:', error);
    throw error;
  }
};
