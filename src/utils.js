
import fetchJsonp from 'fetch-jsonp';

let fetchJsonpParams = (baseUrl, params) => {
   let url = new URL(baseUrl);
   Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
   return fetchJsonp(url.toString());
} 

export default fetchJsonpParams;
