module.exports = {
  apps: [{
    name: 'easyvate-backend',
    script: 'app.js',
    cwd: '/var/www/easyvate/backend',
    env: {
      DEPLOY_TARGET: 'vps',
      NODE_ENV: 'production'
    }
  }]
};