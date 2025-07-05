let url = obtenerUrlActual()
let indexUltimoSlash = url.indexOf("/")
url = url.slice(0,indexUltimoSlash)
url = url + "/usuarios"

let URLBd = "http://localhost:3000"
URLBd = URLBd + "/usuarios"
let usuarios;
async function obtenerUsuarios(){
    usuarios = await fetch(URLBd).then(res => res.json())
}


let botonIniciarSesion = document.getElementById("iniciarSesion")

botonIniciarSesion.addEventListener("click",(e)=>{

    let inputCorreo = document.getElementById("email")
    let correo = inputCorreo.value    
    let inputContraseña = document.getElementById("password")
    let contraseña = inputContraseña.value

    if(correo && contraseña && usuarios){

        for(item of usuarios) {

            if((correo == item.username) && (contraseña == item.password)){

                window.sessionStorage.setItem("auth","true")
                window.location.pathname = "/assets/admin/desktop.html"

            }

        }
    
    }
})