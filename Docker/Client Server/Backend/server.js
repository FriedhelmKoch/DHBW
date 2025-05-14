const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;
app.get('/api', (req, res) => {
	res.json({ message: 'Hello from the backend' });
});
app.listen(PORT, () => {
	console.log(`Backend running on port ${PORT}`);
});
