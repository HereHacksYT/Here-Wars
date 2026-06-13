const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// public klasöründeki html ve js dosyalarını dışarı açıyoruz
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
