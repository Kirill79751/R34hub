let LS = localStorage
let auth = LS.getItem('auth')
if (auth == 'done') {
    let imgUser = LS.getItem('imgUser')
    console.log(imgUser)
    if (imgUser !== 'null') {
        document.getElementById('header__user_p').remove()
        let element = document.createElement("img")
        element.setAttribute('src', imgUser)
        element.setAttribute('alt', 'Изображение')
        element.setAttribute('id', 'header__user__img')
        document.getElementById('header__user').appendChild(element)
    } else {
        document.getElementById('header__user_p').remove()
        let element = document.createElement("img")
        element.setAttribute('src', './img/userDefaut.png')
        element.setAttribute('alt', 'Изображение')
        element.setAttribute('id', 'header__user__img')
        document.getElementById('header__user').appendChild(element)
    }
}