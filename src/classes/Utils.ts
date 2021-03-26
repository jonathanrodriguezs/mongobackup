import fs from 'fs'
import path from 'path'
import { execSync, ChildProcessWithoutNullStreams } from 'child_process'

export type AlphanumericArray = Array<Array<string | number>>

export class Utils {
  executeSync(command: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(execSync(command))
      } catch (error) {
        reject(error)
      }
    })
  }

  bytesToMegaBytes(bytes: number): string {
    const BYTES_TO_MEGABYTES = 1024 * 1024
    return (bytes / BYTES_TO_MEGABYTES).toFixed(4) + ' MB'
  }

  getFullDateString(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  getFileStats(filepath: string) {
    const file: fs.Stats = fs.statSync(filepath)
    return [
      path.parse(filepath).name,
      this.getFullDateString(file.birthtime),
      this.bytesToMegaBytes(file.size)
    ]
  }

  async createDirectory(filepath: string): Promise<void> {
    try {
      const exists = fs.existsSync(filepath)
      if (!exists) fs.mkdirSync(filepath)
    } catch (error) {
      console.log(error)
    }
  }
}
