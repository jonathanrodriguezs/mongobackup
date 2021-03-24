#!/usr/bin/env node

import { Mongobackup } from './Mongobackup'

const cli = new Mongobackup(process.argv.slice(2))
cli.initialize()
