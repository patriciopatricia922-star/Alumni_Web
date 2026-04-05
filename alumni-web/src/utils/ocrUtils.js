export const verifyAlumniID = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  let lastError = null;

  // 3-attempt retry logic for network stability
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

      // Calling Python server instead of the public OCR API
      const response = await fetch('http://127.0.0.1:8000/api/verify-alumni-id', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Server error: ${response.status}`);
      }

      // The Python backend returns the exact same structure:
      // { verified: true/false, extracted: { firstName, lastName, ... } }
      return result;

    } catch (err) {
      lastError = err.name === 'AbortError'
        ? `Connection timed out (attempt ${attempt}/3).`
        : err.message;

      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000)); 
      }
    }
  }

  throw new Error(lastError || 'Scan failed. Please ensure the Python backend is running.');
};