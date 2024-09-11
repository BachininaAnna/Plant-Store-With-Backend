import {DeliveryType} from "./delivery.type";
import {PaymentType} from "./payment.type";

export type UserInfoType = {
  deliveryType?: DeliveryType,
  firstName?: string,
  fatherName?: string
  lastName?: string,
  phone?: string,
  paymentType?: PaymentType,
  email: string,
  street?: string,
  house?: string,
  entrance?: string,
  apartment?: string,
}
