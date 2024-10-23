import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { API_ENDPOINT } from '@/constants'

const cache = new InMemoryCache()
const link = new HttpLink({
  uri: API_ENDPOINT,
})

const client = new ApolloClient({
  link,
  cache,
})

export default client
