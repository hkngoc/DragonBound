function secondsRemaining(endDate) {
  return Math.round(Math.abs(Math.round(Date.now() - endDate) / 1000));
}

function pin_code_generador(length, current) {
  current = current ? current : "";
  return length
    ? pin_code_generador(
        --length,
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
          Math.floor(Math.random() * 36)
        ) + current
      )
    : current;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ArrayToObject(a, b) {
  var c;
  var d = b.length;
  var e = {};
  for (c = 0; c < d; c++) {
    e[b[c]] = a[c];
  }
  return e;
}

function Commatize(b) {
  return b.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1,");
}

module.exports = {
  secondsRemaining,
  pin_code_generador,
  getRndInteger,

  ArrayToObject,
  Commatize,
}
