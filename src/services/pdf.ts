import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Page } from "../db/schema";

async function toBase64DataUri(fileUri: string): Promise<string> {
  const file = new File(fileUri);
  const base64 = await file.base64();
  return `data:image/jpeg;base64,${base64}`;
}

function buildHtml(
  documentName: string,
  pages: { dataUri: string }[]
): string {
  const pageImages = pages
    .map(
      (page) =>
        `<div style="page-break-after:always;text-align:center;margin:0;padding:0;">
          <img src="${page.dataUri}" style="width:100%;height:auto;display:block;" />
        </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${documentName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#fff; }
  img { width:100%; height:auto; display:block; }
</style>
</head>
<body>
${pageImages}
</body>
</html>`;
}

export async function exportToPdf(
  documentName: string,
  pages: Page[]
): Promise<void> {
  const pagesWithBase64 = await Promise.all(
    pages.map(async (page) => ({
      dataUri: await toBase64DataUri(page.image_uri),
    }))
  );

  const html = buildHtml(documentName, pagesWithBase64);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Share ${documentName}`,
    });
  }
}

export async function exportPageAsImage(
  imageUri: string,
  fileName: string
): Promise<void> {
  const source = new File(imageUri);
  const dest = new File(Paths.cache, fileName);
  source.copy(dest);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest.uri, {
      mimeType: "image/jpeg",
      dialogTitle: `Share ${fileName}`,
    });
  }
}

export async function exportAllAsImages(
  pages: Page[],
  documentName: string
): Promise<void> {
  for (const page of pages) {
    const fileName = `${documentName}_page${page.page_number}.jpg`;
    await exportPageAsImage(page.image_uri, fileName);
  }
}
