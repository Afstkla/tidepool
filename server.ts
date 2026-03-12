import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 7744;

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Tidepool running on http://localhost:${PORT}`);
});
