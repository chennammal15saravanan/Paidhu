import https from 'https';

https.get('https://paidhu.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const urls = new Set();
    while ((match = imgRegex.exec(data)) !== null) {
        urls.add(match[1]);
    }
    console.log(Array.from(urls).filter(u => u.includes('wp-content/uploads')).join('\n'));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
