import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentType: PaymentType = PaymentType.cashToCourier;
  paymentTypes = PaymentType;
  cart: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;
  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    fatherName: [''],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: ['']
  })
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(private cartService: CartService,
              private router: Router,
              private orderService: OrderService,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              public dialog: MatDialog,
              private userService: UserService,
              private authService: AuthService) {

    this.updateDeliveryTypeValidation();

  }

  ngOnInit(): void {
    this.getCart();

    if (this.authService.getLoggedIn()) {
      this.getUserInfo();
    }
  }

  getCart() {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = (data as CartType);
        if (!this.cart || (this.cart && this.cart.items.length === 0)) {
          this.router.navigate(['/catalog']);
          this._snackBar.open('Корзина пустая');
          return;
        }
        this.calculateTotal();
      })
  }

  getUserInfo() {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const userData = data as UserInfoType;

        const paramsToUpdate = {
          firstName: userData.firstName ? userData.firstName : '',
          fatherName: userData.fatherName ? userData.fatherName : '',
          lastName: userData.lastName ? userData.lastName : '',
          phone: userData.phone ? userData.phone : '',
          paymentType: userData.paymentType ? userData.paymentType : PaymentType.cashToCourier,
          email: userData.email ? userData.email : '',
          street: userData.street ? userData.street : '',
          house: userData.house ? userData.house : '',
          entrance: userData.entrance ? userData.entrance : '',
          apartment: userData.apartment ? userData.apartment : '',
          comment: '',
        }
        this.deliveryType = userData.deliveryType ? userData.deliveryType : DeliveryType.delivery;
        this.orderForm.setValue(paramsToUpdate);

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

  toggleDelivery(type: DeliveryType) {
    this.deliveryType = type;
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation() {
    if (this.deliveryType === DeliveryType.delivery) {
      this.orderForm.get('street')?.setValidators(Validators.required);
      this.orderForm.get('house')?.setValidators(Validators.required);
    } else {
      this.orderForm.get('street')?.removeValidators(Validators.required);
      this.orderForm.get('house')?.removeValidators(Validators.required);
      this.orderForm.get('street')?.setValue('');
      this.orderForm.get('house')?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }

    this.orderForm.get('street')?.updateValueAndValidity();
    this.orderForm.get('house')?.updateValueAndValidity();
  }

  createOrder() {
    if (this.orderForm.valid && this.orderForm.value.firstName && this.orderForm.value.lastName
      && this.orderForm.value.phone && this.orderForm.value.paymentType && this.orderForm.value.email) {

      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email
      }

      if (this.deliveryType === DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }
        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }
        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }
        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
      }

      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }

      this.orderService.createOrder(paramsObject)
        .subscribe({
          next: (data: OrderType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            this.cartService.setCount(0);
            this.dialogRef = this.dialog.open(this.popup);
            this.dialogRef.backdropClick()
              .subscribe(() => {
                this.router.navigate(['/']);
              })
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка заказа');
            }
          }
        })
    } else {
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните необходимые поля');
    }
  }

  validField(name: string): boolean {
    return !!(this.orderForm.get(name)?.invalid &&
      (this.orderForm.get(name)?.dirty || this.orderForm.get(name)?.touched));
  }

  closePopup() {
    this.dialogRef?.close();
    this.router.navigate(['/']);
  }
}
