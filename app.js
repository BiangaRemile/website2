// modules exportations
const express = require('express')
const mysql = require('mysql')
const myconnection = require('express-myconnection')

const optionBd = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'note_nodejs2_db',
}
const app = express()

// extraction des données du formulaire
app.use(express.urlencoded({extended: false}))

// definition du middleward pour connection
app.use(myconnection(mysql, optionBd, 'pool'))

// views engine
app.set('view engine', 'ejs')
app.set('views', 'templates')

// page views
function acceuil(req, res) {

    req.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            res.status(500).render('erreur', {error})
        } else {
            connection.query('SELECT * FROM notes', [], (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(500).render('erreur', {error})
                } else {
                    res.status(200).render('index', {result})
                }
            })
        }
    })
}

function apropos(req, res) {
    res.status(200).render('apropos')
}

function error404(req, res) {
    res.status(400).render('error')
}

// ****************

app.get('/', acceuil)
app.post('/notes', (req, res) => {
    let id = req.body.id === ''? null: req.body.id
    let titre = req.body.titre
    let description = req.body.description

    let sqlReq = id === null 
        ? 'INSERT INTO notes(id, titre, description) VALUES(?, ?, ?)'
        : "UPDATE notes SET titre = ?, description = ? WHERE id = ?"

    let data = id === null ? [null, titre, description]: [titre, description, id]

    if ((titre != '' && description != "") || id === null) {
        req.getConnection((error, connection) => {
            if (error) {
                console.log(error);
                res.status(500).render('erreur', {error})
            } else {
                connection.query(sqlReq, data, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).render('erreur', {error})
                    } else {
                        res.status(300).redirect("/")
                    }
                })
            }
        })
    } else {
        console.log("Veuillez remplir tous les champs");
    }
})
app.delete('/notes/:id', (req, res) => {
    let id = req.params.id;
    req.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            res.status(500).render('erreur', {error})
        } else {
            connection.query('DELETE FROM notes WHERE id = ?', [id], (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(500).render('erreur', {error})
                } else {
                    res.status(200).json({path: "/"})
                }
            })
        }
    })
})
app.get('/apropos', apropos)
app.use(error404)

// retrieve the user form data


// server listen
app.listen(3001, '0.0.0.0', () => console.log("Server listen au port 3001"))
