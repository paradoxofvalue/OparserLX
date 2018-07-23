const fs = require('fs');
const url = require('url');
const osmosis = require('osmosis');
const rp = require('request-promise');

let success = 0,
  fail = 0;

let savedData = [];

let basePropertyUrl = 'https://www.olx.ua/';


let properties = new osmosis
  .get(basePropertyUrl)
  // .config('proxy', '159.224.15.231:8080')
  .delay(3000)
  .find('#searchmain-container .maincategories .maincategories-list:nth-child(1) .li:nth-child(2) .item')
  // .find('#topLink li.visible:nth-child(2)')
  .follow('a')
  .find('#topLink li.visible')
  .follow('a')
  // .find('#locationLinks .locationlinks')
  // .follow('a')
  .delay(3000)
  .paginate('.pager.rel.clr .fbold.next.abs.large a[href]', 2)
  .delay(3000)
  .find('#offers_table td.offer')
  .follow('a.detailsLink.link')
  .delay(3000)
  .set({
    'title': '#offerdescription .offer-titlebox h1',
    'price': '#offerbox .price-label strong',
  })
  .then((document, data) => {
    if (document.__location.hash == '#from404') {
      return;
    }
    let phoneToken = document.body.innerHTML.split("phoneToken")[1].split("'")[1].split("'")[0],
      urlId = document.location.pathname.split('-ID')[1].split('.')[0],
      urlTemp = document.location.origin + '/ajax/misc/contact/phone/' + urlId + '/?pt=' + phoneToken,
      xpid = document.head.innerHTML.split("xpid")[1].split('"')[1].split('"')[0];

    data.id = urlId;

    let parsedUrl = url.parse(urlTemp),
      cookies = '';
    parsedUrl.uri = urlTemp;
    parsedUrl.url = urlTemp;
    Object.keys(document.cookies).forEach((item, key) => {
      if (key == 'PHPSESSID') {
        cookies += item + '=' + document.cookies[item];
      }
    });

    // cookies = cookies.substring(0, cookies.length - 2);

    parsedUrl.headers = {
      // 'Accept': '*/*',
      // 'Accept-Encoding': 'gzip, deflate, br',
      // 'Accept-Language': 'en-GB,en;q=0.9',
      // 'Cache-Control': 'no-cache',
      // 'Connection': 'keep-alive',
      'Cookie': cookies,
      // 'Host': document.__location.host,
      // 'Pragma': 'no-cache',
      'Referer': document.__location.origin + document.__location.pathname,
      // 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
      // 'X-NewRelic-ID': xpid,
      // 'X-Requested-With': 'XMLHttpRequest',
    };

    rp(parsedUrl, (error, response, body) => {
      if (IsJsonString(body)) {
        let phone = JSON.parse(body).value;
        if (phone != '000 000 000') {
          data.phone = phone;
        }
      }
    });
  })
  .delay(5000)
  .data((data) => {
    if (data.phone) {
      success++;
      console.log(success, ' - Success: ', data)
    } else {
      fail++;
      console.log(fail, ' - Fail: ', data);
    }
    savedData.push(data);
  })
  .error(console.log)
  .done(function (attr, attr1, attr2, attr3) {
    debugger;
  });

properties.run();


function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}