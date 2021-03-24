interface IBackupService {
  getListOfSnapshots(): Promise<Array<string[]>>
}

export class BackupService implements IBackupService {
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
