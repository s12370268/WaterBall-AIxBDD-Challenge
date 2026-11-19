export async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('請選擇 JPG、PNG 或 WebP 圖片。');
  if (file.size > 5 * 1024 * 1024) throw new Error('照片不可超過 5 MB，請縮小後重新上傳。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    try { await image.decode(); } catch { throw new Error('無法讀取照片，請選擇其他有效的圖片。'); }
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL('image/jpeg', .82);
    if (data.length > 800000) data = canvas.toDataURL('image/jpeg', .5);
    if (data.length > 800000) throw new Error('照片內容過大，請選擇較小的圖片。');
    return data;
  } finally { URL.revokeObjectURL(url); }
}
