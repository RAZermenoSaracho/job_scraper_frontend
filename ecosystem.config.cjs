module.exports = {
  apps: [
    {
      name: "job-scraper-frontend",
      cwd: "/Users/razs/production/job_scraper_frontend",
      script: "npm",
      args: "run preview -- --host 127.0.0.1 --port 5180",
      interpreter: "none",
      autorestart: true,
      watch: false,
    },
  ],
};
