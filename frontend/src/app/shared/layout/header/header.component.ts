import {Component, HostListener, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  searchField = new FormControl();
  searchProducts: ProductType[] = [];
  searchShow: boolean = false;
  isLogged: boolean = false;
  @Input() categories: CategoryWithTypeType[] = [];
  countInCart: number = 0;
  pathImage = environment.serverStaticPathImage;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private cartService: CartService,
              private productService: ProductService) {

    this.isLogged = this.authService.getLoggedIn();
  }

  ngOnInit(): void {

    this.authServiceIsLogged$();
    this.searchFieldValueChanges();
    this.getCartCount();
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.cartService.setCount(0);
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/login']);
  }

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    this.searchField.setValue('');
    this.searchProducts = [];
  }

  getCartCount(){
    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = (data as { count: number }).count;
      })

    this.cartService.countInCart$
      .subscribe(countInCart => {
        this.countInCart = countInCart;
      })
  }
  searchFieldValueChanges(){
    this.searchField.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(value => {

        if (value && value.length > 2) {
          this.productService.searchProducts(value)
            .subscribe((data: ProductType[]) => {
              this.searchProducts = data;
              this.searchShow = true;
            })
        } else {
          this.searchProducts = [];
        }
      })
  }
  authServiceIsLogged$(){
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    })
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    //(event.target as HTMLElement).className.indexOf('search') === -1
    if(this.searchShow && !(event.target as HTMLElement).className.includes('search')){
      this.searchShow = false;
    }
  }

}
