
import { Potrace } from "potrace";
import sharp from "sharp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Metodo non permesso");
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  try {
    const bmp = await sharp(buffer).toFormat("bmp").toBuffer();

    const tracer = new Potrace({
      threshold: 128,
      turdSize: 2
    });

    tracer.loadImage(bmp, () => {
      tracer.getSVG((err, svg) => {
        if (err) return res.status(500).send("Errore nella conversione");
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(svg);
      });
    });
  } catch (e) {
    res.status(500).send("Errore interno");
  }
}
