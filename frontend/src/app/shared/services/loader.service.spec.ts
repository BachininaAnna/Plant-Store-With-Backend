import {LoaderService} from "./loader.service";


describe('loader service', () => {
  let loaderService: LoaderService;
  beforeEach(() => {
    loaderService = new LoaderService();
  });

  it('should emit false value for hiding loader', (done: DoneFn) => {
    loaderService.showLoader$.subscribe(value => {
      expect(value).toBe(false);
      done();
    })

    loaderService.hide();
  });

  it('should emit true value for showing loader', (done: DoneFn) => {
    loaderService.showLoader$.subscribe(value => {
      expect(value).toBe(true);
      done();
    })

    loaderService.show();
  });


})
