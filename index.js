var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;

const urlModule = require('url');
const rp = require('request-promise');

var fs = require('fs');
var tunnel = require('tunnel');


var tunelingAgent = tunnel.httpsOverHttp({
  proxy: { // Proxy settings
    host: '134.249.185.208', // Defaults to 'localhost'
    port: '1080', // Defaults to 443
  }
});

let areas = [
  { name: 'Винницкая область', url: 'vin' },
  { name: 'Волынская область', url: 'vol' },
  { name: 'Днепропетровская область', url: 'dnp' },
  { name: 'Донецкая область', url: 'don' },
  { name: 'Житомирская область', url: 'zht' },
  { name: 'Закарпатская область', url: 'zak' },
  { name: 'Запорожская область', url: 'zap' },
  { name: 'Ивано-Франковская область', url: 'if' },
  { name: 'Киевская область', url: 'ko' },
  { name: 'Кировоградская область', url: 'kir' },
  { name: 'Крым (АРК)', url: 'cri' },
  { name: 'Луганская область', url: 'lug' },
  { name: 'Львовская область', url: 'lv' },
  { name: 'Николаевская область', url: 'nik' },
  { name: 'Одесская область', url: 'od' },
  { name: 'Полтавская область', url: 'pol' },
  { name: 'Ровенская область', url: 'rov' },
  { name: 'Сумская область', url: 'sum' },
  { name: 'Тернопольская область', url: 'ter' },
  { name: 'Харьковская область', url: 'kha' },
  { name: 'Херсонская область', url: 'khe' },
  { name: 'Хмельницкая область', url: 'khm' },
  { name: 'Черкасская область', url: 'chk' },
  { name: 'Черниговская область', url: 'chn' },
  { name: 'Черновицкая область', url: 'chv' },
];

var startURL = 'https://www.olx.ua/nedvizhimost/';
var results = [];

var a = tress(performAreas);
a.drain = doneAreas;

var p = tress(performPaginate);
p.drain = donePaginate;

var q = tress(performAd);
q.drain = done;


start();

let count = 0;

function start() {
  areas.forEach(item => {
    let url = startURL+item.url+'/';
    needle.get(url, { agent: tunelingAgent }, function (err, res) {
      if (err) throw err;
      console.log(url);
      a.push(resolve(startURL, url));
    });
  });
  
}

function performAreas(url, cb) {
  needle.get(url, { agent: tunelingAgent }, function (err, res) {
    if (err) throw err;
    console.log(url);
    var $ = cheerio.load(res.body);
    // get ads from first page
    $('#offers_table .offer .title-cell a.detailsLink').each(function () {
      q.push(resolve(url, $(this).attr('href')));
    });
    // get pages
    $('.content .pager .item a').each(function () {
      if ($(this).text().trim().length < 2) {
        p.push(resolve(url, $(this).attr('href')));
      }
    });
    cb();
  });
}

function performPaginate(url, cb) {
  needle.get(url, { agent: tunelingAgent }, function (err, res) {
    if (err) throw err;
    console.log(url);
    var $ = cheerio.load(res.body);
    $('#offers_table .offer .title-cell a.detailsLink').each(function () {
      q.push(resolve(url, $(this).attr('href')));
    });
    cb();
  });
}

function performAd(url, cb) {
  needle.get(url, { agent: tunelingAgent }, function (err, res) {
    if (err) throw err;
    var $ = cheerio.load(res.body);
    console.log(count++, ' ' + url);
    let title = $('h1').text().trim(),
      price = $('#offerbox .price-label strong').text().trim(),
      address = $('#offerdescription .offer-titlebox .show-map-link strong').text().trim(),
      description = $('#offerdescription #textContent').text().trim(),
      name = $('#offerbox .offer-sidebar__box .offer-user__details h4 a').text().trim(),
      lat = $('#mapcontainer').attr('data-lat'),
      lon = $('#mapcontainer').attr('data-lon'),
      rad = $('#mapcontainer').attr('data-rad'),
      attributes = [],
      images = [];

    $('#offerdescription .descriptioncontent .details .item').each(function (i, elem) {
      attributes.push({
        'attr': $(this).find('th').text().trim(),
        'value': $(this).find('td strong').text().trim()
      });
    });

    $('#offerdescription .img-item img').each(function (i, elem) {
      images.push({
        'url': $(this).attr('src'),
        'alt': $(this).attr('alt'),
      });
    });

    scrapePhone(res, url).then(
      result => {
        phone = result;
        results.push({
          'url': url,
          'title': title,
          'price': price,
          'phone': result,
          'address': address,
          'description': description,
          'attributes': attributes,
          'name': name,
          'lat': lat,
          'lon': lon,
          'rad': rad,
          'images': images,
        });
        saveAd(results[results.length - 1]).then(
          result => {
            debugger;
            cb();
          }
        )
        
      },
      error => {
        phone = false;
        cb();
      });
  });
}

function done() {
  // тут что-то делаем с массивом результатов results
  // например, выводит в консоль на этапе тестирования
  debugger;
  console.log(results);
}

function doneAreas() {
  // тут что-то делаем с массивом результатов results
  // например, выводит в консоль на этапе тестирования
  debugger;
  console.log(results);
  fs.writeFile('data.json', JSON.stringify(results, null, 4), function (err) {
    if (err) console.error(err);
    else console.log('Data Saved to data.json file');
  })
}

function donePaginate() {
  // тут что-то делаем с массивом результатов results
  // например, выводит в консоль на этапе тестирования
  debugger;
  console.log(results);
}

function scrapePhone(res, url) {
  let phoneToken = res.body.split("phoneToken")[1].split("'")[1].split("'")[0],
    urlId = url.split('-ID')[1].split('.')[0],
    urlTemp = 'https://www.olx.ua/ajax/misc/contact/phone/' + urlId + '/?pt=' + phoneToken,
    xpid = res.body.split("xpid")[1].split('"')[1].split('"')[0],
    cookies = '',
    parsedUrl = urlModule.parse(urlTemp);

  Object.keys(res.cookies).forEach((item, key) => {
    if (item == 'PHPSESSID') {
      cookies += item + '=' + res.cookies[item];
    }
  });

  parsedUrl.uri = urlTemp;
  parsedUrl.url = urlTemp;
  parsedUrl.headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Cookie': cookies,
    'Host': "www.olx.ua",
    'Pragma': 'no-cache',
    'Referer': url,
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
  });
}

function IsJsonString(string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}

function saveAd(data) {
  return new Promise((resolve, reject) => {
    let result,
      url = 'http://likmap.org:8070/mobile/add-object',
      cookies = 'SESSION=84877953-0c93-4dd8-82e2-509316b001ac',
      // parsedUrl = urlModule.parse(url);
      parsedUrl = {};
      parsedUrl.headers = {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      };
      parsedUrl.method = 'POST';
      parsedUrl.uri = 'http://likmap.org:8070/mobile/add-object'
      parsedUrl.body = {
        'description': data.description,
        'price': {
          'price': data.price,
          'currency': data.price,
        },
        'coordinates': {
          'lat': data.lat,
          'lng': data.lon,
        },
        'title': data.title
      };
      parsedUrl.json = true;
    rp(parsedUrl, (error, response, body) => {
      if (IsJsonString(body)) {
          resolve(response);
      } else {
        reject(error);
      }
    });
  });
}