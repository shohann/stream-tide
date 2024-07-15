import { z } from "zod";

const schema = z.object({});

export type createUserDTO = z.infer<typeof schema>;

export default schema;
