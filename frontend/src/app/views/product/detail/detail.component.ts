import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteService} from "../../../shared/services/favourite.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  paramsUrl: string = '';
  cart: CartType | null = null;
  favoriteProducts: FavoriteType[] | null = null;
  recommendedProducts: ProductType[] = [];
  pathImage = environment.serverStaticPathImage;
  detailProduct: ProductType = {
    id: '',
    name: '',
    price: 0,
    image: '',
    lightning: 0,
    humidity: '',
    temperature: '',
    height: 0,
    diameter: 0,
    url: '',
    type: {
      id: '',
      name: '',
      url: ''
    },
    count: 1,
    countInCart: 0,
    isInFavorite: false
  };
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(private productService: ProductService,
              private cartService: CartService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private favoriteService: FavoriteService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .subscribe(params => {
        if (params['url']) {
          this.paramsUrl = params['url'];

          if (this.paramsUrl !== this.detailProduct.url) {
            window.scrollTo(0, 222);
          }

          this.productService.getProduct(this.paramsUrl)
            .subscribe((data: ProductType) => {
              this.detailProduct.count = 1;
              this.detailProduct = data;


              this.cartService.getCart()
                .subscribe((cartData: CartType | DefaultResponseType) => {
                  if ((cartData as DefaultResponseType).error !== undefined) {
                    throw new Error((cartData as DefaultResponseType).message);
                  }
                  this.cart = cartData as CartType
                  const currentProductInCart = this.cart?.items.find(item => item.product.id === this.detailProduct.id);
                  if (currentProductInCart) {
                    this.detailProduct.countInCart = currentProductInCart.quantity;
                    this.detailProduct.count = this.detailProduct.countInCart;
                  } else {
                    this.detailProduct.countInCart = 0;
                    this.detailProduct.count = 1;
                  }
                })

              this.favoriteService.getFavorites()
                .subscribe((data: FavoriteType[] | DefaultResponseType) => {
                  if ((data as DefaultResponseType).error !== undefined) {
                    throw new Error((data as DefaultResponseType).message);
                  }
                  this.favoriteProducts = (data as FavoriteType[]);

                  const currentProductExists = this.favoriteProducts?.find(item => item.id === this.detailProduct.id);
                  this.detailProduct.isInFavorite = !!currentProductExists;
                })

            })
        }
      })

    setTimeout(() => {
      this.getRecommendedProducts();
    }, 500);

    if (this.detailProduct.countInCart && this.detailProduct.countInCart > 1) {
      this.detailProduct.count = this.detailProduct.countInCart;
    }

  }

  getRecommendedProducts() {
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {

        this.recommendedProducts = data.map((product: ProductType) => {
          const productInCart = this.cart?.items.find(item => item.product.id === product.id);
          product.countInCart = productInCart ? productInCart.quantity : 0;

          const productInFavorite = this.favoriteProducts?.find(item => item.id === product.id);
          product.isInFavorite = !!productInFavorite
          return product;
        })
      })
  }

  updateCount(value: number) {
    const product = this.recommendedProducts.find(item => item.url === this.detailProduct.url);

    this.detailProduct.count = value;
    if (this.detailProduct.countInCart) {
      this.cartService.updateCart(this.detailProduct.id, this.detailProduct.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.detailProduct.countInCart = value;
          if (product) {
            product.count = this.detailProduct.count;
          }
        })
    }
  }

  addToCart() {
    const product = this.recommendedProducts.find(item => item.url === this.detailProduct.url);
    const count =  this.detailProduct.count ? this.detailProduct.count : 1;
    this.cartService.updateCart(this.detailProduct.id, count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.detailProduct.countInCart = count;
        if (product) {
          product.countInCart = this.detailProduct.count;
          product.count = product.countInCart;
        }
      })
  }

  removeFromCart() {
    const product = this.recommendedProducts.find(item => item.url === this.detailProduct.url);
    this.cartService.updateCart(this.detailProduct.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.detailProduct.countInCart = 0;
        this.detailProduct.count = 1;
        if (product) {
          product.countInCart = 0;
          product.count = 1;
        }
      })
  }

  updateFavorites() {
    const product = this.recommendedProducts.find(item => item.url === this.detailProduct.url);
    if (this.detailProduct.isInFavorite) {
      this.favoriteService.removeFromFavorites(this.detailProduct.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            this._snackBar.open('Ошибка при удалении товара из избранного');
            throw new Error(data.message)
          }
          this.detailProduct.isInFavorite = false;
          if (product) {
            product.isInFavorite = false;
          }
        })

    } else {
      this.favoriteService.addFavorites(this.detailProduct.id)
        .subscribe((data: FavoriteType[] | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            this._snackBar.open('Не удалось добавить в избранное');
            throw new Error((data as DefaultResponseType).message);
          }
          this.detailProduct.isInFavorite = true;
          if (product) {
            product.isInFavorite = true;
          }
        })
    }
  }

  changesFromProductCard(product: ProductType){
    if(product.id === this.detailProduct.id){
      this.detailProduct.count = product.count;
      this.detailProduct.countInCart = product.countInCart;
      this.detailProduct.isInFavorite = product.isInFavorite;
    }
  }
}
