// src/service/directLink.js

async function getDirectDownloadUrl(url, contentType) {
  // ✅ Google Drive
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/d\/(.*?)\//)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // ✅ archive.org/details
  if (url.includes('archive.org/details/')) {
    const identifier = url.split('archive.org/details/')[1];
    if (!identifier) return url;

    try {
      const apiUrl = `https://archive.org/metadata/${identifier}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Archive API error: ${res.statusText}`);

      const data = await res.json();
      if (!data.files || !data.files.length) return url;

      // فلترة حسب الـ contentType
      let firstFile;
      if (contentType === 'pdf') {
        firstFile = data.files.find(f => f.name?.endsWith('.pdf'));
      } else if (contentType === 'video') {
        firstFile = data.files.find(f => f.name?.match(/\.(mp4|mkv|avi)$/i));
      } else if (contentType === 'text') {
        firstFile = data.files.find(f => f.name?.endsWith('.txt'));
      }

      // fallback → أول ملف غير meta
      if (!firstFile) {
        firstFile = data.files.find(f => f.name && !f.name.endsWith('_meta.xml'));
      }

      if (!firstFile) return url;

      const fileName = encodeURIComponent(firstFile.name);
      return `https://archive.org/download/${identifier}/${fileName}`;
    } catch (err) {
      console.error('Error fetching archive metadata:', err.message);
      return url;
    }
  }

  // ✅ archive.org/download (مباشر)
  if (url.includes('archive.org/download/')) {
    return url;
  }

  return url; // fallback
}

module.exports = getDirectDownloadUrl;
