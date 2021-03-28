import { EOL } from 'os'
import chalk from 'chalk'
import figlet from 'figlet'
import Table from 'cli-table'
import program from 'commander'
import { BackupService } from './BackupService'
import { AlphanumericArray } from './Utils'

export class Mongobackup {
  private program: program.CommanderStatic
  private api: BackupService

  constructor(private args: string[]) {
    this.api = new BackupService()
    this.program = program
      .description('Manage your MongoDB backups during development.')
      .option('-l, --list', 'List your snapshots')
      .option('-c, --create', 'Create a database full snapshot')
      .parse(args)
  }

  /**
   * Log to stdout the table of snapshots for the selected database.
   *
   * @param database Selected database.
   */
  public async list(database: string): Promise<void> {
    try {
      const snapshots: AlphanumericArray = await this.api.getListOfSnapshots(database)
      const table = new Table({
        head: ['ID', 'Date', 'Size'],
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        style: { 'padding-left': 2, 'padding-right': 2, head: [], border: [] }
      })
      table.push(...snapshots)
      console.log(`There are ${table.length} snapshots for the "${database}" database:`)
      console.log(table.toString())
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
   * Initialize the CLI. Printting the header and executing the options.
   */
  public initialize(): void {
    const options = this.program.opts()
    this.printHeader('mongobackup', 'green')
    this.execute(options)
  }

  /**
   * Log the CLI header to stdout.
   *
   * @param text Text to apply ASCII art font alike.
   * @param color Font color to print the header.
   */
  public printHeader(text: string, color: string): void {
    console.log((chalk as any)[color](figlet.textSync(text)), EOL)
  }
}
