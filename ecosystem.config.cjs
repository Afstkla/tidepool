module.exports = {
  apps: [
    {
      name: "tidepool",
      script: "npx",
      args: "tsx server.ts",
      cwd: "/Users/jobnijenhuis/Developer/tidepool",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
