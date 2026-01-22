async function getDirectDownloadUrl(url, contentType) {
  if (!url) return url;

  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/, // لروابط الملفات العادية
      /id=([a-zA-Z0-9_-]+)/, // لروابط الـ Query Params
    ];

    let fileId = null;
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  if (url.includes('archive.org/details/')) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const identifier = pathParts[pathParts.indexOf('details') + 1];

      if (!identifier) return url;

      const apiUrl = `https://archive.org/metadata/${identifier}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Archive API error: ${res.statusText}`);

      const data = await res.json();
      if (!data.files || !data.files.length) return url;

      let targetFile;

      const findFile = extensionRegex => {
        let f = data.files.find(f => f.name?.match(extensionRegex) && f.source === 'original');
        if (!f) f = data.files.find(f => f.name?.match(extensionRegex));
        return f;
      };

      if (contentType === 'pdf') {
        targetFile = findFile(/\.pdf$/i);
      } else if (contentType === 'video') {
        targetFile = findFile(/\.(mp4|mkv|avi|mov|webm)$/i);
      } else if (contentType === 'text') {
        targetFile = findFile(/\.txt$/i);
      }

      if (!targetFile) {
        targetFile = data.files.find(
          f =>
            f.name &&
            !f.name.endsWith('_meta.xml') &&
            !f.name.endsWith('_files.xml') &&
            !f.name.endsWith('.jpg'),
        );
      }

      if (!targetFile) return url;

      const fileName = encodeURIComponent(targetFile.name);
      return `https://archive.org/download/${identifier}/${fileName}`;
    } catch (err) {
      console.error('Error processing archive URL:', err.message);
      return url;
    }
  }

  if (url.includes('archive.org/download/')) {
    return url;
  }

  return url;
}

module.exports = getDirectDownloadUrl;
