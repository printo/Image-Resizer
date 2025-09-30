export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  // Get the access token from cookies
  const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const accessToken = cookies.access;

  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
