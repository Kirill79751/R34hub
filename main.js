const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
// Установка EJS как шаблонизатора
app.set('view engine', 'ejs');

// Подключение статической директории для обслуживания файлов в папке "public"
app.use(express.static('public'), bodyParser.urlencoded({extended: true}));


// Устанавливаем хранилище и имя файла
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('1')
        const uploadPath = 'public/uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

// Создаем объект multer
const upload = multer({storage: storage});

// Функция для перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Запросы к бд


async function executeQuery(sqlQuery) {
    // Создаем подключение к базе данных
    const connection = await mysql.createConnection({
        host: "192.168.1.108",
        user: "root",
        database: "rule34",
        password: ""
    });

    try {
        // Выполняем SQL-запрос
        const [rows, fields] = await connection.execute(sqlQuery);

        // Возвращаем результат
        return rows;
    } catch (error) {
        // Обрабатываем ошибку
        console.error('Ошибка при выполнении SQL-запроса:', error);
        throw error;
    } finally {
        // Закрываем соединение с базой данных после выполнения запроса
        await connection.end();
    }
}

function hashPassword(password, salt) {
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    return hash.toString('hex');
}

// Маршрут для отображения изображений
app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const endPost = parseInt(req.query.endPost) || 10;
    const firstPost = parseInt(req.query.firstPost) || 0;
    await executeQuery(`SELECT * FROM post 
WHERE idPost BETWEEN ${firstPost} AND ${endPost}
ORDER BY idPost DESC;
`)
        .then(result => {
            console.log(`SELECT * FROM post WHERE idPost BETWEEN ${firstPost} AND ${endPost}`);
            // Рендеринг шаблона EJS и передача данных
            if (page <= 1) {
                res.render('index', {result: result});
            } else {
                res.render('img', {result: result});
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
    console.log(page)

});
// Маршрут для обработки загрузки файла
app.post('/upload', upload.single('uploadImg'), async (req, res) => {
    if (req.file) {
        console.log('File uploaded:', req.file.filename);
        await executeQuery(`INSERT INTO post (\`imgUser\`, \`urlUsre\`, \`nameUser\`, \`imgPost\`, \`tagPost\`) VALUES ('${req.body.imgUser}', '${req.body.userId}', '${req.body.userName}', './uploads/${req.file.filename}', '')`)
            .then(result => {
                console.log('Результат SQL-запроса:', result);
                res.render('login', {userName: result[0].nameUser, imgUser: result[0].imgUser, id: result[0].ID})
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        res.render('upload');
    } else {
        console.error('Error uploading file.');
        res.status(500).send('Internal Server Error');
    }
});

app.get('/upload', (req, res) => {
    res.render('upload')
});
app.get('/uploadImg', (req, res) => {
    res.render('uploadImg')
})
app.get('/login', (req, res) => {
    res.render('login', {userName: 'none', imgUser: 'none', id: 'none'})
})
app.post('/postLogin', async (req, res) => {
    let login = req.body.login
    let salt = '1';
    try {
        let saltResult = await executeQuery(`SELECT salt FROM user WHERE login = '${login}'`);

        // Если запрос был успешен, обновляем значение соли
        salt = saltResult[0].salt;
    } catch (error) {
    }

    let pass = hashPassword(req.body.pass, salt);
    await executeQuery(`SELECT * FROM user WHERE login = '${login}' AND pass='${pass}'`)
        .then(result => {
            console.log('Результат SQL-запроса:', result);
            res.render('login', {userName: result[0].userName, imgUser: result[0].imgUser, id: result[0].ID})
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });

})
app.get('/reg', (req, res) => {
    res.render('reg')
})
app.post('/postReg', async (req, res) => {
    function generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    const salt = generateSalt();

    function hashPassword(password, salt) {
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
        return hash.toString('hex');
    }

    const login = req.body.login
    const userName = req.body.userName
    let pass = hashPassword(req.body.pass, salt);


    await executeQuery(`INSERT INTO user (userName, login, pass, salt) VALUES ('${userName}','${login}','${pass}','${salt}')`)
        .then(result => {
            console.log('Результат SQL-запроса:', result);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });

})

// Запуск сервера
app.listen(3000, '127.0.0.1', () => {
    console.log(`Server is running at http://127.0.0.1:${port}`);
});
