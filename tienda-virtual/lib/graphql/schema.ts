import { createSchema } from "graphql-yoga";
import { resolvers } from "@/lib/graphql/resolvers";
import type { AuthContext } from "@/lib/auth/guard";

export interface GraphQLContext {
  auth: AuthContext;
}

export const typeDefs = /* GraphQL */ `
  type AggregateRating {
    ratingValue: Float!
    reviewCount: Int!
  }

  type Especificacion {
    id: Int!
    clave: String!
    valor: String!
    orden: Int!
  }

  type ResenaProducto {
    id: Int!
    clienteId: Int!
    clienteNombre: String!
    clienteApellidos: String!
    calificacion: Int!
    texto: String!
    fecha: String!
  }

  type Producto {
    id: Int!
    codigo: String!
    nombre: String!
    descripcion: String!
    categoria: String!
    subcategoria: String!
    precio: Float!
    stock: Int!
    especificaciones: [Especificacion!]!
    aggregateRating: AggregateRating
    resenas: [ResenaProducto!]!
  }

  type Cliente {
    id: Int!
    dni: String!
    nombre: String!
    apellidos: String!
    email: String!
    ciudad: String!
    pais: String!
    fechaRegistro: String!
  }

  type Comentario {
    id: Int!
    tipo: String!
    clienteId: Int!
    clienteNombre: String!
    clienteApellidos: String!
    productoId: Int
    ordenId: Int
    calificacion: Int!
    texto: String!
    fecha: String!
    cliente: Cliente
  }

  type Testimonio {
    id: Int!
    clienteId: Int!
    clienteNombre: String!
    clienteApellidos: String!
    clienteCiudad: String!
    clientePais: String!
    calificacion: Int!
    texto: String!
    fecha: String!
  }

  type ItemOrden {
    productoId: Int!
    producto: Producto!
    cantidad: Int!
    subTotal: Float!
  }

  type Orden {
    id: Int!
    numero: String!
    fecha: String!
    subTotal: Float!
    igv: Float!
    total: Float!
    cliente: Cliente!
    items: [ItemOrden!]!
  }

  type PageInfo {
    page: Int!
    pageSize: Int!
    total: Int!
    totalPages: Int!
  }

  type ProductoPage {
    items: [Producto!]!
    pageInfo: PageInfo!
  }

  type ClientePage {
    items: [Cliente!]!
    pageInfo: PageInfo!
  }

  type OrdenPage {
    items: [Orden!]!
    pageInfo: PageInfo!
  }

  type TestimonioPage {
    items: [Testimonio!]!
    pageInfo: PageInfo!
  }

  type Query {
    productos(page: Int = 1, pageSize: Int = 20): ProductoPage!
    producto(id: Int!): Producto
    clientes(page: Int = 1, pageSize: Int = 20): ClientePage!
    cliente(id: Int!): Cliente
    ordenes(
      page: Int = 1
      pageSize: Int = 10
      fecha: String
      clienteId: Int
    ): OrdenPage!
    orden(id: Int!): Orden
    testimonios(page: Int = 1, pageSize: Int = 10): TestimonioPage!
    comentarios(
      tipo: String!
      productoId: Int
      ordenId: Int
      clienteId: Int
    ): [Comentario!]!
  }
`;

export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
