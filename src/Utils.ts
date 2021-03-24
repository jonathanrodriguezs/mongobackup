import fs from 'fs'
import { ChildProcessWithoutNullStreams } from 'node:child_process'

export class Utils {
  BYTES_TO_MEGABYTES: number

  constructor() {
    this.BYTES_TO_MEGABYTES = 1024 * 1024
  }

  promiseFromChildProcess(child: ChildProcessWithoutNullStreams) {
    return new Promise(function (resolve, reject) {
      child.addListener('error', reject)
      child.addListener('close', resolve)
    })
  }

  getFilesizeInBytes(filename: string) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
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
