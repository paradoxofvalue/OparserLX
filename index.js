const fs = require('fs');
const url = require('url');
const osmosis = require('osmosis');
const rp = require('request-promise');

let success = 0,
  fail = 0;

scrapeAds().then(data => console.log(data));

function scrapeAds(baseUrl) {
  baseUrl = baseUrl || 'https://www.olx.ua/';

  return new Promise((resolve, reject) => {
    let results = [];
    osmosis
      .get(baseUrl)
      .delay(2000)
      .find('#searchmain-container .maincategories .maincategories-list:nth-child(1) .li:nth-child(2) .item')
      .follow('a')
      .delay(2000)
      // .find('#topLink li.visible')
      .find('#topLink li.visible:nth-child(1)')
      .follow('a')
      .delay(2000)
      // .paginate('.pager.rel.clr .fbold.next.abs.large a[href]', 2)
      // .delay(2000)
      .find('#offers_table td.offer')
      .follow('a.detailsLink.link')
      .delay(2000)
      .set({
        'title': '#offerdescription .offer-titlebox h1',
        'price': '#offerbox .price-label strong',
      })
      .then((document, data) => {
        scrapePhone(document, data).then(
          result => {
            data.phone = result;
          },
          error => {
            data.phone = false;
          });
      })
      .delay(7000)
      .data((item) => {
        if (item.phone) {
          success++;
          console.log(success, ' - Success: ', item)
        } else {
          fail++;
          console.log(fail, ' - Fail: ', item);
        }
        results.push(item);
      })
      .error(console.log)
      .done(function (attr, attr1, attr2, attr3) {
        debugger;
      });
  })
}

function scrapePhone(document, data) {
  if (document.__location.hash == '#from404') {
    return;
  }
  let phoneToken = document.body.innerHTML.split("phoneToken")[1].split("'")[1].split("'")[0],
    urlId = document.location.pathname.split('-ID')[1].split('.')[0],
    urlTemp = document.location.origin + '/ajax/misc/contact/phone/' + urlId + '/?pt=' + phoneToken,
    xpid = document.head.innerHTML.split("xpid")[1].split('"')[1].split('"')[0],
    cookies = '',
    parsedUrl = url.parse(urlTemp);

  Object.keys(document.cookies).forEach((item, key) => {
    if (item == 'PHPSESSID') {
      cookies += item + '=' + document.cookies[item];
    }
  });

  data.id = urlId;

  parsedUrl.uri = urlTemp;
  parsedUrl.url = urlTemp;
  parsedUrl.headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': cookies,
    'Host': document.__location.host,
    'Pragma': 'no-cache',
    'Referer': document.__location.href,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
    'X-NewRelic-ID': xpid,
    'X-Requested-With': 'XMLHttpRequest',
  };
  return new Promise((resolve, reject) => {
    let result;
    rp(parsedUrl, (error, response, body) => {
      if (IsJsonString(body)) {
        let phone = JSON.parse(body).value;
        if (phone != '000 000 000') {
          resolve(phone);
        } else {
          reject(phone)
        }
      } else {
        reject(error);
      }
    });
  })
}

function IsJsonString(string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}