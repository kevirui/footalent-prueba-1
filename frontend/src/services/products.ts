import { apiRequest } from "@/src/lib/apiService";
import { API_BASE_URL } from "@/src/lib/constants";

export type Product = {
  id: number;
  name: string;
  price: number;
  code: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductPayload = {
  name: string;
  price: number;
  code: string;
  stock: number;
};

export type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

type ApiSuccessResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

type ProductListData =
  | Product[]
  | {
      items: Product[];
      meta?: Partial<PaginationMeta>;
    };

const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;

const normalizePaginationMeta = (
  data: ProductListData,
  fallbackPage: number,
  fallbackLimit: number
): { items: Product[]; meta: PaginationMeta } => {
  if (data && typeof data === "object" && "items" in data) {
    const items = data.items ?? [];
    const meta = data.meta ?? {};

    return {
      items,
      meta: {
        page: meta.page ?? fallbackPage,
        limit: meta.limit ?? fallbackLimit,
        totalItems: meta.totalItems ?? items.length,
        totalPages:
          meta.totalPages ??
          Math.max(
            1,
            Math.ceil((meta.totalItems ?? items.length) / (meta.limit ?? fallbackLimit))
          ),
      },
    };
  }

  if (Array.isArray(data)) {
    const totalItems = data.length;
    return {
      items: data,
      meta: {
        page: fallbackPage,
        limit: fallbackLimit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / fallbackLimit)),
      },
    };
  }

  return {
    items: [],
    meta: {
      page: fallbackPage,
      limit: fallbackLimit,
      totalItems: 0,
      totalPages: 1,
    },
  };
};

export async function listProducts({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}): Promise<{ items: Product[]; meta: PaginationMeta; message: string }> {
  
  const response = await apiRequest<ApiSuccessResponse<ProductListData>>(
    PRODUCTS_ENDPOINT
  );

  if (!response.success) {
    throw new Error(response.message || "No fue posible obtener los productos");
  }


  const { items: allItems } = normalizePaginationMeta(
    response.data,
    1,
    Number.MAX_SAFE_INTEGER
  );

  
  let filteredItems = allItems;
  if (search && search.trim().length > 0) {
    const query = search.toLowerCase().trim();
    filteredItems = allItems.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
    );
  }

  
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    meta: {
      page: currentPage,
      limit,
      totalItems,
      totalPages,
    },
    message: response.message,
  };
}

export async function createProduct(
  payload: ProductPayload
): Promise<Product> {
  const response = await apiRequest<ApiSuccessResponse<Product>>(
    PRODUCTS_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success) {
    throw new Error(response.message || "No fue posible crear el producto");
  }

  if (!response.data) {
    throw new Error("La API no retornó el producto creado");
  }

  return response.data;
}

export async function updateProduct(
  id: number,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const response = await apiRequest<ApiSuccessResponse<Product>>(
    `${PRODUCTS_ENDPOINT}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success) {
    throw new Error(response.message || "No fue posible actualizar el producto");
  }

  if (!response.data) {
    throw new Error("La API no retornó el producto actualizado");
  }

  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await apiRequest<ApiSuccessResponse<null>>(
    `${PRODUCTS_ENDPOINT}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(response.message || "No fue posible eliminar el producto");
  }
}