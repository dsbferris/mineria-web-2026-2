import { Cliente } from "@/lib/modelo/cliente";
import { Producto } from "@/lib/modelo/producto";

export type SeedCarrito = {
  id: number;
  nombre: string;
  fecha: string;
  clienteId: number;
  items: Array<{
    id: number;
    productoId: number;
    cantidad: number;
    subTotal: number;
  }>;
};

export type SeedOrden = {
  id: number;
  numero: string;
  carritoId: number;
  fecha: string;
  subTotal: number;
  igv: number;
  total: number;
  items: Array<{
    id: number;
    productoId: number;
    cantidad: number;
    subTotal: number;
  }>;
};

type ClienteSeed = Omit<Cliente, "carritos">;

export const productosSeed: Producto[] = [
  {
    id: 1,
    codigo: "PROD000001",
    descripcion: "Laptop profesional para desarrollo y diseno.",
    categoria: "Electronica",
    subcategoria: "Computo",
    nombre: "Laptop Pro 14",
    precio: 4299.9,
    stock: 8,
  },
  {
    id: 2,
    codigo: "PROD000002",
    descripcion: "Mouse inalambrico ergonomico.",
    categoria: "Electronica",
    subcategoria: "Computo",
    nombre: "Mouse BT Ergo",
    precio: 129.9,
    stock: 40,
  },
  {
    id: 3,
    codigo: "PROD000003",
    descripcion: "Teclado mecanico para escritura y programacion.",
    categoria: "Electronica",
    subcategoria: "Computo",
    nombre: "Teclado Mecanico TKL",
    precio: 319,
    stock: 25,
  },
  {
    id: 4,
    codigo: "PROD000004",
    descripcion: "Monitor 27 pulgadas con panel IPS.",
    categoria: "Electronica",
    subcategoria: "Computo",
    nombre: "Monitor 27 QHD",
    precio: 1199,
    stock: 12,
  },
  {
    id: 5,
    codigo: "PROD000005",
    descripcion: "Audifonos de estudio para videollamadas.",
    categoria: "Electronica",
    subcategoria: "Audio",
    nombre: "Audifonos Studio",
    precio: 349,
    stock: 20,
  },
];

export const clientesSeed: ClienteSeed[] = [
  {
    id: 1,
    dni: "72819911",
    nombre: "Maria",
    apellidos: "Rojas",
    email: "maria.rojas@curso-mineria.local",
    ciudad: "Lima",
    pais: "Peru",
    fecha_registro: new Date("2025-01-10"),
  },
  {
    id: 2,
    dni: "44556677",
    nombre: "Carlos",
    apellidos: "Vargas",
    email: "carlos.vargas@curso-mineria.local",
    ciudad: "Arequipa",
    pais: "Peru",
    fecha_registro: new Date("2025-02-11"),
  },
  {
    id: 3,
    dni: "70112233",
    nombre: "Lucia",
    apellidos: "Paredes",
    email: "lucia.paredes@curso-mineria.local",
    ciudad: "Cusco",
    pais: "Peru",
    fecha_registro: new Date("2025-03-12"),
  },
];

export const carritosSeed: SeedCarrito[] = [
  {
    id: 1,
    nombre: "Carrito de Maria",
    fecha: "2026-05-14",
    clienteId: 1,
    items: [
      { id: 1, productoId: 2, cantidad: 1, subTotal: 129.9 },
      { id: 2, productoId: 3, cantidad: 1, subTotal: 319 },
    ],
  },
  {
    id: 2,
    nombre: "Carrito de Carlos",
    fecha: "2026-05-15",
    clienteId: 2,
    items: [{ id: 3, productoId: 5, cantidad: 2, subTotal: 698 }],
  },
];

export const ordenesSeed: SeedOrden[] = [
  {
    id: 1,
    numero: "OR-00001",
    carritoId: 2,
    fecha: "2026-05-16",
    subTotal: 698,
    igv: 125.64,
    total: 823.64,
    items: [{ id: 1, productoId: 5, cantidad: 2, subTotal: 698 }],
  },
];
