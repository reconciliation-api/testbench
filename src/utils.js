
import fetchJsonp from 'fetch-jsonp';

const addParams = (baseUrl, params) => {
   let url = new URL(baseUrl);
   if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
   }
   return url.toString();
}

export const fetchJsonpParams = (baseUrl, params) => {
   return fetchJsonp(addParams(baseUrl, params), {timeout: 20000});
} 

export const fetchParams = (baseUrl, params) => {
   return fetch(addParams(baseUrl, params));
}

export const postJsonpParams = ({url,queries}) => {
   return fetchJsonp(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
         queries
       })
   });
}


export const postParams = ({
   url,
   queries,
   userLanguage = "en"
 }) => {
   return fetch(url, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "Accept-Language": userLanguage,
         },
         body:queries,
       });
 };

export const jsonTheme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#000000', // '#272822',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#00ff00', //'#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633'
    };


