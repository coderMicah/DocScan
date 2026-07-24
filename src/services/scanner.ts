import { scanDocument } from "expo-document-scanner";

export interface ScanOptions {
  maxNumDocuments?: number;
  croppedImageQuality?: number; // 0-100
}

export interface ScanResult {
  pages: string[];
  cancelled: boolean;
}

export async function scanPages(
  options?: ScanOptions
): Promise<ScanResult> {
  try {
    const quality = Math.min(
      1,
      Math.max(0, (options?.croppedImageQuality ?? 100) / 100)
    );

    const result = await scanDocument({
      maxNumDocuments: options?.maxNumDocuments ?? 20,
      quality,
    });

    return {
      pages: result.pages.map((page) => page.uri),
      cancelled: false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("cancel")) {
      return {
        pages: [],
        cancelled: true,
      };
    }

    throw error;
  }
}