import path from 'path'
import { spawn } from 'child_process'
import { Utils } from './Utils'

export interface IBackupService {
  getListOfSnapshots(): Promise<Array<string[]>>
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
    const directory = path.join(this.path, database)
    const filepath: string = path.join(directory, timestamp + '.dump')

    await this.utils.createDirectory(directory)
    spawn('mongodump', ['-d=' + database, '--archive=' + filepath])
  }

  async getListOfSnapshots(): Promise<Array<string[]>> {
    try {
      return [
        ['23445', '23-10-23TZ05:45:30', '34.34KB', '34.34KB', '34.34KB'],
        ['23446', '23-10-24TZ05:45:30', '55.05GB', '34.34KB', '34.34KB'],
        ['43446', '23-10-24TZ05:45:30', '55.05GB', '34.34KB', '34.34KB'],
        ['43236', '23-10-24TZ05:45:30', '55.05GB', '34.34KB', '34.34KB'],
        ['34446', '23-10-24TZ05:45:30', '55.05GB', '34.34KB', '34.34KB']
      ]
    } catch (error) {
      console.log('Caught error', error)
      return []
    }
  }
}
