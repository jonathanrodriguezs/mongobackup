import fs from 'fs'
import path from 'path'
import { AlphanumericArray, Utils } from './Utils'

export interface IBackupService {
  createSnapshot(database: string): Promise<string>
  getListOfSnapshots(database: string): Promise<AlphanumericArray>
  restoreSnapshot(database: string, id: string): Promise<void>
  deleteSnapshot(database: string, id: string): Promise<void>
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

  async getListOfSnapshots(database: string): Promise<AlphanumericArray> {
    try {
      const directory: string = path.join(this.path, database)
      if (!fs.existsSync(directory)) this.utils.createDirectory(directory)

      const files: string[] = fs.readdirSync(directory)
      return files.map(filename => {
        const filepath: string = path.join(directory, filename)
        return this.utils.getFileStats(filepath)
      })
    } catch (error) {
      console.log('Caught error', error)
      return []
    }
  }

  // Create a temporal snapshot of the database (only on safe mode)
  async restoreSnapshot(database: string, id: string): Promise<void> {
    const archive: string = path.join(this.path, database, id + '.dump')

    if (fs.existsSync(archive)) {
      // TODO: What is these commands fails?
      this.utils.executeSync(`mongo ${database} --eval "db.dropDatabase()"`)
      this.utils.executeSync(`mongorestore --archive=${archive}`)
    } else {
      // TODO: Error codes API
      console.log('There is no snapshot with the ID ' + id)
    }
  }

  async deleteSnapshot(database: string, id: string): Promise<void> {
    const archive: string = path.join(this.path, database, id + '.dump')
    if (fs.existsSync(archive)) fs.rmSync(archive)
  }
}
