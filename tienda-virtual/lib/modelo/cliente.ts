import { Carrito } from "./carrito";

export interface Cliente {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  ciudad: string;
  pais: string;
  fecha_registro: Date;
  carritos: Carrito[];
}
