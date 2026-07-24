import TextRecognition from "@react-native-ml-kit/text-recognition";

export async function recognizeText(imageUri: string): Promise<string> {
  try {
    const result = await TextRecognition.recognize(imageUri);

    // Process block by block to preserve natural document line breaks
    const cleanLines: string[] = [];

    for (const block of result.blocks) {
      for (const line of block.lines) {
        // Strip out non-standard noise symbols if necessary
        cleanLines.push(line.text.trim());
      }
    }

    return cleanLines.join('\n');
  } catch (error) {
    console.error("OCR failed:", error);
    return "";
  }
}