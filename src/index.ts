#!/usr/bin/env node

import { Mongobackup } from './mongobackup'

const cli = new Mongobackup(process.argv)
cli.initialize()
