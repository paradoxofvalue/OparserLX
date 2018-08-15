var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;

const urlModule = require('url');
const rp = require('request-promise');

var fs = require('fs');
var tunnel = require('tunnel');
var sqlite3 = require('sqlite3').verbose();

var tunelingAgent = tunnel.httpsOverHttp({
  proxy: {
    host: '134.249.185.208',
    port: '1080',
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


// let testUrl = 'https://www.olx.ua/obyavlenie/sdam-svoyu-1-komn-saltovka-trk-ukraina-na-dlitelnyy-srok-IDBk3xE.html#80a727ef8d';
let testUrl = '';


var db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
  db.run('create table if not exists olx (id text, title text, url text)');
})

let objectAction = [
  {
    'olxName': '',
    'likiName': 'Продажа',
    'likiId': 1,
  },
  {
    'olxName': '',
    'likiName': 'Аренда посуточно',
    'likiId': 2,
  },
  {
    'olxName': '',
    'likiName': 'Аренда помесячно',
    'likiId': 3,
  },
],
  category = [
    {
      'olxName': '',
      'likiName': 'Вторичный рынок',
      'likiId': 1
    },
    {
      'olxName': '',
      'likiName': 'Новострой',
      'likiId': 2
    },
    {
      'olxName': '',
      'likiName': 'Нежилой фонд',
      'likiId': 4
    },
    {
      'olxName': '',
      'likiName': 'Земля',
      'likiId': 5
    },
    {
      'olxName': '',
      'likiName': 'Готовый бизнес',
      'likiId': 7
    },
    {
      'olxName': '',
      'likiName': 'Производство',
      'likiId': 8
    },
  ],
  objectType = [
    {
      'olxName': '',
      'likiName': 'Квартира',
      'likiId': 1
    },
    {
      'olxName': '',
      'likiName': 'Дом',
      'likiId': 3
    },
    {
      'olxName': '',
      'likiName': 'Часть дома',
      'likiId': 5
    },
    {
      'olxName': '',
      'likiName': 'Дача',
      'likiId': 6
    },
    {
      'olxName': '',
      'likiName': 'Пентхаус',
      'likiId': 8
    },
    {
      'olxName': '',
      'likiName': 'Таунхаус',
      'likiId': 9
    },
    {
      'olxName': '',
      'likiName': 'Коттедж',
      'likiId': 10
    },
    {
      'olxName': '',
      'likiName': 'Особняк',
      'likiId': 11
    },
    {
      'olxName': '',
      'likiName': 'Под застройку',
      'likiId': 13
    },
    {
      'olxName': '',
      'likiName': 'Коммерческая',
      'likiId': 17
    },
    {
      'olxName': '',
      'likiName': 'От застройщика',
      'likiId': 18
    },
    {
      'olxName': '',
      'likiName': 'Автосервис',
      'likiId': 19
    },
    {
      'olxName': '',
      'likiName': 'Медицина',
      'likiId': 20
    },
    {
      'olxName': '',
      'likiName': 'Торговля / Сервис',
      'likiId': 22
    },
    {
      'olxName': '',
      'likiName': 'Общественное питание',
      'likiId': 23
    },
    {
      'olxName': '',
      'likiName': 'Здания сельхоз назначения',
      'likiId': 24
    },
    {
      'olxName': '',
      'likiName': 'Торговая точка',
      'likiId': 25
    },
    {
      'olxName': '',
      'likiName': 'Гостиница',
      'likiId': 26
    },
    {
      'olxName': '',
      'likiName': 'Цех / Завод',
      'likiId': 28
    },
    {
      'olxName': '',
      'likiName': 'Офис',
      'likiId': 29
    },
    {
      'olxName': '',
      'likiName': 'Гараж, Паркинг',
      'likiId': 30
    },
    {
      'olxName': '',
      'likiName': 'Склад',
      'likiId': 31
    },
    {
      'olxName': '',
      'likiName': 'Помещение',
      'likiId': 32
    },
    {
      'olxName': '',
      'likiName': 'Здание',
      'likiId': 33
    },
    {
      'olxName': '',
      'likiName': 'Другое',
      'likiId': 37
    },
    {
      'olxName': '',
      'likiName': 'Участки',
      'likiId': 34
    },
    {
      'olxName': '',
      'likiName': 'Земля сельхоз назначения',
      'likiId': 38
    },
    {
      'olxName': '',
      'likiName': 'Комната',
      'likiId': 39
    },
    {
      'olxName': '',
      'likiName': 'Конференцзал',
      'likiId': 40
    },
  ];

start();

let count = 1;

function start() {
  if (testUrl.length) {
    q.push(resolve(startURL, testUrl));
  } else {
    areas.forEach(item => {
      let url = startURL + item.url + '/';
      needle.get(url, { agent: tunelingAgent }, function (err, res) {
        if (err) throw err;
        // console.log(url);
        a.push(resolve(startURL, url));
      });
    });
  }
}

function performAreas(url, cb) {
  needle.get(url, { agent: tunelingAgent }, function (err, res) {
    if (err) throw err;
    // console.log(url);
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
    // console.log(url);
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
    

    let title = $('h1').text().trim(),
      price = $('#offerbox .price-label strong').text().trim(),
      currency = '',
      address = $('#offerdescription .offer-titlebox .show-map-link strong').text().trim(),
      description = $('#offerdescription #textContent').text().trim(),
      name = $('#offerbox .offer-sidebar__box .offer-user__details h4 a').text().trim(),
      nameImage = $('#offerbox .offer-sidebar__box .offer-user__details img').attr('src'),
      lat = $('#mapcontainer').attr('data-lat'),
      lon = $('#mapcontainer').attr('data-lon'),
      rad = $('#mapcontainer').attr('data-rad'),
      attributes = [],
      images = [],
      urlId = url.split('-ID')[1].split('.')[0],
      tempCategory = $('#breadcrumbTop .inline:last-child a span').text().trim(),
      objectAttributeValues = [],
      bargain = false;

    /**
     * description remove тел. 957 - Показать номер -
     */
    while (description.includes('- Показать номер -')) {
      description = description.replace(/- Показать номер -/, '- номер скрыт -');
    }

    /**
     * price transform
     */
    if (price.includes('грн.')) {
      currency = 'UAH';
      price = price.split('грн.')[0].trim();
    } else if (price.includes('$')) {
      currency = 'USD';
      price = price.split('$')[0].trim();
    } else if (price.includes('€')) {
      currency = 'EUR';
      price = price.split('€')[0].trim();
    }

    /**
     * get attributes and values
     */
    $('#offerdescription .descriptioncontent .details .item').each(function (i, elem) {
      attributes.push({
        'attr': $(this).find('th').text().trim(),
        'value': $(this).find('td strong').text().trim()
      });
    });

    /**
     * get images
     */
    $('#offerdescription .img-item img').each(function (i, elem) {
      images.push({
        'link': $(this).attr('src'),
        'alt': $(this).attr('alt'),
      });
    });

    /**
     * boolean variable to check if ad already exist in system
     */
    let isExist = 0;

    /**
     * 
     */
    db.each("select * from olx where id='" + urlId + "'", (err, row) => {
      isExist = 1;
    });

    let objectActionId = '',
      objectCategoryId = '',
      objectTypeId = '';


    /**
     * objectActionId
     */
    if (tempCategory.match(/Долгосрочная аренда/)) {
      objectActionId = 3;
    }
    if (tempCategory.match(/Продажа/)) {
      objectActionId = 1;
    }
    if (tempCategory.match(/посуточно/)) {
      objectActionId = 2;
    }
    if (tempCategory.match(/койко/)) {
      objectActionId = 2;
    }

    if (tempCategory.match('посуточно')) {
      if (tempCategory.match('квартиры')) {
        objectTypeId = 1;
      }
      if (tempCategory.match('дома')) {
        objectTypeId = 3;
      }
      if (tempCategory.match('комнат')) {
        objectTypeId = 39;
        attributes.forEach((item) => {
          switch (item.attr) {
            case 'Планировка': {
              switch (item.value) {
                case 'Пентхаус': {
                  objectTypeId = 8;
                  break;
                }
              }
              break;
            }
          }
        });
      }
    }

    /**
     * objectTypeId
     */
    attributes.forEach((item) => {
      switch (item.attr) {
        case 'Тип объекта': {
          switch (item.value) {
            case 'Квартира': {
              objectTypeId = 1;
              break;
            }
            case 'Часть квартиры':
            case 'Комната': {
              objectTypeId = 39;
              break;
            }
          }
        }
        case 'Тип дома': {
          switch (item.value) {
            case 'Дом':
            case 'Коттедж':
            case 'Таунхаус':
            case 'Клубный дом': {
              objectTypeId = 3;
              break;
            }
            case 'Часть дома': {
              objectTypeId = 5;
              break;
            }
            case 'Дача': {
              objectTypeId = 6;
              break;
            }
          }
        }
        case 'Тип недвижимости': {
          switch (item.value) {
            case 'Земля сельскохозяйственного назначения': {
              objectTypeId = 38;
              break;
            }
            case 'Земля жилой и общественной застройки': {
              objectTypeId = 13;
              break;
            }
            case 'Земля запаса, резервного фонда и общего пользования':
            case 'Земля промышленности, транспорта и другого назначения':
            case 'Земля лесного фонда':
            case 'Земля рекреационного назначения':
            case 'Земля оздоровительного назначения': {
              objectTypeId = 34;
              break;
            }
            case 'Магазин, салон': {
              objectTypeId = 22;
              break;
            }
            case 'Кофейня':
            case 'Ресторан, кафе, бар': {
              objectTypeId = 23;
              break;
            }
            case 'Офисные помещения': {
              objectTypeId = 29;
              break;
            }
            case 'Склад, ангар': {
              objectTypeId = 31;
              break;
            }
            case 'Отдельно стоящие здания': {
              objectTypeId = 33;
              break;
            }
            case 'Помещения свободного назначения':
            case 'Часть здания': {
              objectTypeId = 32;
              break;
            }
            case 'База отдыха, отель': {
              objectTypeId = 26;
              break;
            }
            case 'Помещения промышленного назначения': {
              objectTypeId = 28;
              break;
            }
            case 'Торговая точка на рынке': {
              objectTypeId = 25;
              break;
            }
            case 'Фермерское хозяйство': {
              objectTypeId = 24;
              break;
            }
            case 'Другое': {
              objectTypeId = 37;
              break;
            }
            case 'Гараж':
            case 'Место на парковке':
            case 'Место на паркинге': {
              objectTypeId = 30;
              break;
            }
            case 'Автомойка':
            case 'Шиномонтаж':
            case 'СТО (станция тех. обслуживания)':
            case 'АЗС': {
              objectTypeId = 19;
              break;
            }
          }
        }
      }
    });

    /**
     * objectAttributeValues
     */
    attributes.forEach((item) => {
      switch (item.attr) {
        case 'Этаж': {
          objectAttributeValues.push({
            value: item.value,
            attributeValue: {
              attributeId: 40
            }
          });
          break;
        }
        case 'Этажность': {
          objectAttributeValues.push({
            value: item.value,
            attributeValue: {
              attributeId: 12
            }
          });
          break;
        }
        case 'Общая площадь': {
          if (objectTypeId == 1) {
            objectAttributeValues.push({
              value: +item.value.split(' ')[0],
              attributeValue: {
                attributeId: 7
              }
            });
          } else {
            objectAttributeValues.push({
              value: item.value.split(' ')[0],
              attributeValue: {
                attributeId: 23
              }
            });
          }
          break;
        }
        case 'Площадь кухни': {
          objectAttributeValues.push({
            value: item.value.split(' ')[0],
            attributeValue: {
              attributeId: 35
            }
          });
          break;
        }
        case 'Количество комнат': {
          objectAttributeValues.push({
            value: item.value,
            attributeValue: {
              attributeId: 15
            }
          });
          break;
        }
        case 'Площадь участка': {
          objectAttributeValues.push({
            value: item.value.split(' ')[0],
            attributeValue: {
              attributeId: 28
            }
          });
          break;
        }
        case 'Без комиссии': {
          bargain = true;
          break;
        }
        case 'Тип стен': {
          let tempVal,
            tempId;
          switch (item.value) {
            case 'Кирпичный': {
              tempVal = 27;
              break;
            }
            case 'Панельный': {
              tempVal = 24;
              break;
            }
            case 'Монолитный': {
              tempVal = 25;
              break;
            }
            case 'Деревянный': {
              tempVal = 74;
              break;
            }
            case 'Шлакоблочный': {
              tempVal = 28;
              break;
            }
            case 'Газоблок': {
              tempVal = 560;
              break;
            }
          }
          objectAttributeValues.push({
            value: tempVal,
            attributeValue: {
              attributeId: 32,
              type: 'SELECT'
            }
          });
          break;
        }
        case 'Планировка': {
          let tempVal;
          switch (item.value) {
            case 'Смежная, проходная':
            case 'Малосемейка, гостинка': {
              tempVal = 14;
              break;
            }
            case 'Двухсторонняя':
            case 'Смарт-квартира':
            case 'Многоуровневая':
            case 'Пентхаус':
            case 'Раздельная': {
              tempVal = 13;
              break;
            }
            case 'Свободная планировка':
            case 'Студия': {
              tempVal = 257;
              break;
            }
          }
          objectAttributeValues.push({
            value: tempVal,
            attributeValue: {
              attributeId: 8,
              type: 'SELECT'
            }
          });
          break;
        }
        case 'Отопление': {
          let tempId,
            tempVal;

          switch (objectTypeId) {
            case 1:
            case 19: {
              tempId = 29;
              tempVal = 43;
              break;
            }
            case 3:
            case 5:
            case 6: {
              tempId = 74;
              switch (item.value) {
                case 'Индивидуальное газовое': {
                  tempVal = 76;
                  break;
                }
                case 'Индивидуальное электро': {
                  tempVal = 175;
                  break;
                }
                case 'Твёрдотопливное': {
                  tempVal = 176;
                  break;
                }
                case 'Тепловой насос': {
                  tempVal = 177;
                  break;
                }
                case 'Комбинированное': {
                  tempVal = 481;
                  break;
                }
              }

              break;
            }
            case 28:
            case 31:
            case 32:
            case 33: {
              tempId = 73;
              tempVal = 137;
              break;
            }
            case 20:
            case 22:
            case 23:
            case 26:
            case 29:
            case 39: {
              tempId = 29;
              tempVal = 137;
              break;
            }
            case 37: {
              tempId = 74;
              switch (item.value) {
                case 'Индивидуальное газовое': {
                  tempVal = 76;
                  break;
                }
                case 'Индивидуальное электро': {
                  tempVal = 175;
                  break;
                }
                case 'Твёрдотопливное': {
                  tempVal = 176;
                  break;
                }
                case 'Тепловой насос': {
                  tempVal = 177;
                  break;
                }
                case 'Комбинированное': {
                  tempVal = 481;
                  break;
                }
              }
              break;
            }
          }
          switch (item.value) {
            case 'Централизованное':
            case 'Собственная котельная': {
              tempVal = 42;
            }
          }
          objectAttributeValues.push({
            value: tempVal,
            attributeValue: {
              attributeId: tempId,
              type: 'SELECT'
            }
          });
          break;
        }
        case 'Ремонт': {
          let tempVal,
            tempId;
          switch (objectTypeId) {
            case 1:
            case 39: {
              tempId = 22;
            }
            case 3:
            case 5:
            case 6: {
              tempId = 22;
            }
            case 30:
            case 25: {
              tempId = 76;
            }
            case 31:
            case 32:
            case 33:
            case 28:
            case 29:
            case 20:
            case 22:
            case 23:
            case 26:
            case 37:
            case 40: {
              tempId = 22;
            }
          }
          switch (item.value) {
            case 'Авторский проект': {
              tempVal = 6;
              break;
            }
            case 'Евроремонт': {
              tempVal = 5;
              break;
            }
            case 'Косметический ремонт': {
              tempVal = 4;
              break;
            }
            case 'Жилое состояние': {
              tempVal = 158;
              break;
            }
            case 'После строителей': {
              tempVal = 231;
              break;
            }
            case 'Под чистовую отделку': {
              tempVal = 232;
              break;
            }
            case 'Аварийное состояние': {
              tempVal = 231;
              break;
            }
          }
          objectAttributeValues.push({
            value: tempVal,
            attributeValue: {
              attributeId: tempId,
              type: 'SELECT'
            }
          });
          break;
        }
        case 'Меблирование': {
          objectAttributeValues.push({
            value: true,
            attributeValue: {
              attributeId: 46
            }
          });
          break;
        }
        case 'Бытовая техника': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            switch (arrayItem) {
              case 'Плита':
              case 'Кулер':
              case 'Пылесос':
              case 'Без бытовой техники':
              case 'Сушильная машина':
              case 'Кофемашина':
              case 'Электрочайник':
              case 'Вентилятор, обогреватель':
              case 'Вентилятор':
              case 'обогреватель':
              case 'Посудомоечная машина':
              case 'Микроволновая печь':
              case 'Духовой шкаф':
              case 'Варочная панель': {
                tempValues.push(arrayItem);
                break;
              }
              case 'Стиральная машина': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 24
                  }
                });
                break;
              }
              case 'Холодильник': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 47
                  }
                });
                break;
              }
            }
          })

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Мультимедиа': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            switch (arrayItem) {
              case 'Wi-Fi':
              case 'Телевизор':
              case 'Без мультимедиа': {
                tempValues.push(arrayItem);
                break;
              }
              case 'Кабельное, цифровое ТВ': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 39
                  }
                });
                break;
              }
              case 'Спутниковое ТВ': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 45
                  }
                });
                break;
              }
              case 'Скоростной интернет': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 36
                  }
                });
                break;
              }
            }
          });

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Комфорт': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            switch (arrayItem) {
              case 'Подогрев полов':
              case 'Ванна':
              case 'Гардероб':
              case 'Хоз. помещение, кладовка':
              case 'Хоз. помещение':
              case 'кладовка':
              case 'Гараж':
              case 'Ветровая электро станция':
              case 'Цоколь, подвал':
              case 'Цоколь':
              case 'подвал':
              case 'Сад, огород':
              case 'Сад':
              case 'огород':
              case 'Баcсейн':
              case 'Сауна, баня':
              case 'Сауна':
              case 'баня':
              case 'Спортзал':
              case 'Подсобные помещения':
              case 'Автонавес':
              case 'Беседка, мангал':
              case 'Беседка':
              case 'мангал':
              case 'Гостевой':
              case 'Гостевой, летний дом':
              case 'летний дом':
              case 'Автоматические ворота':
              case 'Забор, ограждение':
              case 'ограждение':
              case 'Забор':
              case 'Автономный электрогенератор':
              case 'Подземный паркинг':
              case 'Гостевой паркинг':
              case 'Парковочное место':
              case 'Решетки на окнах':
              case 'Панорамные окна':
              case 'Душевая кабина':
              case 'Мебель на кухне': {
                tempValues.push(arrayItem);
                break;
              }
              case 'Балкон': {
                objectAttributeValues.push({
                  value: 1,
                  attributeValue: {
                    attributeId: 25
                  }
                });
                break;
              }
              case 'лоджия': {
                objectAttributeValues.push({
                  value: 1,
                  attributeValue: {
                    attributeId: 25
                  }
                });
                break;
              }
              case 'Кондиционер': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 48
                  }
                });
                break;
              }
              case 'Терраса': {
                objectAttributeValues.push({
                  value: 1,
                  attributeValue: {
                    attributeId: 25
                  }
                });
                break;
              }
              case 'Сигнализация':
              case 'Консъерж':
              case 'Охраняемая территория':
              case 'Видеонаблюдение':
              case 'Пожарная сигнализация':
              case 'Сигнализация': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 42
                  }
                });
                break;
              }
              case 'Лифт':
              case 'Грузовой лифт': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 33
                  }
                });
                break;
              }
              case 'Технология "умный дом"': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 18
                  }
                });
                break;
              }
              case 'Солнечные электро панели': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 54
                  }
                });
                break;
              }
            }
          });

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Коммуникации': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            switch (arrayItem) {
              case 'Вывоз отходов':
              case 'Асфальтированная дорога':
              case 'Без коммуникаций': {
                tempValues.push(arrayItem);
                break;
              }
              case 'Газ': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 44
                  }
                });
                break;
              }
              case 'Центральный водопровод': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 49
                  }
                });
                break;
              }
              case 'Скважина': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 49
                  }
                });
                break;
              }
              case 'Электричество': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 37
                  }
                });
                break;
              }
              case 'Центральная канализация': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 41
                  }
                });
                break;
              }
              case 'Канализация септик': {
                objectAttributeValues.push({
                  value: true,
                  attributeValue: {
                    attributeId: 41
                  }
                });
                break;
              }
            }
          });

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Инфраструктура': 
        case 'Инфраструктура (до 500 метров)': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            tempValues.push(arrayItem);
          });

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Ландшафт': {
          let tempDescription = '<br>' + item.attr + ': ',
            tempValues = [],
            valuesArray = item.value.split('\t').join('').split('\n\n');
          valuesArray.forEach(arrayItem => {
            tempValues.push(arrayItem);
          });

          if (tempValues.length) {
            tempDescription += tempValues.join(', ');
            description += tempDescription;
          }
          break;
        }
        case 'Тип гаража': {
          let tempVal;
          switch (item.value) {
            case 'Металлический': {
              tempVal = 81;
              break;
            }
            case 'Кирпичный': {
              tempVal = 27;
              break;
            }
            case 'Пеноблок': {
              tempVal = 560;
              break;
            }
            case 'Бетонный': {
              tempVal = 24;
              break;
            }
          }

          objectAttributeValues.push({
            value: tempVal,
            attributeValue: {
              attributeId: 77
            }
          });
          break;
        }
        case 'Кадастровый номер': {
          description += '<br>' + item.attr + ': ' + item.value;
        }
        case 'Год постройки / сдачи': {
          objectAttributeValues.push({
            value: item.value,
            attributeValue: {
              attributeId: 27
            }
          });
        }
        case 'Внешнее утепление стен': {
          objectAttributeValues.push({
            value: true,
            attributeValue: {
              attributeId: 14
            }
          });
        }
        case 'Тип кровли': {
          description += '<br>' + item.attr + ': ' + item.value;
        }
        case 'Расположение': {
          description += '<br>' + item.attr + ': ' + item.value;
        }
      }
    });

    /**
     * taken from active db table 
     */
    let categoryToType = {
      1: [1, 2, 3, 4, 5, 6, 39],
      7: [20, 21, 22, 23, 26, 24, 19, 25, 37],
      8: [27, 28],
      4: [29, 30, 31, 32, 33, 40],
      5: [13, 34, 38],
      // 2: [1,2],
    };

    Object.keys(categoryToType).forEach(cat => {
      categoryToType[cat].forEach(typ => {
        if (typ == objectTypeId) {
          objectCategoryId = +cat;
        }
      });
    });

    if (!isExist && objectTypeId && objectActionId && objectCategoryId) {

      console.log(count++, ' ' + url);

      scrapePhone(res, url).then(
        result => {
          let phone2 = '',
            phone3 = '';
          phone = result;
          if (result.split('<span class="block">')) {
            result.split('<span class="block">').join('').split('</span>').forEach((ph, i) => {
              if (ph.trim()) {
                switch (i) {
                  case 0: {
                    phone = ph.trim();
                    break;
                  }
                  case 1: {
                    phone2 = ph.trim();
                    break;
                  }
                  case 2: {
                    phone3 = ph.trim();
                    break;
                  }
                }
              }
            })
          }

          let adObjectToLik = {
            'description': description,
            'price': {
              'price': price.split(' ').join(''),
              'currency': currency,
            },
            'coordinates': {
              'lat': lat,
              'lng': lon,
            },
            'title': title,
            'bargain': bargain,
            'exclusive': false,
            'objectType': {
              'typeId': objectTypeId,
            },
            'objectAction': {
              'actionId': objectActionId,
            },
            'category': {
              'cid': objectCategoryId,
            },
            'images': images,
            'exact': true,
            'objectAttributeValues': objectAttributeValues,
            'user': {
              'name': name,
              'image': nameImage,
              'mainPhone': phone,
              'phone2': phone2,
              'phone3': phone3,
            }
          }
          results.push(adObjectToLik);

          var stmt = db.prepare('INSERT INTO olx VALUES (?, ?, ?)');
          stmt.run(urlId, title, url);
          stmt.finalize();

          saveAd(adObjectToLik).then(
            result => {
              console.log(result);
              console.log('Waiting: ', q.waiting.length, q.waiting);
              cb();
            }
          );
        },
        error => {
          phone = false;
          cb();
        });
    } else {
      // debugger;
      cb();
    }
  });

}

function done() {
  // debugger;
  console.log(results);
}

function doneAreas() {
  // debugger;

}

function donePaginate() {
  // debugger;

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
      url = 'http://www.likimap.com/parsed-add-object',
      // parsedUrl = urlModule.parse(url);
      parsedUrl = {};
    parsedUrl.headers = {
      // 'Cookie': cookies,
      'Content-Type': 'application/json',
    };
    parsedUrl.method = 'POST';
    parsedUrl.uri = url;

    parsedUrl.body = data;

    parsedUrl.json = true;
    rp(parsedUrl, (error, response, body) => {
      if (!error && body) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}