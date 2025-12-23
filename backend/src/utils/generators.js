import { randomBytes } from "crypto";

export function generateApiKey() {
    return randomBytes(64).toString("hex");
}

export default generateApiKey;