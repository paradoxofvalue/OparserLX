const fs = require('fs');
const https = require('https');
const url = require('url');

const osmosis = require('osmosis');
const request = require('request');
const rp = require('request-promise');

let savedData = [];

instance = new osmosis.get('https://www.olx.ua/nedvizhimost/')
  .delay(2000)
  // .paginate('.pager.rel.clr .fbold.next.abs.large a[href]', 2)
  .find('#offers_table td.offer')
  .delay(5000)
  .follow('a.detailsLink.link')
  .set({
    'title': '#offerdescription .offer-titlebox h1',
    'price': '#offerbox .price-label strong',
    'link': '@href',
  })
  .delay(5000)
  .data(function (data) {
    console.log(data);
    savedData.push(data);
  })
  //попробовать через click на елементе
  // и както прокинуть переменную www_base_ajax
  .then((document, data) => {
    let phoneToken = document.body.innerHTML.split("phoneToken")[1].split("'")[1].split("'")[0],
      urlId = document.location.pathname.split('-ID')[1].split('.')[0];
    // data.url = document.location.origin + '/ajax/misc/contact/phone/' + urlId + '/?pt=' + phoneToken;
    data.url = document.location.origin + '/ajax/misc/contact/phone/' + urlId + '/?pt=' + phoneToken;

    let parsedUrl = url.parse(data.url),
      cookies = '';
    parsedUrl.uri = data.url;
    parsedUrl.url = data.url;
    Object.keys(document.cookies).forEach((item, key) => {
      cookies += item + '=' + document.cookies[item] + '; ';
    });

    cookies = cookies.substring(0, cookies.length-2);

    parsedUrl.headers = {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-GB,en;q=05',
      'Cache-Control': 'no-cache',
      'Cookie': cookies,
      'Host': 'www.olx.ua',
      'Pragma': 'no-cache',
      'Referer': data.link,
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
      'X-Requested-With': 'XMLHttpRequest',
    };

    rp(parsedUrl, (error, response, body) => {
      debugger;
    });
    
  })
  .error(console.log)
  .done(function (attr, attr1, attr2, attr3) {
    fs.writeFile('data.json', JSON.stringify(savedData, null, 4), function (err) {
      if (err) console.error(err);
      else console.log('Data Saved to data.json file');
    })
  });

instance.run();


function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}