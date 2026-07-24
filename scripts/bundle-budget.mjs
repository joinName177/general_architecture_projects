import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const maximumGzipBytes = {
  "main.css": 75 * 1024,
  "main.js": 150 * 1024,
};

for (const [assetName, maximumBytes] of Object.entries(maximumGzipBytes)) {
  const asset = await readFile(`dist/${assetName}`);
  const compressedBytes = gzipSync(asset).byteLength;

  if (compressedBytes > maximumBytes) {
    throw new Error(
      `${assetName} is ${compressedBytes} gzip bytes; the budget is ${maximumBytes} bytes.`,
    );
  }
}
