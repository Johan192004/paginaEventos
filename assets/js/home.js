async function mandarMensaje(){
    let nombre;
    let correo; 
    let asunto;
    let mensaje;

    let url = obtenerUrlActual()
    indexSlash = url.indexOf("/")
    url = url.splice(indexSlash)
    url = url + "/mensajes"

    let URLBd = "http://localhost:3000"
    URLBd = URLBd + "/mensajes"

    await fetch(URLBd,{
            "method":"POST",
            "Content-Type" : "application/json",
            "body": JSON.stringify({
                "nombre": nombre,
                "correo": correo,
                "asunto": asunto,
                "mensaje": mensaje
            })
        })
}

function obtenerUrlActual(){
    let url = window.location.href
    return url
}

async function subscribirse(){
    let correo;

    url = obtenerUrlActual()
    let indexSlash = url.indexOf("/")
    url = url.slice(0,indexSlash)
    url = url + "/suscriptores"

    let URLBd = "http://localhost:3000"
    URLBd = URLBd + "/mensajes"
    
    await fetch(URLBd,{
        "method":"POST",
        "Content-Type" : "application/json",
        "body": JSON.stringify({
            "email": correo,
        })
    })
}