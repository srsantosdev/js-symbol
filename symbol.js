const assert = require('assert');

// --- keys
const uniqueKey = Symbol('username')
const user = {}

user['username'] = 'value for normal Objects'
user[uniqueKey] = 'value for Symbol'

assert.deepStrictEqual(user.username, 'value for normal Objects')

// SEMPRE UNICO EM NIVEL DE ENDERECO DE MEMORIA
assert.deepStrictEqual(user[uniqueKey], 'value for Symbol')
assert.deepStrictEqual(user[Symbol('username')], undefined)

// DIFICIL DE VER MAS NAO É SECRETO
// console.log('symbols', Object.getOwnPropertySymbols(user))
assert.deepStrictEqual(Object.getOwnPropertySymbols(user), [uniqueKey])

// ByPass - Ma pratica
user[Symbol.for('password')] = 1234
assert.deepStrictEqual(user[Symbol.for('password')], 1234)

// --- keys

// Well known Symbols
const obj = {
  [Symbol.iterator]: () => ({
    items: ['c', 'b', 'a'],
    next() {
      return {
        done: this.items.length === 0,
        value: this.items.pop() // Remove o ultimo elemento e retorna
      }
    }
  })
}

// for (const item of obj) {
//   console.log('item', item.toString())
// }

assert.deepStrictEqual([...obj], ['a', 'b', 'c'])

const kItems = Symbol('kItems')

class MyDate {
  constructor (...args) {
    this[kItems] = args.map(arg => new Date(...arg))
  }

  [Symbol.toPrimitive](coercionType) {
    if (coercionType !== 'string') throw new TypeError()

    const items = this[kItems]
      .map(
        item => new Intl
          .DateTimeFormat('pt-BR', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
          })
          .format(item))

    return new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(items)
  }

  *[Symbol.iterator]() {
    for (const item of this[kItems]) {
      yield item
    }
  }

  async *[Symbol.asyncIterator]() {
    const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

    for(const item of this[kItems]){
      await timeout(100)
      yield item.toISOString()
    }
  }

  get [Symbol.toStringTag]() {
    return 'WHAT?'
  }
}

const myDate = new MyDate(
  [2022, 03, 01],
  [2020, 02, 02]
)

const expectedDates = [
  new Date(2022, 03, 01),
  new Date(2020, 02, 02)
]

assert.deepStrictEqual(Object.prototype.toString.call(myDate), '[object WHAT?]')
assert.throws(() => myDate + 1, TypeError)

// COERCAO EXPLICITA
assert.deepStrictEqual(String(myDate), '01 de abril de 2022 e 02 de março de 2020')

// IMPLEMENTACAO ITERATOR
assert.deepStrictEqual([...myDate], expectedDates)

// ;(async () => {
//   for await(const item of myDate) {
//     console.log('asyncIterator', item)
//   }
// })()

;(async () => {
  const dates = await Promise.all([...myDate])
  assert.deepStrictEqual(dates, expectedDates)
})()