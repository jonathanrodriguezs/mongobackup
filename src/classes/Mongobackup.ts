import { EOL } from 'os'
import chalk from 'chalk'
import figlet from 'figlet'
import Table from 'cli-table'
import program from 'commander'
import { BackupService } from './BackupService'
import { AlphanumericArray, Utils } from './Utils'

export class Mongobackup {
  private program: program.CommanderStatic
  private api: BackupService
  private utils: Utils

  constructor(private args: string[]) {
    this.api = new BackupService()
    this.program = program
      .description('Manage your MongoDB backups during development.')
      .option('-l, --list', 'List your snapshots')
      .option('-c, --create', 'Create a database full snapshot')
      .parse(args)

    this.utils = new Utils()
  }

  /**
   * Log to stdout the table of snapshots for the selected database.
   *
   * @param database Selected database.
   */
  public async list(database: string): Promise<void> {
    try {
      const data: AlphanumericArray = await this.api.getListOfSnapshots(database)
      const sumOfSizes: number = this.utils.sumSizesOnBytes(<string[]>data.map(x => x[2]))
      const sizeInMegabytes: string = this.utils.convertBytes(sumOfSizes, 'MB')
      const table: Table = this.utils.initializeCliTable(['ID', 'Date', 'Size'], data)

      console.log(`There are ${table.length} snapshots for the "${database}" database:`)
      console.log(table.toString())
      console.log(`Total size of snapshots: ${sizeInMegabytes} MB`)
    } catch (error) {
      console.log('Error', error)
    }
  }

  /**
   * Execute one option (list, create, restore or delete).
   *
   * @param options Object with the selected options.
   */
  public async execute(options: program.OptionValues): Promise<void> {
    const database = 'fundacion'
    const snapshot = '1616737782313'

    if (options.list) await this.list(database)
    else if (options.create) await this.api.createSnapshot(database)
    else if (options.restore) await this.api.restoreSnapshot(database, snapshot)
    else if (options.delete) await this.api.deleteSnapshot(database, snapshot)
  }

  /**
   * Initialize the CLI: Print the header and execute the passed options.
   */
  public initialize(): void {
    const options: program.OptionValues = this.program.opts()
    this.printHeader('mongobackup', 'green')
    this.execute({ create: true })
  }

  /**
   * Log to stdout the CLI header.
   *
   * @param text Text to apply ASCII art font.
   * @param color Font color to print the header.
   */
  public printHeader(text: string, color: string): void {
    console.log((<any>chalk)[color](figlet.textSync(text)), EOL)
  }
}
