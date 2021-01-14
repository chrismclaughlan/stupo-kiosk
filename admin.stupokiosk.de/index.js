const express = require('express');
const app = express();
const path = require('path');


const PORT = 5001;


app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});