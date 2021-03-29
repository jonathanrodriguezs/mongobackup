import { Utils } from '../classes/Utils'

const utils = new Utils()

describe('Convert Bytes', () => {
  it('Should convert propertly to Megabytes', () => {
    const bytes = 1048576
    const megabytes = utils.convertBytes(bytes, 'MB')
    expect(megabytes).toBe('1.0000')
  })
})

describe('Format date D/M/YYYY HH:mm:ss', () => {
  it('Should format properly an individual date and time component values', () => {
    const date = new Date(1970, 0, 1, 1, 1, 0)
    const fmt = utils.getFullDateString(date)
    expect(fmt).toBe('1/1/1970 1:01:00')
  })
  it('Should format properly a timestamp', () => {
    const date = new Date(25260000)
    const fmt = utils.getFullDateString(date)
    expect(fmt).toBe('1/1/1970 1:01:00')
  })
})

describe('Sum size on bytes', () => {
  it('Should sum MB, KB and GB to Bytes', () => {
    const sizes = ['1 MB']
    const sumOnBytes = utils.sumSizesOnBytes(sizes)
    expect(sumOnBytes).toBe(1_048_576)
  })
})
