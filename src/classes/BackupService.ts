import fs from 'fs'
import path from 'path'
import { spawn, execSync } from 'child_process'
import { AlphanumericArray, Utils } from './Utils'

export interface IBackupService {
  getListOfSnapshots(database: string): Promise<AlphanumericArray>
  createSnapshot(database: string): Promise<string>
  dropDatabase(database: string): Promise<void>
  restoreSnapshot(database: string, id: string): Promise<void>
}

export class BackupService implements IBackupService {
  protected path: string
  private utils: Utils

  constructor() {
    this.path = path.resolve(__dirname, 'backups')
    this.utils = new Utils()
    this.utils.createDirectory(this.path)
  }

  async createSnapshot(database: string): Promise<string> {
    const timestamp: number = new Date().getTime()
    const directory: string = path.join(this.path, database)
    const filepath: string = path.join(directory, timestamp + '.dump')

    await this.utils.createDirectory(directory)
    this.utils.executeSync(`mongodump -d=${database} --archive=${filepath}`)
    return filepath
  }

  async dropDatabase(database: string): Promise<void> {
    try {
      this.utils.executeSync(`mongo ${database} --eval "db.dropDatabase()"`)
    } catch (error) {
      console.log('Caught error', error)
    }
  }

  // Create a temporal snapshot of the database (only on safe mode)
  async restoreSnapshot(database: string, id: string): Promise<void> {
    const dump = path.join(this.path, database, id + '.dump')
    if (!fs.existsSync(dump)) return console.log('There is no snapshot with the ID ' + id)
    await this.dropDatabase(database)
    this.utils.executeSync(`mongorestore --archive=${dump}`) // Use -d when restoring BSON
  }

  async getListOfSnapshots(database: string): Promise<AlphanumericArray> {
    try {
      const directory: string = path.join(this.path, database)
      if (!fs.existsSync(directory)) this.utils.createDirectory(directory)
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
