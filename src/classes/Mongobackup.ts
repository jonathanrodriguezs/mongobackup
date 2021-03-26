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

  public async list(database: string): Promise<Table | void> {
    try {
      const snapshots: AlphanumericArray = await this.api.getListOfSnapshots(database)
      const table = new Table({
        head: ['ID', 'Date', 'Size'],
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        style: { 'padding-left': 2, 'padding-right': 2, head: [], border: [] }
      })
      console.log(
        `There are ${snapshots.length} snapshots for the "${database}" database:`
      )
      table.push(...snapshots)
      console.log(table.toString())
      return table
    } catch (error) {
      console.log('Error', error)
    }
  }

  public async execute(options: program.OptionValues): Promise<void> {
    const database = 'testing'
    const snapshot = '1616737782313'
    if (options.list) await this.list(database)
    else if (options.create) await this.api.createSnapshot(database)
    else if (options.restore) await this.api.restoreSnapshot(database, snapshot)
    else if (options.delete) await this.api.deleteSnapshot(database, snapshot)
  }

  public initialize(): void {
    const options = this.program.opts()
    this.printHeader()
    this.execute({ list: true })
  }

  public printHeader(): void {
    console.log(chalk.green(figlet.textSync('mongobackup')), '\n')
  }
}
