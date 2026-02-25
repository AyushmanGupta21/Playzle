const https = require('https');
https.get('https://codebox.tubeguruji.com/', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const regex = /(https:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif))/g;
        const matches = data.match(regex);
        console.log([...new Set(matches)]);
    });
});
