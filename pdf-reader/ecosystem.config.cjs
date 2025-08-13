module.exports = {
  apps: [
    {
      name: "agf-pdf-reader",
      script: "python",
      args: "-m gunicorn -w 4 -b 0.0.0.0:5001 app:app",
      interpreter: "/home/pinnaclesystems-agf/htdocs/agf.pinnaclesystems.co.in/pdf-reader/myenv/bin/python",
      cwd: "/home/pinnaclesystems-agf/htdocs/agf.pinnaclesystems.co.in/pdf-reader",
      watch: false
    }
  ]
};
