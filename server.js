const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.static("public")); // Servir tu sitio HTML/JS/CSS

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));