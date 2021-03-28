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
  public safeMode: boolean

  constructor(safeMode: boolean = true) {
    this.path = path.resolve(__dirname, 'backups')
    this.utils = new Utils()
    this.safeMode = safeMode

    this.utils.createDirectory(this.path)
  }

  /**
   * Create a full snapshost of the selected database.
   *
   * @param database Database to be backed up.
   * @returns The path of the created snapshot.
   */
  async createSnapshot(database: string): Promise<string> {
    const timestamp: number = new Date().getTime()
    const directory: string = path.join(this.path, database)
    const filepath: string = path.join(directory, timestamp + '.dump')
    const command: string = `mongodump -d=${database} --archive=${filepath}`

    await this.utils.createDirectory(directory)

    const { stdout, stderr } = await this.utils.exec(command)
    console.log(stdout, stderr)

    return filepath
  }

  /**
   * Get the list of snapshosts with its file stats.
   *
   * @param database Database to get the list of snapshots.
   * @returns A matrix with the shape [timestamp, size, date].
   */
  async getListOfSnapshots(database: string): Promise<AlphanumericArray> {
    try {
      const directory: string = path.join(this.path, database)
      if (!fs.existsSync(directory)) this.utils.createDirectory(directory)

      const files: string[] = fs.readdirSync(directory)
      const stats = files.map(filename => {
        const filepath: string = path.join(directory, filename)
        return this.utils.getFileStats(filepath)
      })

      return await Promise.all(stats)
    } catch (error) {
      console.log('Caught error', error)
      return []
    }
  }

  /**
   * Restore a database using the dump of one snapshot.
   *
   * @param database Database to be restored.
   * @param id Snapshot timestamp.
   */
  async restoreSnapshot(database: string, id: string): Promise<void> {
    const archive: string = path.join(this.path, database, id + '.dump')
    // TODO: Create a temporal snapshot of the database (only when safe mode is true).

    if (fs.existsSync(archive)) {
      // TODO: What is these commands fails?
      // execSync(`mongo ${database} --eval "db.dropDatabase()"`)
      // execSync(`mongorestore --archive=${archive}`)
    } else {
      // TODO: Error codes API / Exception handling
      console.log('There is no snapshot with the ID ' + id)
    }
  }

  /**
   * Delete a selected snapshost based on its database and id.
   *
   * @param database Database of the selected snapshot.
   * @param id Selected snapshost to be deleted.
   */
  async deleteSnapshot(database: string, id: string): Promise<void> {
    const archive: string = path.join(this.path, database, id + '.dump')
    if (fs.existsSync(archive)) fs.rmSync(archive)
  }
}
