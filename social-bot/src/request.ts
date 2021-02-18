import https from 'https';
require('dotenv').config();

export default async function getPhotos(
  token: string,
  field: 'albums' | 'mediaItems' | 'mediaItems:search',
  id?: string,
  body?: object,
): Promise<object> {
  const options = {
    method: body ? 'POST' : 'GET',
    host: `photoslibrary.googleapis.com`,
    path: `/v1/${field + (id ? '/' + id : '')}?key=${process.env.API_KEY}`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    var data: string = '';
    let request = https.request(options, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
      resp.on('error', (err) => {
        reject(err);
      });
    });
    body
      ? request.write(JSON.stringify(body), () => request.end())
      : request.end();
  });
}
