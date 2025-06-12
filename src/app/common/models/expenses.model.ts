export interface Expense {
    id?: string;
    date: Date | string;
    category: string;
    account:string;
    type: string;
    amount: number ;
    userId:string;
  }

  export interface  PaymentType{
    id?:string,
    name:string,
    balnce:number,
    userId:string,

      }
  export interface Incomes{
    id?:string,
    date:Date | string,
    account:string,
    category:string,
    amount:number,
    userId:string

  }
export  interface Category {
    id: number;
    name: string;
    type: string;
    subcategories: Subcategory[];
    isOpen: boolean
}

export interface Subcategory {
    id: string; 
    name: string;
    categoryId:string;
    userId:string;
}

export interface Transection{
  id:string;
  name: string;
  date: Date;
  amount: number;
  account:string;
  icon: string;
  type: string; 
  category:string;
}
export interface FieldConfig {
  type: string;
  label: string;
  name: string;
  options?: { value: string, label: string }[];
}
export interface Registration{
  id:string,
  firstName:string,
  Lastname:string,
  email:string,
  password:string,
}
export interface Login{
  email:string,
  password:string,
}
export class User {
  public email: string;
  public id:string;
  public firstName:string;
  public lastName:string;

  constructor( email: string,id:string,firstName:string,lastName:string) {
    this.email = email;
    this.id=id;
    this.firstName=firstName;
    this.lastName=lastName;
  }
}