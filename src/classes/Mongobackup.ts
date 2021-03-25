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

  public async list(): Promise<Table | void> {
    try {
      const snapshots: AlphanumericArray = await this.api.getListOfSnapshots('fundacion')
      const table = new Table({
        head: ['ID', 'Date', 'Size'],
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        style: { 'padding-left': 2, 'padding-right': 2, head: [], border: [] }
      })
      table.push(...snapshots)
      console.log(`You have ${table.length} snapshots for the fundacion database:`)
      console.log(table.toString())
      return table
    } catch (error) {
      console.log('Error', error)
    }
  }

  public async execute(options: program.OptionValues): Promise<void> {
    if (options.list) await this.list()
    else if (options.create) await this.api.createSnapshot('fundacion')
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
