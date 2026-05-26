export const config = {
  jwtSecret: process.env.JWT_SECRET || "super-secret-key-12345",
  tokenExpiry: parseInt(process.env.TOKEN_EXPIRY || "3600", 10),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: parseInt(process.env.DB_PORT || "5432", 10),
  port: parseInt(process.env.PORT || "3000", 10),
};
