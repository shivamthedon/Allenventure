const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/content', (req, res) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading database');
      return;
    }
    res.send(data);
  });
});

app.post('/api/content', (req, res) => {
  const { page, content } = req.body;
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading database');
      return;
    }
    const db = JSON.parse(data);
    db[page] = content;
    fs.writeFile('db.json', JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error writing to database');
        return;
      }
      res.send('Content updated successfully');
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});