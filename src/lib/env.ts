const requiredEnvVariables = [
  "DATABASE_URL",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
};
