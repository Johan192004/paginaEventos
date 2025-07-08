let eventsActiveField = document.querySelector(".eventsActive")
let eventsCancelledField = document.querySelector(".eventsCancelled")
let emailsRegisteredField = document.querySelector(".emailsRegistered")
let newMessagesField = document.querySelector(".newMessages")
let unactiveEventsField = document.querySelector(".unactiveEvents")
let totalEventsField = document.querySelector(".totalEvents")


let URLBd = "http://localhost:3000"

let eventos;
async function obtenerEventos(){
    res = await fetch(`${URLBd + "/eventos"}`)
    let eventos1 = await res.json()
    return eventos1
}

let correos;
async function obtenerCorreos(){
    res = await fetch(`${URLBd + "/suscriptores"}`)
    let eventos1 = await res.json()
    return eventos1
}

let mensajes;
async function obtenerMensajes(){
    res = await fetch(`${URLBd + "/mensajes"}`)
    let eventos1 = await res.json()
    return eventos1
}


document.addEventListener("DOMContentLoaded", async()=>{
    eventos = await obtenerEventos()
    correos = await obtenerCorreos()
    mensajes = await obtenerMensajes()
    console.log("eventos",eventos)

    //Activos
    let numeroDeEventosActivos = 0;

    for(evento of eventos){
        if(evento.estado == "activo"){
            numeroDeEventosActivos += 1
        }
    }

    eventsActiveField.textContent = `${numeroDeEventosActivos}`

    //Cancelados
    let numeroDeEventosCancelados = 0;

    for(evento of eventos){
        if(evento.estado == "cancelado"){
            numeroDeEventosCancelados += 1
        }
    }

    eventsCancelledField.textContent = `${numeroDeEventosCancelados}`


    //Totales
    totalEventsField.textContent = `${eventos.length}`

    //Inactivos
    let numeroDeEventosInactivos = 0;

    for(evento of eventos){
        if(evento.estado == "inactivo"){
            numeroDeEventosInactivos += 1
        }
    }
    console.log(unactiveEventsField)
    unactiveEventsField.textContent = `${numeroDeEventosInactivos}`


    console.log(correos)

    emailsRegisteredField.textContent = `${correos.length}`



    //newMessagesField
    console.log("mensajes",mensajes)

    if(window.localStorage.getItem("nuevosMensajes")){

        let mensajesViejos = parseInt(window.localStorage.getItem("nuevosMensajes"))
        let mensajesNuevos = mensajes.length - mensajesViejos
        newMessagesField.textContent = mensajesNuevos
        window.localStorage.setItem("nuevosMensajes", mensajes.length)

    } else {

        window.localStorage.setItem("nuevosMensajes", mensajes.length)
        newMessagesField.textContent = mensajes.length
    }
})

