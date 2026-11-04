import {
  getEspecificacionesPorProducto,
  getProductoPorId,
  getProductosPaginado,
} from "@/lib/api/productos";
import { getClientePorId, getClientesPaginado } from "@/lib/api/clientes";
import { listarPedidosPaginado, obtenerPedidoPorId } from "@/lib/api/ordenes";
import {
  getComentarios,
  getResenasPorProducto,
  getTestimoniosPaginado,
  type TipoComentarioFiltro,
} from "@/lib/api/comentarios";
import { toClienteDTO, toOrdenDTO } from "@/lib/api/dto";
import type { ResultadoPaginado } from "@/lib/api/pagination";

const pageInfo = (r: ResultadoPaginado<unknown>) => ({
  page: r.page,
  pageSize: r.pageSize,
  total: r.total,
  totalPages: r.totalPages,
});

type ProductoParent = { id: number };
type ComentarioParent = { clienteId: number };

export const resolvers = {
  Query: {
    async productos(_: unknown, args: { page?: number; pageSize?: number }) {
      const r = await getProductosPaginado(args.page ?? 1, args.pageSize ?? 20);
      return { items: r.items, pageInfo: pageInfo(r) };
    },
    async producto(_: unknown, args: { id: number }) {
      try {
        return await getProductoPorId(args.id);
      } catch {
        return null;
      }
    },
    async clientes(_: unknown, args: { page?: number; pageSize?: number }) {
      const r = await getClientesPaginado(args.page ?? 1, args.pageSize ?? 20);
      return { items: r.items.map(toClienteDTO), pageInfo: pageInfo(r) };
    },
    async cliente(_: unknown, args: { id: number }) {
      try {
        return toClienteDTO(await getClientePorId(args.id));
      } catch {
        return null;
      }
    },
    async ordenes(
      _: unknown,
      args: {
        page?: number;
        pageSize?: number;
        fecha?: string | null;
        clienteId?: number | null;
      },
    ) {
      const r = await listarPedidosPaginado(
        args.page ?? 1,
        args.pageSize ?? 10,
        args.fecha ?? undefined,
        args.clienteId ?? undefined,
      );
      return { items: r.items.map(toOrdenDTO), pageInfo: pageInfo(r) };
    },
    async orden(_: unknown, args: { id: number }) {
      try {
        return toOrdenDTO(await obtenerPedidoPorId(args.id));
      } catch {
        return null;
      }
    },
    async testimonios(_: unknown, args: { page?: number; pageSize?: number }) {
      const r = await getTestimoniosPaginado(
        args.page ?? 1,
        args.pageSize ?? 10,
      );
      return { items: r.items, pageInfo: pageInfo(r) };
    },
    async comentarios(
      _: unknown,
      args: {
        tipo: string;
        productoId?: number | null;
        ordenId?: number | null;
        clienteId?: number | null;
      },
    ) {
      return getComentarios({
        tipo: args.tipo as TipoComentarioFiltro,
        productoId: args.productoId ?? undefined,
        ordenId: args.ordenId ?? undefined,
        clienteId: args.clienteId ?? undefined,
      });
    },
  },

  Producto: {
    especificaciones: (parent: ProductoParent) =>
      getEspecificacionesPorProducto(parent.id),
    async aggregateRating(parent: ProductoParent) {
      const r = await getResenasPorProducto(parent.id);
      return r.total > 0
        ? { ratingValue: r.promedio, reviewCount: r.total }
        : null;
    },
    async resenas(parent: ProductoParent) {
      return (await getResenasPorProducto(parent.id)).items;
    },
  },

  Comentario: {
    async cliente(parent: ComentarioParent) {
      try {
        return toClienteDTO(await getClientePorId(parent.clienteId));
      } catch {
        return null;
      }
    },
  },
};
