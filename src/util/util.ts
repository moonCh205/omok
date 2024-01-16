export const customLog = {
  bool: false,
  log: function (...m: any) {
    if (this.bool) {
      console.log(...m);
    }
  },
};
import { HTTP_ADDRESS } from 'util/const';
import { IdxedDbManager } from 'util/indexedDB/indexedDB';
export namespace UtilUser {
  export async function login() {
    // const request = { data: {} };
    const userID = getCookie('USERID');
    const request = await JsonHttpReponse(`${HTTP_ADDRESS}storage/user/${userID}`).then((data) => {
      return { ...data, userId: userID };
    });
    return request;
  }
  export async function join() {
    return await JsonHttpReponse('https://geolocation-db.com/json/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }).then((data) => {
      const baseStr = data['IPv4'] + new Date().getTime();
      const hash = btoa(baseStr);
      setCookie('USERID', hash);
      const dbName = 'Concave';
      const tableName = 'user';
      const indexedDb = new IdxedDbManager(dbName).createTable(tableName, [{ id: '1', userId: hash }]);
      return hash;
    });
  }
}

export async function JsonHttpReponse(
  url: string,
  requestOptions: { method: string; headers?: { 'Content-Type'?: string; Accept?: string } } = {
    method: 'GET',
  }
) {
  if (requestOptions.headers === undefined) {
    requestOptions.headers = {
      'Content-Type': 'application/json',
    };
  }
  const reponse = await fetch(url, requestOptions);
  return reponse.json();
}
export function getCookie(name: string) {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
export function setCookie(name: string, value: any) {
  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  document.cookie = updatedCookie;
}
