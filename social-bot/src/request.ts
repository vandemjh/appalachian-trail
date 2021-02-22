import https from 'https';
import { Album } from './model/album';
require('dotenv').config();

export async function googlePhotosRequest(
  token: string,
  field: 'albums' | 'mediaItems' | 'mediaItems:search',
  id?: string,
  body?: object,
): Promise<Album> {
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

export async function facebookRequest(
  token: string,
  pageId: string,
  id?: string,
  body?: { access_token: string; url?: string },
): Promise<Album> {
  const options = {
    method: body ? 'POST' : 'GET',
    host: `graph.facebook.com`,
    path: `/v9.0/${pageId}/photos`,
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
