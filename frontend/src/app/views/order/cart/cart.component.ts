import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
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
  products: ProductType[] = [];
  cart: CartType | null = null;
  pathImage = environment.serverStaticPathImage;
  totalAmount: number = 0;
  totalCount: number = 0;

  constructor(private productService: ProductService,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.products = data;
      })

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = (data as CartType);
        this.calculateTotal();
      })

  }

  calculateTotal() {
    this.totalAmount = 0;
    this.totalCount = 0;
    if (this.cart) {
      this.cart.items.forEach(item => {
        this.totalAmount += item.product.price * item.quantity;
        this.totalCount += item.quantity;
      })
    }
  }

  updateCount(id: string, count: number) {
    if(this.cart){
      this.cartService.updateCart(id, count)
        .subscribe((data:CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.cart = (data as CartType);
          this.calculateTotal();
        })
    }

  }

}
