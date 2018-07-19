const fs = require('fs');
const https = require('https');
const url = require('url');

const osmosis = require('osmosis');
const request = require('request');
const rp = require('request-promise');

let savedData = [];

let basePropertyUrl = 'https://www.olx.ua/nedvizhimost/';

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

let rubric = [
  { name: 'Квартиры, комнаты', url: 'kvartiry-komnaty', subrubrics: [{ name: '', url: '', },] },
  { name: 'Дома', url: 'doma', subrubrics: [{ name: '', url: '', },] },
  { name: 'Земля', url: 'zemlya', subrubrics: [{ name: '', url: '', },] },
  { name: 'Коммерческая недвижимость', url: 'kommercheskaya-nedvizhimost', subrubrics: [{ name: '', url: '', },] },
  { name: 'Гаражи, парковки', url: 'garazhy-parkovki', subrubrics: [{ name: '', url: '', },] },
  { name: 'Посуточная аренда жилья', url: 'posutochno-pochasovo', subrubrics: [{ name: '', url: '', },] },
  { name: 'predlozheniya-ot-zastroyshchikov', url: 'Предложения от застройщиков', subrubrics: [{ name: '', url: '', },] },
];

areas.forEach((area, aindex) => {
  rubric.forEach((rubric, rindex) => {
    let url = basePropertyUrl + "/" + rubric.url + "/" + area.url + "/";
    instance = new osmosis.get(url)
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

        cookies = cookies.substring(0, cookies.length - 2);

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
  })
})




function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}