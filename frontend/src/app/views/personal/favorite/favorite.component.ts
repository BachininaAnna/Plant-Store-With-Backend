import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favourite.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {environment} from "../../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  favoriteProducts: FavoriteType[] = [];
  cart: CartType | null = null;
  pathImage = environment.serverStaticPathImage;
  count: number = 1;

  constructor(private favoriteService: FavoriteService,
              private _snackBar: MatSnackBar,
              private cartService: CartService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((cartData: CartType | DefaultResponseType) => {
        if ((cartData as DefaultResponseType).error !== undefined) {
          throw new Error((cartData as DefaultResponseType).message);
        }
        this.cart = cartData as CartType;

        this.favoriteService.getFavorites()
          .subscribe((favoriteData: FavoriteType[] | DefaultResponseType) => {
            if ((favoriteData as DefaultResponseType).error !== undefined) {
              throw new Error((favoriteData as DefaultResponseType).message);
            }

            this.favoriteProducts = favoriteData as FavoriteType[];
            this.findFavoriteInCart()

          })
      })
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFromFavorites(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          this._snackBar.open('Ошибка при удалении товара из избранного')
          throw new Error(data.message)
        }
        this.favoriteProducts = this.favoriteProducts.filter(item => item.id !== id);
      })
  }

  updateCountAndCart(productId: string, productCountInCart: number) {
    this.cartService.updateCart(productId, productCountInCart)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;
        this.findFavoriteInCart();
      })
  }

  findFavoriteInCart() {
    if (this.cart && this.cart.items.length) {
      this.favoriteProducts = this.favoriteProducts.map(favoriteProduct => {
        const productInCart = this.cart?.items.find(carItem => carItem.product.id === favoriteProduct.id);
        if (productInCart) {
          favoriteProduct.countInCart = productInCart.quantity;
        } else {
          favoriteProduct.countInCart = 0;
        }
        return favoriteProduct;
      })
    }
  }

}

