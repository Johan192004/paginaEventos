let url = obtenerUrlActual()
let indexUltimoSlash = url.indexOf("/")
url = url.slice(0,indexUltimoSlash)
url = url + "/usuarios"
console.log("URL",url)

let URLBd = "http://localhost:3000"
URLBd = URLBd + "/usuario"

console.log("URL",URLBd)
let usuarios;
async function obtenerUsuarios(){
    res = await fetch(URLBd)
    usuarios1 = await res.json()
    return usuarios1
}


document.addEventListener("DOMContentLoaded", async()=>{
    usuarios = await obtenerUsuarios()
    console.log(usuarios)
})



function obtenerUrlActual(){
    let url = window.location.href
    return url
}

let botonIniciarSesion = document.getElementById("iniciarSesion")

botonIniciarSesion.addEventListener("click",(e)=>{

    let inputCorreo = document.getElementById("email")
    let correo = inputCorreo.value    
    let inputContraseña = document.getElementById("password")
    let contraseña = inputContraseña.value
    console.log(usuarios)

    if(correo && contraseña && usuarios){

        for(item of usuarios) {

            if((correo == item.username) && (contraseña == item.password)){

                window.sessionStorage.setItem("auth","true")
                window.location.pathname = "/assets/admin/desktop.html"

            }

        }
    
    }
})