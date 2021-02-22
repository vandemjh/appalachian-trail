export interface Metadata {
  creationTime: string;
  width: string;
  height: string;
  photo: {
    cameraMake: string;
    cameraModel: string;
    focalLength: number;
    apertureFNumber: number;
    isoEquivalent: number;
  };
}
