import { Metadata } from "./metadata";

export interface Media {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: Metadata;
  filename: object;
}
