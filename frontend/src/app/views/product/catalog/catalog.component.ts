import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteService} from "../../../shared/services/favourite.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  products: ProductType[] = [];
  categoryWithType: CategoryWithTypeType[] = [];
  activeParams: ActiveParamsType = {types: []};
  appliedFilters: AppliedFilterType[] = [];
  openSorting: boolean = false;
  sortingOptions: { name: string, value: string }[] = [
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'}
  ];
  pages: number[] = [];
  noProductsFound: boolean = false;
  cart: CartType | null = null;
  favoriteProducts: FavoriteType[] | null = null;

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private favoriteService: FavoriteService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = (data as CartType);

        if (this.authService.getLoggedIn()) {
          this.favoriteService.getFavorites()
            .subscribe({
              next: (data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  this.processCatalog();
                  throw new Error((data as DefaultResponseType).message);
                }
                this.favoriteProducts = data as FavoriteType[];
                this.processCatalog();


              },
              error: () => {
                this.processCatalog();
              }
            })
        } else {
          this.processCatalog();
        }
      })
  }

  processCatalog() {
    this.categoryService.getCategoriesWithTypes()
      .subscribe((data: CategoryWithTypeType[]) => {
        this.categoryWithType = data;
        this.activatedRoute.queryParams
          .pipe(
            debounceTime(500)
          )
          .subscribe(params => {

            this.appliedFilters = [];

            this.activeParams = ActiveParamsUtil.processParams(params);
            this.activeParams.types.forEach(url => {
              this.categoryWithType.forEach(item => {
                const foundElem = item.types.find(type => type.url === url);
                if (foundElem) {
                  this.appliedFilters.push({
                    name: foundElem.name,
                    url: url
                  })
                }
              })
            })

            if (this.activeParams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота от ' + this.activeParams.heightFrom + ' см',
                url: 'heightFrom'
              })
            }
            if (this.activeParams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота до ' + this.activeParams.heightTo + ' см',
                url: 'heightTo'
              })
            }
            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Высота от ' + this.activeParams.diameterFrom + ' см',
                url: 'diameterFrom'
              })
            }
            if (this.activeParams.diameterTo) {
              this.appliedFilters.push({
                name: 'Высота до ' + this.activeParams.diameterTo + ' см',
                url: 'diameterTo'
              })
            }

            this.productService.getProducts(this.activeParams)
              .subscribe((data: { totalCount: number, pages: number, items: ProductType[] }) => {
                this.noProductsFound = !data.totalCount;
                this.pages = [];
                if (data.pages) {
                  for (let i = 1; i <= data.pages; i++) {
                    this.pages.push(i);
                  }
                }

                if (this.cart && this.cart.items.length) {
                  this.products = data.items.map(product => {
                    const productInCart = this.cart?.items.find(item => item.product.id === product.id);
                    if (productInCart) {
                      product.countInCart = productInCart.quantity;
                    }
                    return product;
                  })
                } else {
                  this.products = data.items;
                }
                if (this.favoriteProducts) {
                  this.products = this.products.map((product: ProductType) => {
                    const productInFavorite = this.favoriteProducts?.find(item => item.id === product.id);
                    if (productInFavorite) {
                      product.isInFavorite = true;
                    }

                    return product
                  })
                }
              });
          });
      });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (appliedFilter.url === 'heightFrom' || appliedFilter.url === 'heightTo'
      || appliedFilter.url === 'diameterFrom' || appliedFilter.url === 'diameterTo') {

      delete this.activeParams[appliedFilter.url];
    } else {
      this.activeParams.types = this.activeParams.types.filter(item => item !== appliedFilter.url);
    }
    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })

  }

  removeAllFilter() {
    this.router.navigate(['/catalog'], {
      queryParams: {}
    })
  }

  sort(sortingOptionValue: string) {
    this.activeParams.sort = sortingOptionValue;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openPage(page: number) {
    this.activeParams.page = page;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openPrevPage() {
    if (!this.activeParams.page) {
      this.activeParams.page = 1;
    }
    if (this.activeParams.page && this.activeParams.page !== 1) {
      this.activeParams.page--;
    }

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openNextPage() {
    if (!this.activeParams.page) {
      this.activeParams.page = 1;
    }
    if (this.activeParams.page && this.activeParams.page !== this.pages.length) {
      this.activeParams.page++;
    }

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }
}
