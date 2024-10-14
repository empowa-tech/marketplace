import { CodegenConfig } from '@graphql-codegen/cli'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAHPQL_API_ENDPOINT as string

const typescriptConfig = {
  namingConvention: {
    typeNames: 'change-case#pascalCase',
    enumValues: 'change-case#pascalCase',
    transformUnderscore: true,
    maybeValue: 'T',
  },
}

const config: CodegenConfig = {
  schema: [GRAPHQL_ENDPOINT],
  documents: ['src/graphql/fragments/**.ts', 'src/graphql/queries/**.ts', 'src/**/query.ts', 'src/**/queries.ts'],
  overwrite: true,
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/graphql/_generated/': {
      preset: 'client',
      config: {
        ...typescriptConfig
      },
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true
      }
    },
  },
}

export default config
