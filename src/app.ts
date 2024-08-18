import express, { Application, Request, Response } from "express";
import logger from "./libraries/log/logger";
import domainRoutes from "./domains";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";

function defineRoutes(expressApp: Application) {
  logger.info("Defining routes...");
  const router = express.Router();

  domainRoutes(router);

  expressApp.use("/api/v1", router);
  // Health check
  expressApp.get("/health", (req: Request, res: Response) => {
    res.status(200).send("OK");
  });
  // Swagger docs
  expressApp.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // 404
  expressApp.use((req, res) => {
    res.status(404).send("Not Found");
  });
  logger.info("Routes defined");
}

export default defineRoutes;
