const CryptoJS = require('crypto-js')

export function generateSessionID() {
  const id = CryptoJS.SHA256('#{Math.random() * 10000 }#{Date.now()}#{Math.random() * 1000}').toString(CryptoJS.enc.Hex)
  const ttl = fiveMinutesFromNow()

  return  {id, ttl}
}

export function fiveMinutesFromNow(){
  let d = new Date()
  d.setMinutes(d.getMinutes() + 5)

  return d
}
