import {CartService} from "./cart.service";
import {of} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {TestBed} from "@angular/core/testing";

describe('cart service', () => {
  let cartService: CartService;
  let httpServiceSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {

    httpServiceSpy = jasmine.createSpyObj('HttpClient', ['get']);
    httpServiceSpy.get.and.returnValue(of({count: 3}));

    //cartService = new CartService(httpServiceSpy);

    TestBed.configureTestingModule({
      providers: [
        CartService,
        {
          provide: HttpClient,
          useValue: httpServiceSpy,
        },
      ],
    });

    cartService = TestBed.inject(CartService);


  });

  it('should emit new count value', function (done: DoneFn) {
    cartService.countInCart$.subscribe(value => {
      expect(value).toBe(3);
      done();
    });

    cartService.getCartCount().subscribe();
  });

  it('should make http request for cart data', function (done: DoneFn) {
    cartService.getCart().subscribe(() => {
      expect(httpServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'cart', {withCredentials: true});
      done();
    });
  });

})
