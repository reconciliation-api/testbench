
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

