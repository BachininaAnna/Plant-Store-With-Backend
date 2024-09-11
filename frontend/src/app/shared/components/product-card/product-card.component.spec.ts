import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ProductCardComponent} from "./product-card.component";
import {CartService} from "../../services/cart.service";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {FavoriteService} from "../../services/favourite.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {of} from "rxjs";
import {ProductType} from "../../../../types/product.type";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('product card', () => {
  let productCardComponent: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let product: ProductType;

  beforeEach(() => {

    const cartServiceSpy = jasmine.createSpyObj('CartService', ['updateCart']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', ['removeFromFavorites', 'addFavorites']);
    const _snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);


    TestBed.configureTestingModule({
      declarations: [ProductCardComponent],
      providers: [
        {provide: CartService, useValue: cartServiceSpy},
        {provide: AuthService, useValue: authServiceSpy},
        {provide: Router, useValue: routerSpy},
        {provide: FavoriteService, useValue: favoriteServiceSpy},
        {provide: MatSnackBar, useValue: _snackBarSpy}
      ],
      schemas:[NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ProductCardComponent);
    productCardComponent = fixture.componentInstance;

    product = {
      id: 'test',
      name: 'test',
      price: 1,
      image: 'test',
      lightning: 1,
      humidity: 'test',
      temperature: 'test',
      height: 1,
      diameter: 1,
      url: 'test',
      type: {
        id: 'test',
        name: 'test',
        url: 'test',
      },
      count: 1,
      countInCart: 1,
      isInFavorite: false,
    }
    productCardComponent.product = product;
  });

  it('should call remove from card with count 0', () => {
    let cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;

    cartServiceSpy.updateCart.and.returnValue(of({
      items: [
        {
          product: {
            id: '1',
            name: '1',
            url: '1',
            image: '1',
            price: 1,
          },
          quantity: 1,
        }
      ]

    }));

    productCardComponent.product = product;
    productCardComponent.removeFromCart();

    expect(cartServiceSpy.updateCart).toHaveBeenCalledOnceWith(product.id, 0);

  });

  it('should hide product-card-info product-card-extra if it is light card', function () {
    productCardComponent.isLight = true;

    fixture.detectChanges();

    const componentElem: HTMLElement = fixture.nativeElement
    const productCardInfo: HTMLElement | null = componentElem.querySelector('.product-card-info');
    const productCardExtra: HTMLElement | null = componentElem.querySelector('.product-card-extra');

    expect(productCardInfo).toBe(null);
    expect(productCardExtra).toBe(null);

  });

  it('should call navigate for light card', function () {
    let routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productCardComponent.isLight = true;
    productCardComponent.navigate();

    expect(routerSpy.navigate).toHaveBeenCalled();

  });

  it('should not call navigate for full card', function () {
    let routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productCardComponent.isLight = false;
    productCardComponent.navigate();

    expect(routerSpy.navigate).not.toHaveBeenCalled();

  });
})
