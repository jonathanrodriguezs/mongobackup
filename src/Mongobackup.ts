import chalk from 'chalk'
import figlet from 'figlet'
import program, { CommanderStatic, OptionValues } from 'commander'
import { BackupService } from './BackupService'
import Table from 'cli-table'

export class Mongobackup {
  private program: CommanderStatic
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
      const snapshots: Array<string[]> = await this.api.getListOfSnapshots()
      const table = new Table({
        head: ['ID', 'Date', 'Size', 'Size', 'Size'],
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        style: { 'padding-left': 2, 'padding-right': 2, head: [], border: [] }
      })
      table.push(...snapshots)
      return table
    } catch (error) {
      console.log('Error', error)
    }
  }

  public async execute(options: OptionValues): Promise<void> {
    if (options.list) {
      const table = (await this.list()) as Table
      console.log(`You have ${table.length} snapshots for the fundacion database:`)
      console.log(table.toString())
    } else if (options.create) {
      this.api.createSnapshot('fundacion')
    }
  }

  public initialize(): void {
    const options = this.program.opts()
    this.printHeader()
    this.execute(options)
  }

  public printHeader(): void {
    console.log(chalk.green(figlet.textSync('mongobackup')), '\n')
  }
}
