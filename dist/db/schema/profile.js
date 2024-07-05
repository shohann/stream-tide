"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const profile = (0, pg_core_1.pgTable)("profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    state: (0, pg_core_1.varchar)("state", { length: 255 }).notNull()
});
exports.default = profile;
