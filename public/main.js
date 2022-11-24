let body = document.querySelector('body');

let contatos = document.querySelectorAll('.lugaresctt');
window.addEventListener('load', function() {
    let contatos = document.querySelectorAll('.lugaresctt');
    for(let i = 0; i < contatos.length ; i++){
    contatos[i].addEventListener('scroll', function () {
    })
    }
})

window.addEventListener('scroll', function () {
   const olhar = $(document).scrollTop()+80;
   const teste2 = window.innerHeight*0.75;
    const bg1 = document.querySelector('.bgimg1');
     const teste = ($('.bgimg1').offset().top)-teste2;
     const teste4 = ($('.bgimg2').offset().top)-teste2;
     const texto2 = ($('#whoare').offset().top)-teste2;
     const texto3 = ($('#txtwhoare').offset().top)-teste2;
     if(olhar > teste){
         $('.bgimg1').addClass('fadein')
     }
     if(olhar > texto2){
        $('#whoare').addClass('scale-in-hor-left ')
    }
    if(olhar > texto3){
        $('#txtwhoare').addClass('slide-in-top')
    }
    if(olhar > teste4){
        $('.bgimg2').addClass('fadein')
    }
    $('.lugaresctt').each(function () {
        const teste5 = ($(this).offset().top)-teste2;
        if(olhar > teste5){
            $(this).addClass('scale-in-tl')
        }
    })

    $('.dividido2terminal').each(function () {
        let teste8 = ($(this).offset().top)-teste2;
        if(olhar > teste8){
            $(this).addClass('slide-in-left')
        }
    })


})


$( document ).ready(function() {
    $('#btnwho').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerabout').classList.remove('sumir2');
        $('#containerabout').addClass('aparecer')
        var a = document.querySelector('#whoare');
        a.scrollIntoView();
    }
    )
    $('#criare').click( function () {
    })

    $('#btnwhere').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerabout').classList.remove('sumir2');
        $('#containerabout').addClass('aparecer')
        var a = document.querySelector('#whereare');
        a.scrollIntoView();
    })
    $('#dropdownMenuLink2').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerabout').classList.remove('sumir2');
        $('#containerabout').addClass('aparecer')
        var a = document.querySelector('#whoare');
    }
    )
    $('.navbar-brand').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerabout').classList.remove('sumir2');
        $('#containerabout').addClass('aparecer')
        var a = document.querySelector('#whoare');
 
    }
    )
    $('#btnews').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containernews').classList.remove('sumir2');
        $('#containernews').addClass('aparecer fade-in-top');
    }
    )
    $('#btnterminal').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerterminais').classList.remove('sumir2');
        $('#containerterminais').addClass('aparecer fade-in-top');
    }
    )
    $('#btnctt').click( function () {
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        $('.show').removeClass('show');
        document.querySelector('#containerabout').classList.remove('sumir2');
        $('#containerabout').addClass('aparecer')
        var a = document.querySelector('.lugaresctt');
        a.scrollIntoView();
    }
    )
    $('#btnourvessel').click( function () {
        $('.show').removeClass('show');
        $('.aparecer').addClass('sumir2');
        $('.aparecer').removeClass('fade-in-top');
        $('.aparecer').removeClass('aparecer');
        document.querySelector('#ctnourvessel').classList.remove('sumir2');
        $('#ctnourvessel').addClass('aparecer fade-in-top');
    }
    )
});

window.setInterval(trocarfoto, 8000);

function trocarfoto() {
    var a =  $('#trocafundoimg').attr("class").split(/\s+/);
    if(a[2] == undefined) {
        $('#trocafundoimg').addClass('limg1')
     }else if(a[2] == 'limg1') {
        $('#trocafundoimg').removeClass('limg1')
        $('#trocafundoimg').addClass('limg2')
     } else if(a[2] == 'limg2') {
        $('#trocafundoimg').removeClass('limg2')
        $('#trocafundoimg').addClass('limg3')
     }else if(a[2] == 'limg3') {
        $('#trocafundoimg').removeClass('limg3')
        $('#trocafundoimg').addClass('limg1')
     }


}

window.onload = function() {
    window.setTimeout(function () {
        document.querySelector('.btn-danger').click()
    }, 3500);
};


function teste(params) {
}