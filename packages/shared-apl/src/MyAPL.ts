import { APL, AuthData, AplReadyResult, AplConfiguredResult } from "@saleor/app-sdk/APL";
import * as fs from "fs";
import * as path from "path";

type FileAPLConfig = {
  fileName?: string;
};

class MyAPL implements APL {
  private fileName: string;

  constructor(config?: FileAPLConfig) {
    this.fileName = config?.fileName || "";
  }

  private loadDataFromFile(): AuthData | undefined {
    try {
      if (fs.existsSync(this.fileName)) {
        const data = fs.readFileSync(this.fileName, "utf-8");
        return JSON.parse(data) as AuthData;
      }
    } catch (error) {
      console.error("Error loading data from file:", error);
    }
    return undefined;
  }

  private saveDataToFile(authData: AuthData): void {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.fileName);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.fileName, JSON.stringify(authData), "utf-8");
    } catch (error) {
      console.error("Error saving data to file:", error);
    }
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const authData = this.loadDataFromFile();
    if (authData && authData.saleorApiUrl === saleorApiUrl) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData): Promise<void> {
    this.saveDataToFile(authData);
  }

  async delete(saleorApiUrl: string): Promise<void> {
    const authData = this.loadDataFromFile();
    if (authData && authData.saleorApiUrl === saleorApiUrl) {
      fs.unlinkSync(this.fileName);
    }
  }

  async getAll(): Promise<AuthData[]> {
    const authData = this.loadDataFromFile();
    return authData ? [authData] : [];
  }

  async isReady(): Promise<AplReadyResult> {
    try {
      const authData = this.loadDataFromFile();
      return { ready: true };
    } catch (error) {
      return { ready: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    try {
      const authData = this.loadDataFromFile();
      return { configured: true };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default MyAPL;
