import { ProductService } from "@core/products/products.service";
import { sendSuccess, sendError } from "../../../src/utils";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "@core/products/products.controller";

jest.mock("@core/products/products.service");
jest.mock("@utils/httpResponses");

const S = ProductService as jest.Mocked<typeof ProductService>;
const success = sendSuccess as jest.MockedFunction<typeof sendSuccess>;
const error = sendError as jest.MockedFunction<typeof sendError>;

const fakeRes: any = {};

describe("Product Controllers", () => {
  beforeEach(() => jest.clearAllMocks());

  const mockDbProduct = (overrides = {}) => ({
    id: 1,
    name: "Producto A",
    code: "C1",
    price: 10,
    stock: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Crear
  it("createProductController → éxito", async () => {
    S.createProduct.mockResolvedValue(mockDbProduct());

    const req: any = {
      body: { name: "A", code: "C1", price: 10, stock: 5 },
    };

    await createProductController(req, fakeRes);

    expect(S.createProduct).toHaveBeenCalledWith(req.body);
    expect(success).toHaveBeenCalled();
  });

  it("createProductController → error", async () => {
    S.createProduct.mockRejectedValue(new Error("fail"));

    const req: any = { body: {} };

    await createProductController(req, fakeRes);

    expect(error).toHaveBeenCalled();
  });

  // Traer todos
  it("getProductsController → éxito", async () => {
    S.getProducts.mockResolvedValue([mockDbProduct()]);

    await getProductsController({} as any, fakeRes);

    expect(S.getProducts).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });

  // Traer por id
  it("getProductByIdController → éxito", async () => {
    S.getProductById.mockResolvedValue(mockDbProduct());

    const req: any = { params: { id: "1" } };

    await getProductByIdController(req, fakeRes);

    expect(S.getProductById).toHaveBeenCalledWith(1);
    expect(success).toHaveBeenCalled();
  });

  // Actualizar
  it("updateProductController → éxito", async () => {
    S.updateProduct.mockResolvedValue(mockDbProduct());

    const req: any = { params: { id: "1" }, body: {} };

    await updateProductController(req, fakeRes);

    expect(S.updateProduct).toHaveBeenCalledWith(1, req.body);
    expect(success).toHaveBeenCalled();
  });

  // Borrar
  it("deleteProductController → éxito", async () => {
    S.deleteProduct.mockResolvedValue(mockDbProduct());

    const req: any = { params: { id: "1" } };

    await deleteProductController(req, fakeRes);

    expect(S.deleteProduct).toHaveBeenCalledWith(1);
    expect(success).toHaveBeenCalled();
  });
});
