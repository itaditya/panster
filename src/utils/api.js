import { jsEpisodes } from '../fixtures/searchEpisodes';

export function getEpisodes() {
  const url = new URL('https://listen-api.listennotes.com/api/v2/search');
  const params = {
    q: 'javascript',
    type: 'episode',
    len_min: '20',
    only_in: 'title,description',
    language: 'English',
  };
  url.search = new URLSearchParams(params).toString();

  return new Promise(async (resolve, reject) => {
    if(process.env.MOCKED_API) {
      resolve(jsEpisodes); // comment in prod.
      return;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
        }
      });
      if(!res.ok) {
        throw new Error('Request failed');
      }
      const data = await res.json();
      resolve(data);
    } catch(error) {
      reject(error);
    }
  });
}
