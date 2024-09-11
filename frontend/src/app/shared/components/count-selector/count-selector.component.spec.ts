import {CountSelectorComponent} from "./count-selector.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";

describe('count selector', () => {
  let countSelectorComponent: CountSelectorComponent;
  let fixture: ComponentFixture<CountSelectorComponent>;

  beforeEach(() => {
    //countSelectorComponent = new CountSelectorComponent();
    TestBed.configureTestingModule({
      declarations: [CountSelectorComponent],
      imports: [FormsModule],
    })
    fixture = TestBed.createComponent(CountSelectorComponent);
    countSelectorComponent = fixture.componentInstance;
  });

  it('should have count set', () => {
    expect(countSelectorComponent.count).toBeDefined();
  })

  it('should increase count by 1', () => {
    countSelectorComponent.count = 1;
    countSelectorComponent.increase();
    expect(countSelectorComponent.count).toBe(2);
  })

  it('should emit value +1 after increasing', (done: DoneFn) => {
    countSelectorComponent.count = 1;
    countSelectorComponent.countChange.subscribe((count: number) => {
      expect(count).toBe(2);
      done();
    })
    countSelectorComponent.increase();
  })

  it('should emit value -1 after decreasing', (done: DoneFn) => {
    countSelectorComponent.count = 5;
    countSelectorComponent.countChange.subscribe((count: number) => {
      expect(count).toBe(4);
      done();
    })
    countSelectorComponent.decrease();
  })

  it('should change value in input after decreasing', function (done: DoneFn) {
    countSelectorComponent.count = 5;
    countSelectorComponent.decrease();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
        const componentElement: HTMLElement = fixture.nativeElement;
        const input: HTMLInputElement = componentElement.querySelector('input') as HTMLInputElement;

        expect(input.value).toBe('4');
        done();
      }
    )

  });

})
