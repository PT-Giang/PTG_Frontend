import { mkdir, copyFile } from "node:fs/promises";
const destination = new URL("../public/study-worker/", import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(new URL("../node_modules/pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), new URL("pdf.worker.min.mjs", destination));
