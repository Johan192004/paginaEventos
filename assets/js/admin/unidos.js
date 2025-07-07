document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
      }
    });
  });

  const form = document.getElementById('form-suscripcion');
  const correoInput = document.getElementById('correoInput');

  if (form && correoInput) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const correo = correoInput.value.trim();
      if (correo) {
        const mensaje = {
          nombre: 'Usuario',
          correo: correo,
          asunto: 'Nuevo mensaje',
          mensaje: 'Este es un mensaje de prueba'
        };
        localStorage.setItem('mensajeContacto', JSON.stringify(mensaje));
        correoInput.value = '';
      }
    });
  }

  // Mostrar mensaje de contacto en el card de contact.html
  const mensajeContacto = document.getElementById('mensaje-contacto');
  if (mensajeContacto) {
    const mensajeGuardado = localStorage.getItem('mensajeContacto');
    if (mensajeGuardado) {
      const datos = JSON.parse(mensajeGuardado);
      mensajeContacto.textContent = `${datos.nombre} (${datos.correo}) - ${datos.asunto}: ${datos.mensaje}`;
    }
  }

  // Mostrar mensaje de contacto en la tabla de subscriptions.html
  const tbody = document.querySelector('table tbody');
  if (tbody) {
    const mensajeGuardado = localStorage.getItem('mensajeContacto');
    if (mensajeGuardado) {
      const datos = JSON.parse(mensajeGuardado);
      const rowCount = tbody.rows.length + 1;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${rowCount}</strong></td><td>${datos.correo}</td><td><a href="#" class="text-danger btn-eliminar">Eliminar</a></td>`;
      tbody.appendChild(tr);
    }
  }

  // Delegación de eventos para eliminar filas
  if (tbody) {
    tbody.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-eliminar')) {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (row) row.remove();
      }
    });
  }
});
