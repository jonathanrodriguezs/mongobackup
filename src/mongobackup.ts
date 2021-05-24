import { EOL } from 'os'
import chalk from 'chalk'
import figlet from 'figlet'
import Table from 'cli-table'
import commander, { Command } from 'commander'
import { BackupService } from './backup-service'
import { AlphanumericArray, Utils } from './utils'

export class Mongobackup {
  private program: commander.Command
  private api: BackupService
  private utils: Utils

  constructor(private args: string[]) {
    this.api = new BackupService()
    this.program = new Command('mongobackup')
    this.utils = new Utils()

    this.program
      .version('0.0.1')
      .description('Manage your MongoDB backups during development.')

    this.program
      .command('list <database>')
      .description('List your snapshots for a database')
      .action(database => {
        this.list(database)
      })

    this.program
      .command('create <database>')
      .description('Create a database full snapshot')
      .action(database => {
        this.create(database)
      })

    this.program
      .command('restore <database> <snapshot>')
      .description('Restore a database to a stored snapshot')
      .action((database, snapshot) => {
        this.restore(database, snapshot)
      })

    this.program
      .command('delete <database> <snapshot>')
      .description('Remove a stored snapshot')
      .action((database, snapshot) => {
        this.delete(database, snapshot)
      })
  }

  /**
   * Display the table of snapshots for the selected database.
   *
   * @param database Selected database.
   */
  public async list(database: string): Promise<void> {
    try {
      const data: AlphanumericArray = await this.api.getListOfSnapshots(database)
      const sumOfSizes: number = this.utils.sumSizesOnBytes(<string[]>data.map(x => x[2]))
      const sizeInMB: string = this.utils.convertBytes(sumOfSizes, 'MB')
      const table: Table = this.utils.initializeCliTable(['ID', 'Date', 'Size'], data)

      console.log(`There are ${table.length} snapshots for the "${database}" database:`)
      console.log(table.toString())
      console.log(`Total size of snapshots: ${sizeInMB} MB`)
    } catch (error) {
      this.utils.log(`Error: ${error}`, 'warning')
    }
  }

  /**
   * Create a database snapshot.
   *
   * @param database Selected database.
   */
  public async create(database: string): Promise<void> {
    try {
      this.utils.log(`Creating snapshot for ${database}`, 'process')
      await this.api.createSnapshot(database)
      this.utils.log('Snapshot created successfully', 'success')
    } catch (error) {
      this.utils.log(`Error: ${error}`, 'warning')
    }
  }

  /**
   *
   * @param database
   * @param snapshot
   */
  public async restore(database: string, snapshot: string): Promise<void> {
    try {
      this.utils.log(`Restoring ${snapshot} snapshot for ${database}`, 'process')
      await this.api.restoreSnapshot(database, snapshot)
      this.utils.log('Snapshot restored successfully', 'success')
    } catch (error) {
      this.utils.log(`Error: ${error}`, 'warning')
    }
  }

  /**
   *
   * @param database
   * @param snapshot
   */
  public async delete(database: string, snapshot: string): Promise<void> {
    try {
      this.utils.log(`Deleting ${snapshot} snapshot for ${database}`, 'deletion')
      await this.api.deleteSnapshot(database, snapshot)
      this.utils.log('Snapshot deleted successfully', 'success')
    } catch (error) {
      this.utils.log(`Error: ${error}`, 'warning')
    }
  }

  /**
   * Initialize the CLI: Print the header and execute the passed options.
   */
  public initialize(): void {
    console.log(chalk.green(figlet.textSync('mongobackup')), EOL)
    this.program.parse(this.args)
  }
}
