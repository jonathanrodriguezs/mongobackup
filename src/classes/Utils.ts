import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

export type AlphanumericArray = Array<Array<string | number>>

enum ToBytes {
  B = 1,
  KB = 1024,
  MB = KB * 1024,
  GB = MB * 1024
}

export class Utils {
  exec: Function

  constructor() {
    this.exec = promisify(require('child_process').exec)
  }

  /**
   * Convert Bytes to Megabytes (1 / 1048576) with 4 decimals precision.
   *
   * @param bytes Number of bytes.
   * @param symbol
   * @returns Equivalent Megabytes.
   */
  convertBytes(bytes: number, symbol: string): string {
    return (bytes / (<any>ToBytes)[symbol]).toFixed(4)
  }

  /**
   * Format date DD/M/YYYY HH:mm:ss.
   *
   * @param date Date object to be formatted.
   * @returns Formatted string DD/M/YYYY HH:mm:ss.
   */
  getFullDateString(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  /**
   * Get file stats (name, birth, size).
   *
   * @param filepath Path of the file to be inspected.
   * @returns Array of file stats [name, birthdate, size in MB].
   */
  async getFileStats(filepath: string): Promise<Array<string>> {
    try {
      const file: fs.Stats = fs.statSync(filepath)
      return [
        path.parse(filepath).name,
        this.getFullDateString(file.birthtime),
        this.convertBytes(file.size, 'MB') + ' MB'
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
      const exists = fs.existsSync(path)
      if (!exists) fs.mkdirSync(path)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *
   *
   * @param array
   * @returns {number}
   */
  sumSizesOnBytes(array: Array<string>): number {
    return array.reduce((total: number, item: string) => {
      const [size, symbol] = item.split(' ')
      const sizeOnBytes = +size * (<any>ToBytes)[symbol]
      return total + sizeOnBytes
    }, 0)
  }
}
