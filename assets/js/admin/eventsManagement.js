const API_URL = "http://localhost:3000/eventos";

let eventosPorPagina = 2;
let paginaActual = 1;
let filtroBusqueda = "";

// =======================
// FUNCIÓN PARA ENVIAR NOTIFICACIÓN VIA PIPEDREAM
// =======================
async function enviarNotificacionPipedream(evento) {
  const PIPEDREAM_WEBHOOK_URL = "https://eovgmtyl88h0thn.m.pipedream.net"; // Reemplaza con tu variable de entorno

  try {
    const response = await fetch(PIPEDREAM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha: evento.fecha,
        hora: evento.hora,
        lugar: evento.lugar,
        imagen: evento.imagen,
        estado: evento.estado,
        mensaje: `¡Nuevo evento creado: ${evento.titulo}!`
      })
    });

    if (response.ok) {
      console.log("✅ Notificación enviada exitosamente via Pipedream");
    } else {
      console.warn("⚠️ Error al enviar notificación via Pipedream:", response.status);
    }
  } catch (error) {
    console.error("❌ Error al conectar con Pipedream:", error);
  }
}

//&_limit=${eventosPorPagina}&_page=${paginaActual}

// =======================
// MOSTRAR EVENTOS
// =======================



async function mostrarEventos() {
  const contenedor = document.querySelector(".eventos .row");
  contenedor.innerHTML = "";

  const res = await fetch(`${API_URL}?q=${filtroBusqueda}&_sort=createdAt&_order=desc`);
  const eventos = await res.json();

  eventos.forEach(evento => {
    const col = document.createElement("div");
    col.className = "col-12 d-flex align-items-start";

    col.innerHTML = `
    <div class="card imagen-card me-2">
        <img src="${evento.imagen}" class="card-img-top" alt="${evento.titulo}" />
        <div class="card-body text-center">
          <strong>Imagen</strong>
        </div>
    </div>
    <div class="card descripcion-card">
        <div class="card-body d-flex flex-column justify-content-between h-100">
            <div class="mb-2">
                <p class="mb-1">
                    <strong class="text-danger">Estado:</strong>
                    <span class="estado-tag ${evento.estado}">
                      ${evento.estado.toUpperCase()}
                    </span>
                </p>
                <p class="mb-2 text-danger fw-semibold">📅 ${evento.fecha}</p>
                <h5 class="titulo mb-2">${evento.titulo}</h5>
                <p class="descripcion mb-2 fst-italic">${evento.descripcion}</p>
                <p class="descripcion mb-1">📍 <span class="fw-semibold">${evento.lugar}</span></p>
                <p class="descripcion mb-3">⏰ <span class="fw-semibold">${evento.hora}</span></p>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-outline-primary btn-sm" onclick="editarEvento('${evento.id}')">
                ✏️ Editar
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="eliminarEvento('${evento.id}')">
                🗑️ Eliminar
              </button>
            </div>
        </div>
    </div>
    `;

    contenedor.appendChild(col);
    

  });

  let campoPrincipal = document.getElementById("editarPrincipal")
  console.log(campoPrincipal)

  campoPrincipal.addEventListener("change",()=>{
      console.log(campoPrincipal.value)
      if(campoPrincipal.value == "si"){
        

        let eventosPrincipales = eventos.filter(e => e.principal == true)
        
        if((eventosPrincipales).length >= 3){

          if(!document.getElementById("titulosEventos")){
            console.log("Ya existe el campo de los titulos de los eventos")
          } else {
            let divSacarPrincipal = document.createElement("div")
            divSacarPrincipal.innerHTML = `<label>Seleccione un evento que dejara de ser principal</label>
            <select id="titulosEventos" class="form-select" required>
                          <option value="0">${eventosPrincipales[0].titulo}</option>
                          <option value="1">${eventosPrincipales[1].titulo}</option>
                          <option value="2">${eventosPrincipales[2].titulo}</option>
                      </select>`

            campoPrincipal.closest("div").appendChild(divSacarPrincipal)
          }

          

        }       
      } 
        
    })
}

// =======================
// FILTRAR EVENTOS POR NOMBRE
// =======================
document.querySelector(".search-bar input").addEventListener("input", e => {
  filtroBusqueda = e.target.value;
  paginaActual = 1;
  mostrarEventos();
});

// =======================
// CAMBIAR CANTIDAD DE EVENTOS POR PÁGINA
// =======================
document.getElementById("eventCount").addEventListener("change", e => {
  eventosPorPagina = parseInt(e.target.value);
  paginaActual = 1;
  mostrarEventos();
});

// =======================
// AGREGAR EVENTO
// =======================
document.querySelector(".btn-agregar").addEventListener("click", () => {
  // Limpiar el formulario
  document.getElementById("formEditar").reset();
  document.getElementById("editarId").value = "";
  document.getElementById("modalEditar").style.display = "flex";
});

// =======================
// ELIMINAR EVENTO
// =======================
async function eliminarEvento(id) {
  const confirmar = confirm("¿Estás seguro de que deseas eliminar este evento?");
  if (!confirmar) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  mostrarEventos();
}

// =======================
// EDITAR EVENTO (MOSTRAR FORMULARIO MODAL)
// =======================
async function editarEvento(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const evento = await res.json();

  document.getElementById("editarId").value = evento.id;
  document.getElementById("editarTitulo").value = evento.titulo;
  document.getElementById("editarDescripcion").value = evento.descripcion;
  document.getElementById("editarFecha").value = evento.fecha;
  document.getElementById("editarHora").value = evento.hora || "00:00";
  document.getElementById("editarLugar").value = evento.lugar;
  document.getElementById("editarEstado").value = evento.estado;
  document.getElementById("editarImagen").value = evento.imagen;

  document.getElementById("modalEditar").style.display = "flex";
}

// =======================
// CERRAR MODAL
// =======================
function cerrarModal() {
  document.getElementById("modalEditar").style.display = "none";
}

// =======================
// GUARDAR CAMBIOS DEL FORMULARIO
// =======================
document.getElementById("formEditar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editarId").value;
  const archivo = document.getElementById('fileInput').files[0];
  if (!archivo) {
        alert("Por favor selecciona una imagen.");
        return;
  }

  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('upload_preset', 'demo_unsigned');

  try {
        const respuesta = await fetch('https://api.cloudinary.com/v1_1/dxsxlcgby/image/upload', {
          method: 'POST',
          body: formData
        });

        const datos = await respuesta.json();

        if (datos.secure_url) {
          console.log(datos.secure_url)
          const evento = {
            titulo: document.getElementById("editarTitulo").value,
            descripcion: document.getElementById("editarDescripcion").value,
            fecha: document.getElementById("editarFecha").value,
            hora: document.getElementById("editarHora").value,
            lugar: document.getElementById("editarLugar").value,
            imagen: `${datos.secure_url}` || "https://placehold.co/600x400/EEE/000?text=Evento",
            estado: document.getElementById("editarEstado").value,
            principal: false,
            createdAt: Date.now()
          };

  if (id) {
    // MODO EDITAR
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento)
    });
  } else {
    // MODO AGREGAR - Aquí se envía la notificación
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento)
    });
    
    // Enviar notificación via Pipedream solo cuando se crea un evento nuevo
    await enviarNotificacionPipedream(evento);
  }

          cerrarModal();
          mostrarEventos();
        } else {
          console.error("Error en la respuesta:", datos);
          alert("Ocurrió un error al subir la imagen.");
        }

      } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo subir la imagen. Intenta nuevamente.");
      }

  
});

// =======================
// INICIAR APP
// =======================
document.addEventListener("DOMContentLoaded", mostrarEventos);