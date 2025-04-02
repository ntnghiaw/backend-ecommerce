const app = require('./src/app')
const { app: { port } } = require('./src/configs/config.mongodb')
const PORT = port || 3000

const server = app.listen(PORT, () => {
  console.log(`eCommerce server starting with port ${PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => console.log('Exist server success'))
})
