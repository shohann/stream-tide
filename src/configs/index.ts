import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import schema, { ConfigSchema } from "./config.schema";
import { z } from "zod";
import logger from "../libraries/log/logger";

function checkEnvFileExists(): boolean {
  const rootDir = path.join(__dirname, "..", "..");
  const envFilePath = path.join(rootDir, ".env");
  console.log(envFilePath);

  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Environment file not found: ${envFilePath}`);
  }

  return fs.existsSync(envFilePath);
}

class Config {
  private static instance: Config;
  public config: ConfigSchema; // Use the inferred type

  private constructor() {
    logger.info("Loading and validating config for the first time...");
    this.config = this.loadAndValidateConfig();
    Config.instance = this;
    logger.info("Config loaded and validated", {
      NODE_ENV: this.config.NODE_ENV,
      PORT: this.config.PORT,
    });
    logger.info("Config keys: ", Object.keys(this.config));
  }

  private loadAndValidateConfig(): ConfigSchema {
    // const environment = process.env.NODE_ENV || "development";

    // const envFile = `.env`;
    // console.log("====================");
    // // console.log(process.env.DB_URL);
    // console.log(checkEnvFileExists());
    // console.log("====================");

    const rootDir = path.join(__dirname, "..", "..");
    const envPath = path.join(rootDir, ".env");
    console.log(fs.existsSync(envPath));
    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${envPath}`);
    }
    dotenv.config({ path: envPath });

    // Load config file
    const configFile = path.join(__dirname, "config.json");
    if (!fs.existsSync(configFile)) {
      throw new Error(`Config file not found: ${configFile}`);
    }
    let config = JSON.parse(fs.readFileSync(configFile, "utf8"));

    const finalConfig: any = {};
    for (const key of Object.keys(schema.shape)) {
      if (process.env.hasOwnProperty(key)) {
        finalConfig[key] = process.env[key]; // Prioritize environment variables
      } else if (config.hasOwnProperty(key)) {
        finalConfig[key] = config[key]; // Fallback to config file value
      }
    }

    try {
      const validatedConfig = schema.parse(finalConfig);
      return validatedConfig; // Return the validated config
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors
          .map((err) => `${err.path[0]}: ${err.message}`)
          .join(", ");
        throw new Error(`Config validation error: ${validationErrors}`);
      }
      throw error;
    }
  }

  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

export default Config.getInstance().config;

/// BAD
// import * as dotenv from "dotenv";
// import * as fs from "fs";
// import * as path from "path";
// import schema, { ConfigSchema } from "./config.schema";
// import { z } from "zod";
// import logger from "../libraries/log/logger";

// class Config {
//   private static instance: Config;
//   public config: ConfigSchema; // Use the inferred type

//   private constructor() {
//     logger.info("Loading and validating config for the first time...");
//     this.config = this.loadAndValidateConfig();
//     Config.instance = this;
//     logger.info("Config loaded and validated", {
//       NODE_ENV: this.config.NODE_ENV,
//       PORT: this.config.PORT,
//     });
//     logger.info("Config keys: ", Object.keys(this.config));
//   }

//   private loadAndValidateConfig(): ConfigSchema {
//     // Return type as the inferred type
//     const environment = process.env.NODE_ENV || "development";

//     // Load environment file
//     const envFile = `.env.${environment}`;
//     const envPath = path.join(__dirname, "..", "..", envFile); // Adjusted path
//     if (!fs.existsSync(envPath)) {
//       throw new Error(`Environment file not found: ${envPath}`);
//     }
//     dotenv.config({ path: envPath });

//     // Load config file based on environment
//     const configFile = path.join(__dirname, `config.${environment}.json`);
//     if (!fs.existsSync(configFile)) {
//       throw new Error(`Config file not found: ${configFile}`);
//     }
//     let config = JSON.parse(fs.readFileSync(configFile, "utf8"));

//     const sharedConfigFile = path.join(__dirname, "config.shared.json");
//     if (fs.existsSync(sharedConfigFile)) {
//       const sharedConfig = JSON.parse(
//         fs.readFileSync(sharedConfigFile, "utf8")
//       );
//       config = { ...sharedConfig, ...config };
//     }

//     const finalConfig: any = {};
//     for (const key of Object.keys(schema.shape)) {
//       if (process.env.hasOwnProperty(key)) {
//         finalConfig[key] = process.env[key]; // Prioritize environment variables
//       } else if (config.hasOwnProperty(key)) {
//         finalConfig[key] = config[key]; // Fallback to config file value
//       }
//     }

//     // Validate the config using the Zod schema
//     try {
//       const validatedConfig = schema.parse(finalConfig);
//       return validatedConfig; // Return the validated config
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         const validationErrors = error.errors
//           .map((err) => `${err.path[0]}: ${err.message}`)
//           .join(", ");
//         throw new Error(`Config validation error: ${validationErrors}`);
//       }
//       throw error;
//     }
//   }

//   static getInstance() {
//     if (!Config.instance) {
//       Config.instance = new Config();
//     }
//     return Config.instance;
//   }
// }

// // Export the singleton instance's config
// export default Config.getInstance().config;
