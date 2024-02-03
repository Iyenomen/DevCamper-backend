const NodeGeocoder = require('node-geocoder');
const opencage = require('opencage-api-client');

const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;



// note that the library takes care of URI encoding
// opencage
//   .geocode({ q: '233 Bay State Rd Boston MA 02215' })
//   .then((data) => {
//     // console.log(JSON.stringify(data));
//     if (data.status.code === 200 && data.results.length > 0) {
//       const place = data.results[0];
//       console.log('place',place);
//       console.log('place.formatted',place.formatted);
//       console.log('place.geometry',place.geometry);
//       console.log('place.annotations.',place.annotations.timezone.name);
//     } else {
//       console.log('Status', data.status.message);
//       console.log('total_results', data.total_results);
//     }
//   })
//   .catch((error) => {
//     // console.log(JSON.stringify(error));
//     console.log('Error', error.message);
//     // other possible response codes:
//     // https://opencagedata.com/api#codes
//     if (error.status.code === 402) {
//       console.log('hit free trial daily limit');
//       console.log('become a customer: https://opencagedata.com/pricing');
//     }
//   });

// ... prints
// Theresienhöhe 11, 80339 Munich, Germany
// { lat: 48.1341651, lng: 11.5464794 }
// Europe/Berlin
