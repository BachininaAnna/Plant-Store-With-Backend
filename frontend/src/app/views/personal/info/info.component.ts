import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {DeliveryType} from "../../../../types/delivery.type";
import {UserService} from "../../../shared/services/user.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentType: PaymentType = PaymentType.cashToCourier;
  paymentTypes = PaymentType;
  infoForm = this.fb.group({
    firstName: [''],
    fatherName: [''],
    lastName: [''],
    phone: [''],
    paymentType: [PaymentType.cashToCourier],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: ['']
  })

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.getUserInfo();

  }

  validField(name: string): boolean {
    return !!(this.infoForm.get(name)?.invalid &&
      (this.infoForm.get(name)?.dirty || this.infoForm.get(name)?.touched));
  }

  toggleDelivery(type: DeliveryType) {
    this.deliveryType = type;
    this.infoForm.markAsDirty();
  }

  updateUserInfo() {
    if (this.infoForm.valid) {

      const paramsObject: UserInfoType = {
        email: this.infoForm.value.email ? this.infoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.infoForm.value.paymentType ? this.infoForm.value.paymentType : PaymentType.cashToCourier,
      }
      if (this.infoForm.value.firstName) {
        paramsObject.firstName = this.infoForm.value.firstName;
      }
      if (this.infoForm.value.fatherName) {
        paramsObject.fatherName = this.infoForm.value.fatherName;
      }
      if (this.infoForm.value.lastName) {
        paramsObject.lastName = this.infoForm.value.lastName;
      }
      if (this.infoForm.value.phone) {
        paramsObject.phone = this.infoForm.value.phone;
      }
      if (this.infoForm.value.street) {
        paramsObject.street = this.infoForm.value.street;
      }
      if (this.infoForm.value.house) {
        paramsObject.house = this.infoForm.value.house;
      }
      if (this.infoForm.value.entrance) {
        paramsObject.entrance = this.infoForm.value.entrance;
      }
      if (this.infoForm.value.apartment) {
        paramsObject.apartment = this.infoForm.value.apartment;
      }

      this.userService.updateUserInfo(paramsObject)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }
            this._snackBar.open('Данные успешно сохранены');
            this.infoForm.markAsPristine();
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка сохранения');
            }
          }
        })
    }

  }

  getUserInfo() {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const userData = data as UserInfoType

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
        }
        this.deliveryType = userData.deliveryType ? userData.deliveryType : DeliveryType.delivery;
        this.infoForm.setValue(paramsToUpdate);

      })
  }

}
