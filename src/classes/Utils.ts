import fs from 'fs'
import path from 'path'
import Table from 'cli-table'
import { promisify } from 'util'
import { exec } from 'child_process'

export type AlphanumericArray = Array<Array<string | number>>

enum ByteMultiples {
  B = 1,
  KB = 1024,
  MB = KB * 1024,
  GB = MB * 1024
}

export class Utils {
  exec: Function

  constructor() {
    this.exec = promisify(exec)
  }

  /**
   * Convert Bytes to Kilobytes (KB), Megabytes(MB) or Gigabytes(GB),
   *
   * @param bytes Number of bytes.
   * @param symbol Convertion symbol.
   * @returns Equivalent Megabytes.
   */
  convertBytes(bytes: number, symbol: string): string {
    const convertion: number = bytes / (<any>ByteMultiples)[symbol]
    return convertion.toFixed(4)
  }

  /**
   * Format date D/M/YYYY H:mm:ss.
   *
   * @param date Date object to be formatted.
   * @returns Formatted date string.
   */
  getFullDateString(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  /**
   * Get file stats (name, birth, size).
   *
   * @param filepath Path of the file to be inspected.
   * @param symbol Convertion symbol.
   * @returns Array of file stats [name, birthtime, size].
   */
  async getFileStats(filepath: string, symbol = 'MB'): Promise<Array<string>> {
    try {
      const file: fs.Stats = fs.statSync(filepath)
      return [
        path.parse(filepath).name,
        this.getFullDateString(file.birthtime),
        this.convertBytes(file.size, symbol) + ' ' + symbol
      ]
    } catch (error) {
      console.log(error)
      return []
    }
  }

  /**
   * Create a new directory if does not exists.
   *
   * @param path Path to create directory.
   */
  async createDirectory(path: string): Promise<void> {
    try {
      const exists: boolean = fs.existsSync(path)
      if (!exists) fs.mkdirSync(path)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Reduce an array with files sizes strings to the total of bytes.
   *
   * @param array Array of sizes like: '2.00 GB'
   * @returns Sum of sizes in Kilobytes.
   */
  sumSizesOnBytes(array: Array<string>): number {
    return array.reduce((total: number, item: string) => {
      const [size, symbol] = item.split(' ')
      const sizeOnBytes = +size * (<any>ByteMultiples)[symbol]
      return total + sizeOnBytes
    }, 0)
  }

  /**
   * Initialize a new instance of cli-table main class with custom configuration.
   *
   * @param columns String array of columns.
   * @param data Array of alphanumeric type to fill the table.
   * @returns A new instance of Table, filled with initial data.
   */
  initializeCliTable(columns: string[], data: AlphanumericArray): Table {
    const table = new Table({
      head: columns,
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2, 'padding-right': 2, head: [], border: [] }
    })
    table.push(...data)
    return table
  }
}
