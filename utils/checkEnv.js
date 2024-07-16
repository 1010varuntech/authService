export const checkEnv = () => {
  const requiredFields = [
    "DBURI",
    "PORT",
    "SUPERTOKENAPIKEY",
    "SUPERTOKENCONNECTIONURI",
    "FEDOMAIN",
    "APIDOMAIN",
    "APPNAME",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
  ];

  for (const field of requiredFields) {
    if (!process.env[field]) {
      console.error(`Please provide a value for ${field}`);
      process.exit(1);
    }
  }
};
