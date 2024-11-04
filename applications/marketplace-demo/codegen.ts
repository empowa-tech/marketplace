import { CodegenConfig } from '@graphql-codegen/cli'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const GRAPHQL_SCHEMA = process.env.NEXT_PUBLIC_GRAHPQL_SCHEMA as string

const typescriptConfig = {
  namingConvention: {
    typeNames: 'change-case#pascalCase',
    enumValues: 'change-case#pascalCase',
    transformUnderscore: true,
    maybeValue: 'T',
  },
}

const config: CodegenConfig = {
  schema: GRAPHQL_SCHEMA,
  documents: ['src/queries/**.ts', 'src/**/queries.ts', 'src/pages/**/*.tsx'],
  overwrite: true,
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        ...typescriptConfig,
      },
    },
  },
}

export default config
