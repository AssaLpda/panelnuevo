
    const usuariosValidos = {
      lumi: "hola123",
      assa: "hola123",
      tuty: "hola123",
      negro: "hola123"
    };

    document.getElementById("btn-login").addEventListener("click", () => {
      const usuario = document.getElementById("usuario").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("error-msg");

      if (usuariosValidos[usuario] && usuariosValidos[usuario] === password) {
        window.location.href = "panel.html";
      } else {
        errorMsg.classList.remove("hidden");
      }
    });
