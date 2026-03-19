module.exports = {
  apps: [
    {
      name: "mx-brand-logo",
      cwd: "/var/www/mx-brand-logo/web",
      script: "index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
