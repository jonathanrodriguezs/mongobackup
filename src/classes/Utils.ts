import fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'node:child_process'

export type AlphanumericArray = Array<Array<string | number>>

export class Utils {
  promiseFromChildProcess(child: ChildProcessWithoutNullStreams) {
    return new Promise(function (resolve, reject) {
      child.addListener('error', reject)
      child.addListener('close', resolve)
    })
  }

  bytesToMegaBytes(bytes: number): string {
    const BYTES_TO_MEGABYTES = 1024 * 1024
    return (bytes / BYTES_TO_MEGABYTES).toFixed(2) + ' MB'
  }

  getFullDateString(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
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
