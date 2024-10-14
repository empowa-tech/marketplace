import collectionsData from "@/data/collections.json";
import { useState } from "react";

export const useCollections = () => {
  const [data] = useState(collectionsData);

  return {
    data
  }
}
