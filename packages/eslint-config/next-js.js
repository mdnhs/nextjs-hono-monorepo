import next from 'eslint-config-next'
import baseConfig from './base.js'

export default [
  ...baseConfig,
  ...next({
    extensions: ['ts', 'tsx'],
  }),
]
