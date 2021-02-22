import { Picture } from "./picture";

export interface Album {
  mediaItems: Array<Picture>;
  nextPageToken?: string;
}
