let LS = localStorage
// if (LS.getItem('welcome','agree')){
//     {
//         document.getElementById("welcomeBox").style.display = 'none'
//         setTimeout(function (){
//             document.getElementById('menu').classList.remove('blur')
//             document.getElementById('container').classList.remove('blur')
//             document.body.style.overflow = 'auto'
//         },100)
//     }
// }
// document.getElementById('welcomeAgree').addEventListener('click',(item)=>{
//
// })
document.getElementById('container').classList.remove('blur')
document.body.style.overflow = 'auto'
LS.setItem('welcome', 'agree')

let prevScrollpos = window.pageYOffset;

// Появление Кнопок и header при скроле
window.onscroll = function () {
    let currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("control__panel").style.bottom = "0";
        document.getElementById("header__pre__container").style.top = "-0px";
    } else {
        document.getElementById("control__panel").style.bottom = "-100px"; // Вы можете изменить это значение
        document.getElementById("header__pre__container").style.top = "-100px"; // Вы можете изменить это значение
    }

    prevScrollpos = currentScrollPos;
};
const postObserver2 = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        const headerContainer = document.getElementById('header__pre__container');

        if (entry.isIntersecting) {
            // Элемент "header" виден
            headerContainer.classList.remove("header__container__fixed");
        } else {
            // Элемент "header"  не виден
            headerContainer.classList.add("header__container__fixed");
        }
    });
});

const header = document.getElementById('header');
postObserver2.observe(header);
// end