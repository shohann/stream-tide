import axios from "axios";
import path from "path";
import fs from "fs";

export async function downloadFileFromCloudinary(
  url: string,
  localFolder: string
): Promise<string> {
  const localPath = path.resolve(localFolder, path.basename(url));
  const response = await axios({
    method: "get",
    url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(localPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(localPath));
    writer.on("error", reject);
  });
}
