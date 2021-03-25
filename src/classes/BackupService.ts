import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { AlphanumericArray, Utils } from './Utils'

export interface IBackupService {
  getListOfSnapshots(database: string): Promise<AlphanumericArray>
  createSnapshot(database: string): Promise<void>
}

export class BackupService implements IBackupService {
  protected path: string
  private utils: Utils

  constructor() {
    this.path = path.resolve(__dirname, 'backups')
    this.utils = new Utils()
    this.utils.createDirectory(this.path)
  }

  async createSnapshot(database: string): Promise<void> {
    const timestamp: number = new Date().getTime()
    const directory: string = path.join(this.path, database)
    const filepath: string = path.join(directory, timestamp + '.dump')

    await this.utils.createDirectory(directory)
    const process = spawn('mongodump', ['-d=' + database, '--archive=' + filepath])

    // process.stderr.on('data', data => {
    //   console.log(data.toString())
    // })
  }

  async getListOfSnapshots(database: string): Promise<AlphanumericArray> {
    try {
      const directory: string = path.join(this.path, database)
      const files: string[] = fs.readdirSync(directory)
      return files.map(filename => {
        const filepath: string = path.join(directory, filename)
        const file: fs.Stats = fs.statSync(filepath)
        return [
          path.parse(filename).name,
          this.utils.getFullDateString(file.birthtime),
          this.utils.bytesToMegaBytes(file.size)
        ]
      })
    } catch (error) {
      console.log('Caught error', error)
      return []
    }
  }
}
