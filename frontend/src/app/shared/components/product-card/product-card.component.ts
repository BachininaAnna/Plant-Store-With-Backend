import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../services/favourite.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {CartType} from "../../../../types/cart.type";

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  isLogged: boolean = false;
  @Input() product!: ProductType;
  @Output() changesFromProductCard: EventEmitter<ProductType> = new EventEmitter<ProductType>();
  @Input() isLight: boolean = false;
  pathImage = environment.serverStaticPathImage;

  constructor(private cartService: CartService,
              private favoriteService: FavoriteService,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) {
    this.isLogged = this.authService.getLoggedIn();
  }

  ngOnInit(): void {
    if (this.product.countInCart && this.product.countInCart > 1) {
      this.product.count = this.product.countInCart;
    }
  }

  addToCart() {
    const count = this.product.count ? this.product.count : 1;
    this.cartService.updateCart(this.product.id, count)
      .subscribe((data: DefaultResponseType | CartType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = count;
        this.changesFromProductCard.emit(this.product);
      })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = 0;
        this.product.count = 1;
        this.changesFromProductCard.emit(this.product);
      })
  }

  updateCount(value: number) {
    this.product.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.product.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.product.countInCart = this.product.count;
          this.changesFromProductCard.emit(this.product);
        })
    }
  }

  updateFavorites() {
    if (this.product.isInFavorite) {
      this.favoriteService.removeFromFavorites(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            this._snackBar.open('Ошибка при удалении товара из избранного');
            throw new Error(data.message)
          }
          this.product.isInFavorite = false;
          this.changesFromProductCard.emit(this.product);
        })

    } else {
      this.favoriteService.addFavorites(this.product.id)
        .subscribe((data: FavoriteType[] | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            this._snackBar.open('Не удалось добавить в избранное');
            throw new Error((data as DefaultResponseType).message);
          }
          this.product.isInFavorite = true;
          this.changesFromProductCard.emit(this.product);
        })
    }
  }

  valueCount(): number | undefined {
    if (this.product.countInCart && this.product.count &&
      (this.product.countInCart !== this.product.count)) {
      return this.product.count;
    } else {
      return this.product.countInCart;
    }
  }

  navigate() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }

}
