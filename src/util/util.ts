export const customLog = {
  bool: false,
  log: function (...m: any) {
    if (this.bool) {
      console.log(...m);
    }
  },
};

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
