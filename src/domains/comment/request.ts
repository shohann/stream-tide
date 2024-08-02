import { z } from 'zod';

const schema = z.object({

});

export type requestSchema = z.infer<typeof schema>;

export default schema;