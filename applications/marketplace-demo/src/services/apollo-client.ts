import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { apiEndpoint } from "@/constants";

const cache = new InMemoryCache()
const link = new HttpLink({
  uri: apiEndpoint,
})

const client = new ApolloClient({
  link,
  cache,
})

export default client
