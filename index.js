const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const connection = mysql.createConnection({
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'jhon'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/canciones', (req, res) => {
    connection.query('SELECT * FROM canciones', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
app.post('/canciones', (req, res) => {
    // No necesitas incluir el ID aquí porque será autoincrementado por MySQL
    const newSong = req.body;

    connection.query('INSERT INTO canciones SET ?', newSong, (err, result) => {
        if (err) throw err;
        // Utiliza el insertId proporcionado por MySQL para obtener el ID autoincrementado
        newSong.id = result.insertId;
        res.json(newSong);
    });
});

app.put('/canciones/:id', (req, res) => {
    const id = req.params.id;
    connection.query('UPDATE canciones SET ? WHERE id = ?', [req.body, id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) return res.status(404).send('Canción no encontrada');
        res.json(req.body);
    });
});
app.delete('/canciones/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM canciones WHERE id = ?', id, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) return res.status(404).send('Canción no encontrada');
        res.json({ id: id, message: 'Canción eliminada' });
    });
});
//archivo json
app.get('/canciones', (req, res) => {
    const data = JSON.parse(fs.readFileSync('repertorio.json', 'utf-8'));
    res.json(data);
});

app.post('/canciones', (req, res) => {
    let data = JSON.parse(fs.readFileSync('repertorio.json', 'utf-8'));
    // Asignamos un ID a la nueva canción usando el timestamp actual
    req.body.id = Date.now().toString();
    data.push(req.body);
    fs.writeFileSync('repertorio.json', JSON.stringify(data));
    res.json(req.body);
});

app.put('/canciones/:id', (req, res) => {
    let data = JSON.parse(fs.readFileSync('repertorio.json', 'utf-8'));
    const id = req.params.id;
    const index = data.findIndex(song => song.id == id);
    if (index === -1) return res.status(404).send('Canción no encontrada');
    data[index] = req.body;
    fs.writeFileSync('repertorio.json', JSON.stringify(data));
    res.json(req.body);
});

app.delete('/canciones/:id', (req, res) => {
    let data = JSON.parse(fs.readFileSync('repertorio.json', 'utf-8'));
    const id = req.params.id;
    const index = data.findIndex(song => song.id == id);
    if (index === -1) return res.status(404).send('Canción no encontrada');
    const removed = data.splice(index, 1);
    fs.writeFileSync('repertorio.json', JSON.stringify(data));
    res.json(removed[0]);
});
