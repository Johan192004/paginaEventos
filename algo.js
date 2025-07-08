document.getElementById("sendBtn").addEventListener("click", () => {
    const mail = {
      name: "PoloPolo",
      email: "brahiamruizalzate@gmail.com"
    };
  
    fetch("https://eovgmtyl88h0thn.m.pipedream.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mail)
    })
      .then(res => {
        if (res.ok) {
          console.log("✅ Datos enviados a Pipedream");
          alert("Correo de bienvenida enviado con éxito.");
        } else {
          console.error("❌ Fallo al enviar datos");
          alert("Error al enviar el correo.");
        }
      })
      .catch(err => {
        console.error("❌ Error de red:", err.message);
        alert("Fallo de red al enviar el correo.");
      });
  });