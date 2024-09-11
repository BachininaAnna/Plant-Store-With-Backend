import {OrderStatusType} from "../../../types/order-status.type";

export class OrderStatusUtil {
  static getStatusAndColor(status: string | undefined | null): { name: string; color: string } {

    let name = 'Новый'
    let color = '#456F49';

    switch (status) {
      case OrderStatusType.new:
        name = 'Новый';
        break;
      case OrderStatusType.delivery:
        name = 'Доставка';
        break;
      case OrderStatusType.pending:
        name = 'В ожидании';
        break;
      case OrderStatusType.success:
        name = 'Выполнен';
        color = '#B6D5B9'
        break;
      case OrderStatusType.cancelled:
        name = 'Отменён';
        color = '#FF7575'
        break;
    }

    return {name, color};
  }
}
