export type ProductType = {
  id: string,
  name: string,
  price: number,
  image: string,
  lightning: number,
  humidity: string,
  temperature: string,
  height: number,
  diameter: number,
  url: string,
  type: {
    id: string,
    name: string,
    url: string,
  },
  count?: number,
  countInCart?: number,
  isInFavorite?: boolean
}
