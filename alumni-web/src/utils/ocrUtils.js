const OCR_API_KEY = 'K82618949788957';

export const verifyAlumniID = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  let data = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      data = await response.json();
      if (data && !data.IsErroredOnProcessing) break;
      lastError = data?.ErrorMessage?.[0] || 'OCR processing failed.';
    } catch (err) {
      lastError = err.name === 'AbortError'
        ? `Scan timed out (attempt ${attempt}/3). Retrying...`
        : err.message;
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!data || data.IsErroredOnProcessing) {
    throw new Error(lastError || 'Scan failed after 3 attempts. Please try again.');
  }

  const rawText   = data.ParsedResults?.[0]?.ParsedText || '';
  const upperText = rawText.toUpperCase();

  const isNU     = upperText.includes('NATIONAL') && upperText.includes('UNIVERSITY');
  const isAlumni = upperText.includes('ALUMNI');

  if (!isNU)     return { verified: false, reason: 'This ID does not appear to be a National University ID.' };
  if (!isAlumni) return { verified: false, reason: 'This ID does not appear to be an Alumni ID. Please use your official branch ID.' };

  const isDasmarinas =
    upperText.includes('DASMARIÑAS') ||
    upperText.includes('NU-D') ||
    upperText.includes('NUD') ||
    /NU\s+D\b/.test(upperText);

  const otherBranches = [
    { keyword: 'MANILA',       label: 'Manila'       },
    { keyword: 'FAIRVIEW',     label: 'Fairview'     },
    { keyword: 'MOA',          label: 'MOA'          },
    { keyword: 'LIPA',         label: 'Lipa'         },
    { keyword: 'BALIWAG',      label: 'Baliwag'      },
    { keyword: 'LAGUNA',       label: 'Laguna'       },
    { keyword: 'CLARK',        label: 'Clark'        },
    { keyword: 'EAST ORTIGAS', label: 'East Ortigas' },
    { keyword: 'BACOLOD',      label: 'Bacolod'      },
    { keyword: 'NAZARETH',     label: 'Nazareth'     },
  ];

  const detectedOtherBranch = otherBranches.find(b => upperText.includes(b.keyword));
  if (detectedOtherBranch) {
    return { verified: false, reason: `This appears to be an NU ${detectedOtherBranch.label} Alumni ID. Only NU Dasmariñas Alumni IDs are accepted for registration.` };
  }
  if (!isDasmarinas) {
    return { verified: false, reason: 'This ID could not be verified as an NU Dasmariñas Alumni ID.' };
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const isNameLine = (line) => {
    const upper = line.toUpperCase();
    return (
      upper === line &&
      !upper.includes('NATIONAL') && !upper.includes('UNIVERSITY') &&
      !upper.includes('ALUMNI')   && !upper.includes('MANILA') &&
      !upper.includes('DASMARIÑAS') && !upper.includes('CLASS') &&
      !upper.includes('BSBA') && !upper.includes('BS') &&
      !upper.includes('AB') && !upper.includes('NUI') &&
      !upper.match(/^[0-9]+$/) && line.length > 2
    );
  };

  let nameLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (isNameLine(lines[i])) {
      nameLines.push(lines[i]);
      if (nameLines.length >= 2) break;
    } else if (nameLines.length > 0) break;
  }
  const fullName = nameLines.join(' ').trim();

  let program = '';
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('BS') || upper.includes('AB') || upper.includes('BSBA') ||
        upper.includes('BSED') || upper.includes('BSCS') || upper.includes('BSIT') ||
        upper.includes('BSECE') || upper.includes('BSCPE') || upper.includes('BSME') ||
        upper.includes('BSCE') || upper.includes('BSEE')) {
      program = line.trim(); break;
    }
  }

  let batchYear = '';
  const yearMatch = rawText.match(/(?:Class\s*)?(\b20\d{2}\b)/i);
  if (yearMatch) batchYear = yearMatch[1];

  let firstName = '', middleName = '', lastName = '';
  if (fullName) {
    const suffixes  = ['JR', 'SR', 'JR.', 'SR.'];
    const particles = ['DELA', 'DE', 'DEL', 'DELOS', 'SAN', 'SANTA', 'LOS', 'LAS'];
    const parts = fullName.split(' ');
    let suffix = '';
    const lastPart = parts[parts.length - 1].replace('.', '').toUpperCase();
    if (suffixes.includes(lastPart) && parts.length > 2) suffix = parts.pop();
    let lastNameParts = [];
    if (parts.length >= 2 && particles.includes(parts[parts.length - 2].toUpperCase())) {
      lastNameParts = parts.splice(parts.length - 2, 2);
    } else {
      lastNameParts = parts.splice(parts.length - 1, 1);
    }
    lastName = lastNameParts.join(' ') + (suffix ? ' ' + suffix : '');
    if      (parts.length === 0) { firstName = '';          middleName = ''; }
    else if (parts.length === 1) { firstName = parts[0];    middleName = ''; }
    else { middleName = parts[parts.length - 1]; firstName = parts.slice(0, parts.length - 1).join(' '); }
    const cap = str => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    firstName = cap(firstName); middleName = cap(middleName); lastName = cap(lastName);
  }

  return { verified: true, extracted: { firstName, middleName, lastName, program, batchYear, rawText } };
};
