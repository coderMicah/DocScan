export interface Document {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  document_id: number;
  page_number: number;
  image_uri: string;
  ocr_text: string | null;
  created_at: string;
}

export interface DocumentWithPages extends Document {
  pages: Page[];
}
