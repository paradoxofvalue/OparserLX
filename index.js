const fs = require('fs');

const osmosis = require('osmosis');
const rp = require('request-promise');

let savedData = [];

let basePropertyUrl = 'https://www.olx.ua/cherkassy/';


let properties = new osmosis.get(basePropertyUrl)
  .delay(1000)
  // .find('#searchmain-container .maincategories .maincategories-list:nth-child(1) .li:nth-child(2) .item')
  .find('#topLink li.visible:nth-child(2)')
  .follow('a')
  .delay(1000)
  .find('#topLink li.visible')
  .follow('a')
  .delay(1000)
  // .find('#locationLinks .locationlinks')
  // .follow('a')
  // .delay(1000)
  .paginate('.pager.rel.clr .fbold.next.abs.large a[href]', 2)
  .delay(1000)
  .set({
    'prevLink': '@href',
  })
  .find('#offers_table td.offer')
  .follow('a.detailsLink.link')
  .set({
    'title': '#offerdescription .offer-titlebox h1',
    'price': '#offerbox .price-label strong',
    'link': '@href',
  })
  .data((data) => {
    console.log(data);
    savedData.push(data);
  })
  // .data(function (data) {
  //   debugger;
  //   console.log(data);
  //   savedData.push(data);
  // })
  .error(console.log)
  .done(function (attr, attr1, attr2, attr3) {
    debugger;
  });

properties.run();
