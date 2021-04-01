#!/usr/bin/env node

import { Mongobackup } from './classes/Mongobackup'

const cli = new Mongobackup(process.argv)
cli.initialize()
