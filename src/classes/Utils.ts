import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

export type AlphanumericArray = Array<Array<string | number>>

export class Utils {
  exec: Function

  constructor() {
    this.exec = promisify(require('child_process').exec)
  }

  /**
   * Convert Bytes to Megabytes (1 / 1048576) with 4 decimals precision.
   *
   * @param  bytes Number of bytes.
   * @returns Equivalent Megabytes.
   */
  bytesToMegaBytes(bytes: number): string {
    const BYTES_TO_MEGABYTES = 1024 * 1024 // 1048576
    return (bytes / BYTES_TO_MEGABYTES).toFixed(4)
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
        this.bytesToMegaBytes(file.size) + ' MB'
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
}
