import { ipfsGatewayUrl } from "@/constants";

export const replaceIpfsWithGatewayUrl = (url: string) => {
  return url.replace('ipfs://', ipfsGatewayUrl + '/')
}
